import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { getUser } from "../auth/users.js";
import { config } from "../config.js";
import { atomicWriteJson } from "../fs-atomic.js";
import type {
  Account,
  AccountStatus,
  AccountsStore,
  ApiKeyRecord,
  CreditSnapshot,
  RoutingMode,
  RoutingState,
} from "../types.js";
import { now, randomId } from "../utils.js";

const emptyStore = (): AccountsStore => ({
  version: 2,
  accounts: [],
  apiKeys: [],
  routing: { mode: "auto", currentAccountId: null, cursor: 0 },
});

let writeChain: Promise<void> = Promise.resolve();

async function ensureDataDir(): Promise<void> {
  await mkdir(config.dataDir, { recursive: true });
}

function migrate(raw: unknown): AccountsStore {
  if (!raw || typeof raw !== "object") return emptyStore();
  const o = raw as Record<string, unknown>;
  const accounts = Array.isArray(o.accounts) ? (o.accounts as Account[]) : [];
  const apiKeys = Array.isArray(o.apiKeys) ? (o.apiKeys as ApiKeyRecord[]) : [];
  const routingIn = (o.routing as Partial<RoutingState> | undefined) ?? {};
  const cursor = typeof o.cursor === "number" ? o.cursor : (routingIn.cursor ?? 0);
  return {
    version: 2,
    accounts,
    apiKeys,
    routing: {
      mode: routingIn.mode === "manual" ? "manual" : "auto",
      currentAccountId: routingIn.currentAccountId ?? null,
      cursor,
    },
  };
}

