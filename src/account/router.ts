import type { Account } from "../types.js";
import type { RouteScope } from "../auth/users.js";
import { getUser } from "../auth/users.js";
import { fetchAccountCredits } from "./billing.js";
import {
  canUserUseAccount,
  filterAccountsForCaller,
  getAccount,
  getRouting,
  hasAllowedUsers,
  isAccountDonor,
  isPublicPoolAccount,
  isUserAllowedOnAccount,
  listAccounts,
  markStatus,
  markUsed,
  setCurrentAccount,
} from "./store.js";
import { getValidAccessToken } from "./token.js";

export type RouteResult = {
  account: Account;
  accessToken: string;
};

const EXHAUSTED_THRESHOLD = 0.5; // remaining percent

/**
 * Auto-routing priority (lower is better):
 * 0 = personal contributor-only seats (caller is donor of a non-public seat)
 * 1 = allowlisted seats that include the caller (caller is extra member, not donor)
 * 2 = public shared pool (own public donations slightly ahead via secondary sort)
 * 3 = other eligible seats (fallback)
 */
export function accountRoutePriority(
  acc: Account,
  callerUserId: string | null | undefined,
): number {
  const uid = callerUserId ?? null;
  // Tier 0: personal non-public seats owned by caller (private / allowlist donor)
  if (uid && isAccountDonor(acc, uid) && !isPublicPoolAccount(acc)) return 0;
  // Tier 1: seats whose allowlist includes the caller (not the donor case above)
  if (uid && isUserAllowedOnAccount(acc, uid) && !isAccountDonor(acc, uid)) return 1;
  // Tier 2: public pool
  if (isPublicPoolAccount(acc)) return 2;
  // Own public donations still public-pool (tier 2); keep fallback for odd states
  if (uid && isAccountDonor(acc, uid)) return 2;
  return 3;
}

/** SuperGrok billing period end as epoch ms; unknown => +Infinity (use later). */
export function accountPeriodEndMs(acc: Account): number {
  const raw = acc.credits?.periodEnd;
  if (raw == null || raw === "") return Number.POSITIVE_INFINITY;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const s = String(raw).trim();
  if (!s) return Number.POSITIVE_INFINITY;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return Number.POSITIVE_INFINITY;
    return n < 1e12 ? n * 1000 : n;
  }
  const d = Date.parse(s);
  return Number.isFinite(d) ? d : Number.POSITIVE_INFINITY;
}

