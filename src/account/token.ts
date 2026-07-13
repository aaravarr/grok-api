import { config } from "../config.js";
import type { Account } from "../types.js";
import { now } from "../utils.js";
import { getAccount, markStatus, updateAccount } from "./store.js";
import { refreshTokens } from "./oauth.js";

const inflight = new Map<string, Promise<string>>();

function needsRefresh(account: Account): boolean {
  if (!account.tokens.access) return true;
  if (!account.tokens.expires) return true;
  return account.tokens.expires - now() <= config.oauth.refreshSkewMs;
}

export async function getValidAccessToken(accountId: string): Promise<string> {
  const existing = inflight.get(accountId);
  if (existing) return existing;

  const task = (async () => {
    const account = await getAccount(accountId);
    if (!account) throw new Error(`account not found: ${accountId}`);
    // Allow token for exhausted accounts so we can re-check credits / manual switch.

    if (!needsRefresh(account)) {
      return account.tokens.access;
    }
    if (!account.tokens.refresh) {
      await markStatus(accountId, "expired", "missing refresh_token");
      throw new Error(`account expired (no refresh): ${accountId}`);
    }
    try {
      const tokens = await refreshTokens(account.tokens.refresh);
      await updateAccount(accountId, {
        tokens,
        lastRefreshedAt: now(),
        status: account.status === "error" ? "active" : account.status,
        lastError: undefined,
      });
      return tokens.access;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await markStatus(accountId, "expired", msg);
      throw e;
    }
  })();

  inflight.set(accountId, task);
  try {
    return await task;
  } finally {
    inflight.delete(accountId);
  }
}
