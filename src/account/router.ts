import type { Account } from "../types.js";
import { fetchAccountCredits } from "./billing.js";
import {
  advanceToNextActive,
  ensureCurrentAccount,
  getAccount,
  getRouting,
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
 * - Only checks credits for the candidate currently being considered (never all).
 * - Auto mode: if current exhausted, advance to next and check that one.
 * - Manual mode: stick to selected account unless forceAuto on failure.
 */
export async function routeAccount(opts?: {
  preferredId?: string;
  checkCredits?: boolean;
  forceAuto?: boolean;
}): Promise<RouteResult> {
  const checkCredits = opts?.checkCredits !== false;
  const routing = await getRouting();

  // Explicit preferred (header) — still only check that one
  if (opts?.preferredId) {
    return useAccount(opts.preferredId, checkCredits);
  }

  // Manual mode
  if (routing.mode === "manual" && routing.currentAccountId && !opts?.forceAuto) {
    return useAccount(routing.currentAccountId, checkCredits);
  }

  // Auto: ensure current, check only current; if bad, advance one-by-one
  let candidate = await ensureCurrentAccount();
  if (!candidate) throw new Error("没有可用账号（未添加或全部不可用）");

  const tried = new Set<string>();
  for (let i = 0; i < 20; i++) {
    if (!candidate || tried.has(candidate.id)) break;
    tried.add(candidate.id);
    try {
      return await useAccount(candidate.id, checkCredits);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("exhausted") || msg.includes("额度")) {
        candidate = await advanceToNextActive(candidate.id);
        continue;
      }
      // token/other errors: try next
      candidate = await advanceToNextActive(candidate.id);
    }
  }
  throw new Error("没有可用账号（额度耗尽或全部失败）");
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
      // if was exhausted but now has balance, store already set active via setCredits
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("exhausted")) throw e;
      // billing probe failed — still allow try if status active
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
  await setCurrentAccount(accountId);
  // only check the switched account
  try {
    await fetchAccountCredits(accountId, { force: true });
  } catch {
    // ignore probe failure on switch
  }
  return (await getAccount(accountId))!;
}
