import type { Account } from "../types.js";
import type { RouteScope, User } from "../auth/users.js";
import { getUser } from "../auth/users.js";
import { fetchAccountCredits } from "./billing.js";
import {
  advanceToNextActive,
  canUserUseAccount,
  ensureCurrentAccount,
  filterAccountsForCaller,
  getAccount,
  getRouting,
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
 * Route to one account.
 * - Respects caller routeScope (public / mine / account) and private flags.
 * - Only checks credits for the candidate currently being considered.
 * - Global admin auto/manual still applies within the eligible pool.
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

  let scope: RouteScope = "public";
  let pinnedId: string | null = null;
  if (callerUserId) {
    const user = await getUser(callerUserId);
    if (user) {
      scope = user.routeScope ?? "public";
      pinnedId = user.routeAccountId ?? null;
    }
  }

  const all = await listAccounts();
  const eligible = filterAccountsForCaller(all, {
    callerUserId,
    scope: opts?.preferredId ? "public" : scope,
    accountId: opts?.preferredId ? null : pinnedId,
  });
  // preferred header: still must pass private/ownership checks
  if (opts?.preferredId) {
    const pref = all.find((a) => a.id === opts.preferredId);
    if (!pref) throw new Error(`account not found: ${opts.preferredId}`);
    if (!canUserUseAccount(pref, callerUserId)) {
      throw new Error("无权使用该账号（私有或不可见）");
    }
    // public pool must never land on private seats
    if (scope === "public" && pref.private === true) {
      throw new Error("公共号池不能使用私有账号，请改用「仅自己号池」或「指定账号」");
    }
    // if user scoped to mine, preferred must be theirs
    if (scope === "mine" && pref.donorUserId !== callerUserId) {
      throw new Error("当前路由模式为「仅自己号池」，不能指定其他账号");
    }
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

  const eligibleIds = eligible.map((a) => a.id);
  if (eligibleIds.length === 0) {
    if (scope === "mine") throw new Error("你的号池为空，请先贡献账号或改用公共池");
    throw new Error("没有可用账号（未添加或全部不可用）");
  }

  // Manual global mode: stick to selected only if public + still eligible
  if (routing.mode === "manual" && routing.currentAccountId && !opts?.forceAuto) {
    const cur = all.find((a) => a.id === routing.currentAccountId);
    if (cur && cur.private === true) {
      // private cannot be global current — fall through to public auto
    } else if (eligibleIds.includes(routing.currentAccountId)) {
      return useAccount(routing.currentAccountId, checkCredits);
    }
    // fall through to auto within pool
  }

  let candidate = await ensureCurrentAccount(eligibleIds);
  if (!candidate) throw new Error(
    scope === "mine"
      ? "你的号池没有可用账号（额度耗尽或全部失败）"
      : "没有可用账号（额度耗尽或全部失败）",
  );

  const tried = new Set<string>();
  for (let i = 0; i < 20; i++) {
    if (!candidate || tried.has(candidate.id)) break;
    if (!eligibleIds.includes(candidate.id)) {
      candidate = await advanceToNextActive(candidate.id, eligibleIds);
      continue;
    }
    tried.add(candidate.id);
    try {
      return await useAccount(candidate.id, checkCredits);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("exhausted") || msg.includes("额度")) {
        candidate = await advanceToNextActive(candidate.id, eligibleIds);
        continue;
      }
      candidate = await advanceToNextActive(candidate.id, eligibleIds);
    }
  }
  throw new Error(
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
  ];

  if (status === 402 || status === 429) {
    const hit = exhaustedHints.some((h) => lower.includes(h)) || status === 402;
    if (hit || status === 429) {
      await markStatus(accountId, "exhausted", `HTTP ${status}: ${bodyText.slice(0, 300)}`);
      return "exhausted";
    }
  }
  if (status === 401 || status === 403) {
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
  if (acc.private === true) {
    throw new Error("不能将私有贡献账号设为公共池当前账号");
  }
  await setCurrentAccount(accountId);
  try {
    await fetchAccountCredits(accountId, { force: true });
  } catch {
    // ignore probe failure on switch
  }
  return (await getAccount(accountId))!;
}