function sortAccountsForAuto(
  accounts: Account[],
  callerUserId: string | null | undefined,
): Account[] {
  // priority tier → earliest SuperGrok period end → own seats → fewer uses → older lastUsed → id
  return [...accounts].sort((a, b) => {
    const pa = accountRoutePriority(a, callerUserId);
    const pb = accountRoutePriority(b, callerUserId);
    if (pa !== pb) return pa - pb;
    const ea = accountPeriodEndMs(a);
    const eb = accountPeriodEndMs(b);
    if (ea !== eb) return ea - eb;
    const oa = callerUserId && isAccountDonor(a, callerUserId) ? 0 : 1;
    const ob = callerUserId && isAccountDonor(b, callerUserId) ? 0 : 1;
    if (oa !== ob) return oa - ob;
    const ua = a.useCount ?? 0;
    const ub = b.useCount ?? 0;
    if (ua !== ub) return ua - ub;
    const la = a.lastUsedAt ?? 0;
    const lb = b.lastUsedAt ?? 0;
    if (la !== lb) return la - lb;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Route to one account.
 * - Respects caller routeScope (auto / public / mine / account) and private flags.
 * - Auto priority: personal contributor seats → allowlisted seats → public pool; within each tier prefer earliest SuperGrok periodEnd.
 * - Only checks credits for the candidate currently being considered.
 */
export async function routeAccount(opts?: {
  preferredId?: string;
  checkCredits?: boolean;
  forceAuto?: boolean;
  /** App user owning the API key (null = open/legacy) */
  callerUserId?: string | null;
}): Promise<RouteResult> {
  const checkCredits = opts?.checkCredits !== false;
  const callerUserId = opts?.callerUserId ?? null;
  const routing = await getRouting();

  let scope: RouteScope = "auto";
  let pinnedId: string | null = null;
  if (callerUserId) {
    const user = await getUser(callerUserId);
    if (user) {
      scope = user.routeScope ?? "auto";
      pinnedId = user.routeAccountId ?? null;
    }
  }

  const all = await listAccounts();
  const eligible = filterAccountsForCaller(all, {
    callerUserId,
    scope,
    accountId: opts?.preferredId ? null : pinnedId,
  });
  // preferred header: still must pass private/ownership/allowlist checks
  if (opts?.preferredId) {
    const pref = all.find((a) => a.id === opts.preferredId);
    if (!pref) throw new Error(`account not found: ${opts.preferredId}`);
    if (!canUserUseAccount(pref, callerUserId)) {
      throw new Error("无权使用该账号（私有、白名单限制或不可见）");
    }
    // public pool: only shared seats, or seats where caller is allowlisted
    if (scope === "public" && !isPublicPoolAccount(pref) && !isUserAllowedOnAccount(pref, callerUserId)) {
      throw new Error("公共号池不能使用私有/限定账号，请改用「自动」或「仅自己号池」或「指定账号」");
    }
    // mine: own donations or seats allowlisted for caller
    if (scope === "mine") {
      const mine = pref.donorUserId === callerUserId;
      const allowlisted =
        hasAllowedUsers(pref) && isUserAllowedOnAccount(pref, callerUserId);
      if (!mine && !allowlisted) {
        throw new Error("当前路由模式为「仅自己号池」，不能指定其他账号");
      }
    }
    // auto: any seat the caller may use (already checked via canUserUseAccount)
    return useAccount(opts.preferredId, checkCredits);
  }

  if (scope === "account") {
    if (!pinnedId) throw new Error("已选择「指定账号」但未配置账号");
    const acc = all.find((a) => a.id === pinnedId);
    if (!acc) throw new Error(`指定账号不存在: ${pinnedId}`);
    if (!canUserUseAccount(acc, callerUserId)) {
      throw new Error("无权使用指定账号");
    }
    return useAccount(pinnedId, checkCredits);
  }

  const eligibleIds = new Set(eligible.map((a) => a.id));
  if (eligibleIds.size === 0) {
    if (scope === "mine") throw new Error("你的号池为空，请先贡献账号或改用公共池");
    throw new Error("没有可用账号（未添加或全部不可用）");
  }

  // Active candidates only for auto rotation
  let candidates = eligible.filter((a) => a.status === "active" || a.status === "exhausted");
  // Prefer non-exhausted first, but keep exhausted at end so credit recheck can revive
  const active = candidates.filter((a) => a.status === "active");
  const rest = candidates.filter((a) => a.status !== "active");
  candidates = [...active, ...rest];

  if (candidates.length === 0) {
    throw new Error(
      scope === "mine"
        ? "你的号池没有可用账号（额度耗尽或全部失败）"
        : "没有可用账号（额度耗尽或全部失败）",
    );
  }

  // Global admin manual mode: only stick when caller has no higher-priority private seats
  // and the selected public seat is still eligible.
  const hasPrivatePriority = candidates.some(
    (a) => accountRoutePriority(a, callerUserId) <= 1,
  );
  if (
    routing.mode === "manual" &&
    routing.currentAccountId &&
    !opts?.forceAuto &&
    !hasPrivatePriority &&
    eligibleIds.has(routing.currentAccountId)
  ) {
    const cur = all.find((a) => a.id === routing.currentAccountId);
    if (cur && isPublicPoolAccount(cur) && cur.status === "active") {
      try {
        return await useAccount(routing.currentAccountId, checkCredits);
      } catch {
        // fall through to priority auto
      }
    }
  }

  // Auto / mine / public: priority-ordered attempts
  const ordered = sortAccountsForAuto(candidates, callerUserId);
  const tried = new Set<string>();
  let lastErr: Error | null = null;
  for (const acc of ordered) {
    if (tried.has(acc.id)) continue;
    tried.add(acc.id);
    try {
      return await useAccount(acc.id, checkCredits);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      const msg = lastErr.message;
      if (msg.includes("exhausted") || msg.includes("额度") || msg.includes("expired") || msg.includes("account not found")) {
        continue;
      }
      // transient / other — try next seat
      continue;
    }
  }

  throw lastErr ?? new Error(
    scope === "mine"
      ? "你的号池没有可用账号（额度耗尽或全部失败）"
      : "没有可用账号（额度耗尽或全部失败）",
  );
}

async function useAccount(accountId: string, checkCredits: boolean): Promise<RouteResult> {
  const acc = await getAccount(accountId);
  if (!acc) throw new Error(`account not found: ${accountId}`);
  if (acc.status === "expired") throw new Error(`account expired: ${accountId}`);

  if (checkCredits) {
    try {
      const credits = await fetchAccountCredits(accountId);
      if (credits.remainingPercent <= EXHAUSTED_THRESHOLD) {
        await markStatus(
          accountId,
          "exhausted",
          `额度已用尽 (${credits.creditUsagePercent.toFixed(1)}%)`,
        );
        throw new Error(`account exhausted: ${accountId}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("exhausted")) throw e;
      if (acc.status === "exhausted") throw new Error(`account exhausted: ${accountId}`);
    }
  } else if (acc.status === "exhausted") {
    throw new Error(`account exhausted: ${accountId}`);
  }

  const accessToken = await getValidAccessToken(accountId);
  const fresh = (await getAccount(accountId))!;
  return { account: fresh, accessToken };
}

export async function onSuccess(accountId: string): Promise<void> {
  await markUsed(accountId);
}

export async function onProviderError(
  accountId: string,
  status: number,
  bodyText: string,
): Promise<"exhausted" | "retryable" | "fatal"> {
  const lower = bodyText.toLowerCase();
  const exhaustedHints = [
    "insufficient_quota",
    "quota",
    "rate_limit",
    "resource_exhausted",
    "usage limit",
    "exceeded",
    "subscription",
    "no remaining",
    "credit",
    "spending-limit",
    "run out of credits",
    "personal-team-blocked",
  ];

  if (status === 402 || status === 429) {
    const hit = exhaustedHints.some((h) => lower.includes(h)) || status === 402;
    if (hit || status === 429) {
      await markStatus(accountId, "exhausted", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
      return "exhausted";
    }
  }
  // SuperGrok / Imagine media quota often returns 403 spending-limit
  if (status === 403) {
    const quota403 =
      lower.includes("spending-limit") ||
      lower.includes("run out of credits") ||
      lower.includes("need a grok subscription") ||
      lower.includes("personal-team-blocked") ||
      lower.includes("insufficient") ||
      lower.includes("quota") ||
      lower.includes("credit");
    if (quota403) {
      await markStatus(accountId, "exhausted", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
      return "exhausted";
    }
    await markStatus(accountId, "expired", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
    return "fatal";
  }
  if (status === 401) {
    await markStatus(accountId, "expired", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
    return "fatal";
  }
  if (status >= 500) {
    await markStatus(accountId, "error", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
    return "retryable";
  }
  return "fatal";
}

export async function switchAccount(accountId: string): Promise<Account> {
  const acc = await getAccount(accountId);
  if (!acc) throw new Error(`account not found: ${accountId}`);
  if (!isPublicPoolAccount(acc)) {
    throw new Error("不能将私有/限定账号设为公共池当前账号");
  }
  await setCurrentAccount(accountId);
  try {
    await fetchAccountCredits(accountId, { force: true });
  } catch {
    // ignore probe failure on switch
  }
  return (await getAccount(accountId))!;
}