export async function loadStore(): Promise<AccountsStore> {
  await ensureDataDir();
  try {
    const raw = await readFile(config.authFile, "utf8");
    return migrate(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

export async function saveStore(store: AccountsStore): Promise<void> {
  await ensureDataDir();
  await atomicWriteJson(config.authFile, { ...store, version: 2 });
}

/** Serialize mutations to avoid races */
async function mutate<T>(fn: (store: AccountsStore) => Promise<T> | T): Promise<T> {
  let result!: T;
  const run = writeChain.then(async () => {
    const store = await loadStore();
    result = await fn(store);
    await saveStore(store);
  });
  // Keep chain alive even if one write fails
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  await run;
  return result;
}

// ---------- Accounts ----------

export async function listAccounts(): Promise<Account[]> {
  return (await loadStore()).accounts;
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return (await loadStore()).accounts.find((a) => a.id === id);
}

export async function listAccountsByDonor(userId: string): Promise<Account[]> {
  return (await loadStore()).accounts.filter((a) => a.donorUserId === userId);
}

function slugUsername(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return s || "user";
}

function normalizeAllowedUserIds(v: unknown): string[] | null {
  if (v == null) return null;
  if (!Array.isArray(v)) return null;
  const ids = [
    ...new Set(
      v
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean),
    ),
  ];
  return ids.length ? ids : null;
}

export async function addAccount(input: {
  name?: string;
  access: string;
  refresh: string;
  expires: number;
  donorUserId?: string | null;
  private?: boolean;
  allowedUserIds?: string[] | null;
}): Promise<Account> {
  let donorSlug = "";
  if (input.donorUserId) {
    const donor = await getUser(input.donorUserId);
    donorSlug = slugUsername(donor?.username || input.donorUserId.slice(0, 6));
  }
  return mutate((store) => {
    const t = now();
    let name = input.name?.trim() || "";
    if (!name) {
      if (input.donorUserId) {
        const n = store.accounts.filter((a) => a.donorUserId === input.donorUserId).length + 1;
        name = `contrib-${donorSlug || "user"}-${n}`;
      } else {
        name = `account-${store.accounts.length + 1}`;
      }
    }
    const account: Account = {
      id: randomId(8),
      name,
      status: "active",
      tokens: {
        access: input.access,
        refresh: input.refresh,
        expires: input.expires,
      },
      createdAt: t,
      updatedAt: t,
      useCount: 0,
      donorUserId: input.donorUserId ?? null,
      private: input.private === true,
      allowedUserIds: sanitizeAllowedUserIds(
        input.allowedUserIds,
        input.donorUserId ?? null,
      ),
    };
    store.accounts.push(account);
    if (!store.routing.currentAccountId && isPublicPoolAccount(account)) {
      store.routing.currentAccountId = account.id;
    }
    return account;
  });
}

export async function updateAccount(
  id: string,
  patch: Partial<
    Pick<
      Account,
      | "name"
      | "status"
      | "note"
      | "lastError"
      | "lastUsedAt"
      | "useCount"
      | "tokens"
      | "credits"
      | "donorUserId"
      | "private"
      | "allowedUserIds"
    >
  >,
): Promise<Account | undefined> {
  return mutate((store) => {
    const idx = store.accounts.findIndex((a) => a.id === id);
    if (idx < 0) return undefined;
    const cur = store.accounts[idx]!;
    const next: Account = {
      ...cur,
      ...patch,
      tokens: patch.tokens ?? cur.tokens,
      credits: patch.credits !== undefined ? patch.credits : cur.credits,
      private: patch.private !== undefined ? Boolean(patch.private) : cur.private === true,
      updatedAt: now(),
    };
    if (patch.donorUserId !== undefined) {
      next.donorUserId = patch.donorUserId || null;
    }
    if (patch.allowedUserIds !== undefined) {
      const donorId =
        patch.donorUserId !== undefined
          ? patch.donorUserId || null
          : cur.donorUserId ?? null;
      next.allowedUserIds = sanitizeAllowedUserIds(patch.allowedUserIds, donorId);
    } else if (patch.donorUserId !== undefined && next.allowedUserIds) {
      // donor changed — drop new donor from extra allowlist if present
      next.allowedUserIds = sanitizeAllowedUserIds(
        next.allowedUserIds,
        next.donorUserId ?? null,
      );
    }
    store.accounts[idx] = next;
    return store.accounts[idx];
  });
}

/** Non-empty allowlist of *extra* users who may use this seat (donor always can). */
export function hasAllowedUsers(acc: Account): boolean {
  return Array.isArray(acc.allowedUserIds) && acc.allowedUserIds.length > 0;
}

/** Whether caller is the account donor/contributor. */
export function isAccountDonor(
  acc: Account,
  callerUserId: string | null | undefined,
): boolean {
  return Boolean(callerUserId && acc.donorUserId && acc.donorUserId === callerUserId);
}

/** Whether caller is on the account allowlist (extra members, not including donor rule). */
export function isUserAllowedOnAccount(
  acc: Account,
  callerUserId: string | null | undefined,
): boolean {
  if (!hasAllowedUsers(acc) || !callerUserId) return false;
  return acc.allowedUserIds!.includes(callerUserId);
}

/**
 * Whether caller may use this account for routing.
 * - Donor always can (cannot be revoked via allowlist).
 * - Allowlist seats: only listed users (+ donor).
 * - Private without allowlist: donor only.
 * - Public without allowlist: anyone.
 */
export function canUserUseAccount(
  acc: Account,
  callerUserId: string | null | undefined,
): boolean {
  if (isAccountDonor(acc, callerUserId)) return true;
  if (hasAllowedUsers(acc)) {
    return isUserAllowedOnAccount(acc, callerUserId);
  }
  if (acc.private === true) return false;
  return true;
}

/** Shared/public pool only — never private or allowlist-restricted seats. */
export function isPublicPoolAccount(acc: Account): boolean {
  return acc.private !== true && !hasAllowedUsers(acc);
}

/**
 * Accounts eligible for a caller's route scope.
 * - public: shared seats + allowlisted seats + own donations
 * - mine: donated by caller, or caller is on allowedUserIds
 * - account: single id if allowed
 */
export function filterAccountsForCaller(
  accounts: Account[],
  opts: {
    callerUserId?: string | null;
    scope?: "public" | "mine" | "account";
    accountId?: string | null;
  },
): Account[] {
  const scope = opts.scope ?? "public";
  const uid = opts.callerUserId ?? null;

  if (scope === "account" && opts.accountId) {
    const acc = accounts.find((a) => a.id === opts.accountId);
    if (!acc) return [];
    if (!canUserUseAccount(acc, uid)) return [];
    return [acc];
  }

  if (scope === "mine") {
    if (!uid) return [];
    return accounts.filter(
      (a) => a.donorUserId === uid || isUserAllowedOnAccount(a, uid),
    );
  }

  // public shared seats + seats where caller is an extra allowlisted member
  // (donor private/allowlist seats stay under mine/account scope)
  return accounts.filter(
    (a) => isPublicPoolAccount(a) || isUserAllowedOnAccount(a, uid),
  );
}

/**
 * Normalize allowlist: unique ids, drop empty, never store donor as "extra"
 * (donor access is always granted separately).
 */
export function sanitizeAllowedUserIds(
  ids: string[] | null | undefined,
  donorUserId?: string | null,
): string[] | null {
  const cleaned = normalizeAllowedUserIds(ids);
  if (!cleaned) return null;
  if (!donorUserId) return cleaned;
  const withoutDonor = cleaned.filter((id) => id !== donorUserId);
  return withoutDonor.length ? withoutDonor : null;
}

export async function deleteAccount(id: string): Promise<boolean> {
  return mutate((store) => {
    const before = store.accounts.length;
    store.accounts = store.accounts.filter((a) => a.id !== id);
    if (store.accounts.length === before) return false;
    if (store.routing.currentAccountId === id) {
      // global current must stay on a public active seat
      store.routing.currentAccountId =
        store.accounts.find((a) => a.status === "active" && isPublicPoolAccount(a))?.id ?? null;
    }
    if (store.routing.cursor >= store.accounts.length) store.routing.cursor = 0;
    return true;
  });
}

export async function markStatus(
  id: string,
  status: AccountStatus,
  lastError?: string,
): Promise<void> {
  await updateAccount(id, { status, lastError });
}

export async function markUsed(id: string): Promise<void> {
  const acc = await getAccount(id);
  if (!acc) return;
  await updateAccount(id, {
    lastUsedAt: now(),
    useCount: acc.useCount + 1,
    lastError: undefined,
  });
}

export async function setCredits(id: string, credits: CreditSnapshot): Promise<void> {
  const patch: Partial<Account> = { credits };
  if (credits.remainingPercent <= 0.5) {
    patch.status = "exhausted";
    patch.lastError = `额度已用尽 (${credits.creditUsagePercent.toFixed(1)}%)`;
  } else if (credits.remainingPercent > 0.5) {
    const acc = await getAccount(id);
    if (acc?.status === "exhausted") {
      patch.status = "active";
      patch.lastError = undefined;
    }
  }
  await updateAccount(id, patch);
}

// ---------- Routing ----------

export async function getRouting(): Promise<RoutingState> {
  return (await loadStore()).routing;
}

export async function setRoutingMode(mode: RoutingMode): Promise<RoutingState> {
  return mutate((store) => {
    store.routing.mode = mode;
    return { ...store.routing };
  });
}

export async function setCurrentAccount(id: string | null): Promise<RoutingState> {
  return mutate((store) => {
    if (id) {
      const acc = store.accounts.find((a) => a.id === id);
      if (!acc) throw new Error(`account not found: ${id}`);
      // Global admin routing is the public pool — restricted seats cannot be selected
      if (!isPublicPoolAccount(acc)) {
        throw new Error("不能将私有/限定账号设为公共池当前账号，请改用公开账号");
      }
    }
    store.routing.currentAccountId = id;
    if (id) store.routing.mode = "manual";
    return { ...store.routing };
  });
}

/** Advance RR cursor and set current to next active account (auto mode). */
export async function advanceToNextActive(
  excludeId?: string,
  eligibleIds?: string[] | null,
): Promise<Account | undefined> {
  return mutate((store) => {
    // Default (no eligibleIds) = public pool only — never rotate onto private/allowlist seats
    const pool =
      eligibleIds && eligibleIds.length > 0
        ? store.accounts.filter((a) => eligibleIds.includes(a.id))
        : store.accounts.filter((a) => isPublicPoolAccount(a));
    const n = pool.length;
    if (n === 0) {
      if (!eligibleIds) store.routing.currentAccountId = null;
      return undefined;
    }
    // cursor is over full store length historically; map into eligible pool
    const start = Math.abs(store.routing.cursor) % n;
    for (let i = 0; i < n; i++) {
      const idx = (start + i) % n;
      const acc = pool[idx]!;
      if (acc.status !== "active") continue;
      if (excludeId && acc.id === excludeId) continue;
      store.routing.cursor = (store.routing.cursor + 1) % Math.max(1, store.accounts.length);
      // only write global current when selecting a public seat
      if (isPublicPoolAccount(acc)) store.routing.currentAccountId = acc.id;
      return acc;
    }
    const any = pool.find((a) => a.status === "active");
    if (any && isPublicPoolAccount(any)) store.routing.currentAccountId = any.id;
    return any;
  });
}

export async function ensureCurrentAccount(
  eligibleIds?: string[] | null,
): Promise<Account | undefined> {
  const store = await loadStore();
  const curId = store.routing.currentAccountId;
  if (curId) {
    const acc = store.accounts.find((a) => a.id === curId);
    if (acc && acc.status === "active") {
      // stale: current points at restricted seat — skip for public/default routing
      const inEligible = eligibleIds
        ? eligibleIds.includes(acc.id)
        : isPublicPoolAccount(acc);
      if (inEligible) return acc;
    }
  }
  return advanceToNextActive(undefined, eligibleIds);
}

// ---------- API Keys ----------

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const raw = randomBytes(24).toString("base64url");
  const key = `gk_${raw}`;
  const prefix = `${key.slice(0, 12)}…${key.slice(-4)}`;
  return { key, prefix, hash: hashApiKey(key) };
}

export async function listApiKeys(userId?: string | null): Promise<ApiKeyRecord[]> {
  const keys = (await loadStore()).apiKeys;
  if (userId == null || userId === "") return keys;
  return keys.filter((k) => k.userId === userId);
}

export async function createApiKey(input: {
  alias: string;
  expiresAt?: number | null;
  note?: string;
  userId?: string | null;
}): Promise<{ record: ApiKeyRecord; key: string }> {
  const { key, prefix, hash } = generateApiKey();
  const record = await mutate((store) => {
    const t = now();
    const rec: ApiKeyRecord = {
      id: randomId(8),
      keyHash: hash,
      keyPrefix: prefix,
      alias: input.alias.trim() || `key-${store.apiKeys.length + 1}`,
      enabled: true,
      createdAt: t,
      updatedAt: t,
      expiresAt: input.expiresAt ?? null,
      useCount: 0,
      note: input.note,
      userId: input.userId ?? null,
    };
    store.apiKeys.push(rec);
    return rec;
  });
  return { record, key };
}

export async function getApiKey(id: string): Promise<ApiKeyRecord | undefined> {
  return (await loadStore()).apiKeys.find((k) => k.id === id);
}

export async function updateApiKey(
  id: string,
  patch: Partial<Pick<ApiKeyRecord, "alias" | "enabled" | "expiresAt" | "note">>,
): Promise<ApiKeyRecord | undefined> {
  return mutate((store) => {
    const idx = store.apiKeys.findIndex((k) => k.id === id);
    if (idx < 0) return undefined;
    store.apiKeys[idx] = {
      ...store.apiKeys[idx]!,
      ...patch,
      updatedAt: now(),
    };
    return store.apiKeys[idx];
  });
}

export async function deleteApiKey(id: string): Promise<boolean> {
  return mutate((store) => {
    const before = store.apiKeys.length;
    store.apiKeys = store.apiKeys.filter((k) => k.id !== id);
    return store.apiKeys.length < before;
  });
}

export async function verifyApiKey(
  key: string,
): Promise<{ ok: true; record: ApiKeyRecord } | { ok: false; reason: string }> {
  const store = await loadStore();
  if (store.apiKeys.length === 0) {
    // no keys configured → open access
    return { ok: true, record: null as unknown as ApiKeyRecord };
  }
  const hash = hashApiKey(key);
  const rec = store.apiKeys.find((k) => {
    try {
      const a = Buffer.from(k.keyHash, "hex");
      const b = Buffer.from(hash, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return k.keyHash === hash;
    }
  });
  if (!rec) return { ok: false, reason: "invalid_api_key" };
  if (!rec.enabled) return { ok: false, reason: "api_key_disabled" };
  if (rec.expiresAt && rec.expiresAt <= now()) return { ok: false, reason: "api_key_expired" };

  // bump usage async-safe
  await mutate((s) => {
    const k = s.apiKeys.find((x) => x.id === rec.id);
    if (k) {
      k.lastUsedAt = now();
      k.useCount += 1;
    }
  });
  return { ok: true, record: rec };
}

export function publicAccount(a: Account, currentId?: string | null) {
  return {
    id: a.id,
    name: a.name,
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    lastUsedAt: a.lastUsedAt,
    useCount: a.useCount,
    lastError: a.lastError,
    note: a.note,
    expiresAt: a.tokens.expires,
    hasRefresh: Boolean(a.tokens.refresh),
    isCurrent: currentId ? a.id === currentId : false,
    donorUserId: a.donorUserId ?? null,
    private: a.private === true,
    allowedUserIds: hasAllowedUsers(a) ? [...(a.allowedUserIds || [])] : [],
    credits: a.credits
      ? {
          creditUsagePercent: a.credits.creditUsagePercent,
          remainingPercent: a.credits.remainingPercent,
          periodType: a.credits.periodType,
          periodStart: a.credits.periodStart,
          periodEnd: a.credits.periodEnd,
          productUsage: a.credits.productUsage,
          prepaidBalance: a.credits.prepaidBalance,
          checkedAt: a.credits.checkedAt,
          subscriptionTier: a.credits.subscriptionTier,
        }
      : null,
  };
}

export function publicApiKey(k: ApiKeyRecord) {
  return {
    id: k.id,
    keyPrefix: k.keyPrefix,
    alias: k.alias,
    enabled: k.enabled,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
    expiresAt: k.expiresAt,
    lastUsedAt: k.lastUsedAt,
    useCount: k.useCount,
    note: k.note,
    userId: k.userId ?? null,
    expired: k.expiresAt != null && k.expiresAt <= now(),
  };
}

/** Leaderboard entry for contributors (excludes admin donors). */
export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  /** Total contributed seats */
  count: number;
  /** Public (shared-pool) seats */
  publicCount: number;
  /** Private seats */
  privateCount: number;
  activeCount: number;
  isMe: boolean;
};

type DonorCounts = {
  count: number;
  publicCount: number;
  privateCount: number;
  activeCount: number;
};

function rankEntries(
  counts: Map<string, DonorCounts>,
  meUserId: string | null,
  usernameById: Map<string, string>,
  sortKey: "count" | "publicCount",
): LeaderboardEntry[] {
  return [...counts.entries()]
    .map(([userId, c]) => ({
      userId,
      username: usernameById.get(userId) ?? userId.slice(0, 6),
      count: c.count,
      publicCount: c.publicCount,
      privateCount: c.privateCount,
      activeCount: c.activeCount,
    }))
    .filter((e) => (sortKey === "publicCount" ? e.publicCount > 0 : e.count > 0))
    .sort(
      (a, b) =>
        b[sortKey] - a[sortKey] ||
        b.count - a.count ||
        a.username.localeCompare(b.username),
    )
    .map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      username: e.username,
      count: e.count,
      publicCount: e.publicCount,
      privateCount: e.privateCount,
      activeCount: e.activeCount,
      isMe: meUserId != null && e.userId === meUserId,
    }));
}

