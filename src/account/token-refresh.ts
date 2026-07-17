import { config } from "../config.js";
import type { Account } from "../types.js";
import { now } from "../utils.js";
import { listAccounts, updateAccount } from "./store.js";
import { isSubscriptionUnexpired } from "./subscription.js";
import { getValidAccessToken } from "./token.js";

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

function activityTs(acc: {
  lastUsedAt?: number;
  lastRefreshedAt?: number;
  createdAt: number;
}): number {
  return Math.max(acc.lastUsedAt ?? 0, acc.lastRefreshedAt ?? 0, acc.createdAt || 0);
}

/**
 * Proactive refresh if:
 * - idle ≥ 1 day
 * - subscription not expired (periodEnd unknown counts as unexpired)
 * Request-time refresh in getValidAccessToken is unaffected.
 */
export function needsProactiveRefresh(acc: {
  status: string;
  tokens?: { refresh?: string };
  createdAt: number;
  lastUsedAt?: number;
  lastRefreshedAt?: number;
  oauth?: unknown;
  credits?: Account["credits"];
}): boolean {
  if (acc.status === "pending" || acc.oauth) return false;
  if (!acc.tokens?.refresh) return false;
  if (acc.status === "expired" || acc.status === "sub_expired") return false;
  if (!isSubscriptionUnexpired(acc as Account)) return false;

  const t = now();
  const idle = t - activityTs(acc);
  return idle >= config.oauth.proactiveIdleMs;
}

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const accounts = await listAccounts();
    // Sync subscription-expired status without writing lastError
    for (const a of accounts) {
      if (
        (a.status === "active" || a.status === "exhausted" || a.status === "expired") &&
        !isSubscriptionUnexpired(a)
      ) {
        try {
          await updateAccount(a.id, { status: "sub_expired", lastError: undefined });
        } catch {
          /* ignore */
        }
      }
    }
    const due = accounts
      .filter((a) => needsProactiveRefresh(a))
      .sort((a, b) => activityTs(a) - activityTs(b));

    // One seat per tick to avoid burst / wind-control
    const target = due[0];
    if (!target) return;

    try {
      await getValidAccessToken(target.id);
      await updateAccount(target.id, { lastRefreshedAt: now() });
      console.log(`[token-refresh] proactive refresh ok: ${target.name || target.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(
        `[token-refresh] proactive refresh failed: ${target.name || target.id}: ${msg}`,
      );
    }
  } catch (e) {
    console.warn(
      "[token-refresh] scan failed:",
      e instanceof Error ? e.message : e,
    );
  } finally {
    running = false;
  }
}

export function startTokenRefreshScheduler(): void {
  if (timer) return;
  const ms = config.oauth.proactiveCheckMs;
  console.log(
    `[token-refresh] scheduler every ${Math.round(ms / 60000)}m · idle≥1d · sub not expired`,
  );
  // first scan after a short delay so boot is not blocked
  setTimeout(() => {
    void tick();
  }, 20_000);
  timer = setInterval(() => {
    void tick();
  }, ms);
  if (typeof timer === "object" && timer && "unref" in timer) {
    (timer as NodeJS.Timeout).unref();
  }
}
