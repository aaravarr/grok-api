import { config } from "../config.js";
import { now } from "../utils.js";
import { listAccounts, updateAccount } from "./store.js";
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
 * Proactive refresh if idle ≥ 2d, but only while seat age ≤ 7d since createdAt.
 * Request-time refresh in getValidAccessToken is unaffected.
 */
export function needsProactiveRefresh(acc: {
  status: string;
  tokens?: { refresh?: string };
  createdAt: number;
  lastUsedAt?: number;
  lastRefreshedAt?: number;
  oauth?: unknown;
}): boolean {
  if (acc.status === "pending" || acc.oauth) return false;
  if (!acc.tokens?.refresh) return false;
  if (acc.status === "expired") return false;

  const t = now();
  const age = t - (acc.createdAt || 0);
  if (age > config.oauth.proactiveMaxAgeMs) return false;

  const idle = t - activityTs(acc);
  return idle >= config.oauth.proactiveIdleMs;
}

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const accounts = await listAccounts();
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
    `[token-refresh] scheduler every ${Math.round(ms / 60000)}m · idle≥2d · age≤7d`,
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