export async function buildLeaderboard(
  meUserId: string | null,
  adminUserIds: Set<string>,
  usernameById: Map<string, string>,
): Promise<{
  /** Total contribution board (public + private seats) */
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  totalContributors: number;
  totalDonated: number;
  totalPublic: number;
  totalPrivate: number;
  /** Public-only contribution board */
  publicEntries: LeaderboardEntry[];
  publicMe: LeaderboardEntry | null;
  publicContributors: number;
  publicDonated: number;
}> {
  const accounts = await listAccounts();
  const counts = new Map<string, DonorCounts>();
  let totalDonated = 0;
  let totalPublic = 0;
  let totalPrivate = 0;

  for (const a of accounts) {
    const uid = a.donorUserId;
    if (!uid || adminUserIds.has(uid)) continue;
    totalDonated += 1;
    const isPriv = a.private === true || hasAllowedUsers(a);
    if (isPriv) totalPrivate += 1;
    else totalPublic += 1;
    const cur = counts.get(uid) ?? {
      count: 0,
      publicCount: 0,
      privateCount: 0,
      activeCount: 0,
    };
    cur.count += 1;
    if (isPriv) cur.privateCount += 1;
    else cur.publicCount += 1;
    if (a.status === "active") cur.activeCount += 1;
    counts.set(uid, cur);
  }

  const entries = rankEntries(counts, meUserId, usernameById, "count");
  const publicEntries = rankEntries(counts, meUserId, usernameById, "publicCount");
  const me = meUserId ? entries.find((e) => e.userId === meUserId) ?? null : null;
  const publicMe = meUserId
    ? publicEntries.find((e) => e.userId === meUserId) ?? null
    : null;

  return {
    entries,
    me,
    totalContributors: entries.length,
    totalDonated,
    totalPublic,
    totalPrivate,
    publicEntries,
    publicMe,
    publicContributors: publicEntries.length,
    publicDonated: totalPublic,
  };
}
