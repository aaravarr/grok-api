import { outboundFetch } from "../proxy.js";
import { getBillingUrl } from "../settings.js";
import type { CreditSnapshot } from "../types.js";
import { now } from "../utils.js";
import { getAccount, setCredits } from "./store.js";
import { getValidAccessToken } from "./token.js";
const CACHE_TTL_MS = 60_000;

export interface BillingConfig {
  creditUsagePercent?: number;
  currentPeriod?: { type?: string; start?: string; end?: string };
  productUsage?: Array<{ product: string; usagePercent: number }>;
  prepaidBalance?: { val?: number };
  onDemandCap?: { val?: number };
  onDemandUsed?: { val?: number };
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  isUnifiedBillingUser?: boolean;
}

function parseCredits(body: { config?: BillingConfig }, checkedAt: number): CreditSnapshot {
  const cfg = body.config ?? {};
  const usage = Number(cfg.creditUsagePercent ?? 0);
  const clamped = Math.min(100, Math.max(0, usage));
  return {
    creditUsagePercent: clamped,
    remainingPercent: Math.max(0, 100 - clamped),
    periodType: cfg.currentPeriod?.type,
    periodStart: cfg.currentPeriod?.start ?? cfg.billingPeriodStart,
    periodEnd: cfg.currentPeriod?.end ?? cfg.billingPeriodEnd,
    productUsage: cfg.productUsage,
    prepaidBalance: cfg.prepaidBalance?.val,
    onDemandCap: cfg.onDemandCap?.val,
    onDemandUsed: cfg.onDemandUsed?.val,
    checkedAt,
    raw: body,
  };
}

/** Fetch credits for a single account. Never batch-check all accounts. */
export async function fetchAccountCredits(
  accountId: string,
  opts?: { force?: boolean },
): Promise<CreditSnapshot> {
  const acc = await getAccount(accountId);
  if (!acc) throw new Error(`account not found: ${accountId}`);

  if (
    !opts?.force &&
    acc.credits &&
    now() - acc.credits.checkedAt < CACHE_TTL_MS
  ) {
    return acc.credits;
  }

  const access = await getValidAccessToken(accountId);
  const billingUrl = await getBillingUrl();
  const res = await outboundFetch(billingUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access}`,
      Accept: "application/json",
      "User-Agent": "grok-api/1.0",
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`billing HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  let json: { config?: BillingConfig };
  try {
    json = JSON.parse(text) as { config?: BillingConfig };
  } catch {
    throw new Error("billing response is not JSON");
  }
  const snap = parseCredits(json, now());
  await setCredits(accountId, snap);
  return snap;
}
