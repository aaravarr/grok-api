import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
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
  const payload = JSON.stringify({ ...store, version: 2 }, null, 2);
  const tmp = `${config.authFile}.${process.pid}.tmp`;
  await writeFile(tmp, payload, "utf8");
  await rename(tmp, config.authFile);
}

/** Serialize mutations to avoid races */
async function mutate<T>(fn: (store: AccountsStore) => Promise<T> | T): Promise<T> {
  let result!: T;
  writeChain = writeChain.then(async () => {
    const store = await loadStore();
    result = await fn(store);
    await saveStore(store);
  });
  await writeChain;
  return result;
}

// ---------- Accounts ----------

export async function listAccounts(): Promise<Account[]> {
  return (await loadStore()).accounts;
}

export async function getAccount(id: string): Promise<Account | undefined> {
  return (await loadStore()).accounts.find((a) => a.id === id);
}

export async function addAccount(input: {
  name?: string;
  access: string;
  refresh: string;
  expires: number;
}): Promise<Account> {
  return mutate((store) => {
    const t = now();
    const account: Account = {
      id: randomId(8),
      name: input.name?.trim() || `account-${store.accounts.length + 1}`,
      status: "active",
      tokens: {
        access: input.access,
        refresh: input.refresh,
        expires: input.expires,
      },
      createdAt: t,
      updatedAt: t,
      useCount: 0,
    };
    store.accounts.push(account);
    if (!store.routing.currentAccountId) {
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
    >
  >,
): Promise<Account | undefined> {
  return mutate((store) => {
    const idx = store.accounts.findIndex((a) => a.id === id);
    if (idx < 0) return undefined;
    const cur = store.accounts[idx]!;
    store.accounts[idx] = {
      ...cur,
      ...patch,
      tokens: patch.tokens ?? cur.tokens,
      credits: patch.credits !== undefined ? patch.credits : cur.credits,
      updatedAt: now(),
    };
    return store.accounts[idx];
  });
}

export async function deleteAccount(id: string): Promise<boolean> {
  return mutate((store) => {
    const before = store.accounts.length;
    store.accounts = store.accounts.filter((a) => a.id !== id);
    if (store.accounts.length === before) return false;
    if (store.routing.currentAccountId === id) {
      store.routing.currentAccountId = store.accounts.find((a) => a.status === "active")?.id ?? null;
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
    if (id && !store.accounts.some((a) => a.id === id)) {
      throw new Error(`account not found: ${id}`);
    }
    store.routing.currentAccountId = id;
    if (id) store.routing.mode = "manual";
    return { ...store.routing };
  });
}

/** Advance RR cursor and set current to next active account (auto mode). */
export async function advanceToNextActive(excludeId?: string): Promise<Account | undefined> {
  return mutate((store) => {
    const n = store.accounts.length;
    if (n === 0) {
      store.routing.currentAccountId = null;
      return undefined;
    }
    const start = store.routing.cursor % n;
    for (let i = 0; i < n; i++) {
      const idx = (start + i) % n;
      const acc = store.accounts[idx]!;
      if (acc.status !== "active") continue;
      if (excludeId && acc.id === excludeId) continue;
      store.routing.cursor = (idx + 1) % n;
      store.routing.currentAccountId = acc.id;
      return acc;
    }
    // fallback: any active including exclude
    const any = store.accounts.find((a) => a.status === "active");
    store.routing.currentAccountId = any?.id ?? null;
    return any;
  });
}

export async function ensureCurrentAccount(): Promise<Account | undefined> {
  const store = await loadStore();
  const curId = store.routing.currentAccountId;
  if (curId) {
    const acc = store.accounts.find((a) => a.id === curId);
    if (acc && acc.status === "active") return acc;
  }
  return advanceToNextActive();
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

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  return (await loadStore()).apiKeys;
}

export async function createApiKey(input: {
  alias: string;
  expiresAt?: number | null;
  note?: string;
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
    };
    store.apiKeys.push(rec);
    return rec;
  });
  return { record, key };
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
    expired: k.expiresAt != null && k.expiresAt <= now(),
  };
}
