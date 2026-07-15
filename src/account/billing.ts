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
  subscriptionTier?: string;
  plan?: string;
  planName?: string;
  tier?: string;
  product?: string;
}

export type SuperGrokCheck = {
  ok: boolean;
  reason?: string;
  credits: CreditSnapshot;
};

function isPeriodTypeLabel(v: string): boolean {
  return /^usage[_\s-]?period/i.test(v.trim());
}

function pickTier(cfg: BillingConfig, body: unknown): string | undefined {
  const candidates: string[] = [];
  for (const v of [cfg.subscriptionTier, cfg.plan, cfg.planName, cfg.tier, cfg.product]) {
    if (typeof v === "string" && v.trim()) candidates.push(v.trim());
  }
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    for (const k of ["subscriptionTier", "plan", "planName", "tier", "product"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) candidates.push(v.trim());
    }
  }
  // Prefer real plan/product names over billing period type (USAGE_PERIOD_...)
  for (const c of candidates) {
    if (!isPeriodTypeLabel(c)) return c;
  }
  const products = (cfg.productUsage || [])
    .map((p) => String(p.product || "").trim())
    .filter(Boolean);
  if (products.length) {
    // Prefer product names that look like plan labels
    const preferred = products.find((p) => /super|grok|pro|premium|heavy|plus/i.test(p));
    return preferred || products.join(",");
  }
  const periodType = cfg.currentPeriod?.type;
  if (typeof periodType === "string" && periodType.trim() && !isPeriodTypeLabel(periodType)) {
    return periodType.trim();
  }
  // USAGE_PERIOD alone is not a plan name — leave undefined so UI can show SuperGrok fallback
  return undefined;
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
    subscriptionTier: pickTier(cfg, body),
    checkedAt,
    raw: body,
  };
}

/**
 * SuperGrok entitlement heuristic from billing payload.
 * Prefer explicit tier/product names; fall back to usable credit period signals.
 */
export function isSuperGrokCredits(credits: CreditSnapshot): { ok: boolean; reason?: string } {
  const tier = (credits.subscriptionTier || credits.periodType || "").toLowerCase();
  const blob = JSON.stringify(credits.raw ?? {}).toLowerCase();
  const products = (credits.productUsage || [])
    .map((p) => String(p.product || "").toLowerCase())
    .join(" ");

  const hay = `${tier} ${products} ${blob}`;
  if (
    /supergrok|super_grok|super-grok|super grok|grok\s*pro|pro\s*plan|premium/.test(hay)
  ) {
    return { ok: true };
  }

  // Free / non-entitled markers
  if (/\bfree\b|free_plan|no[_-]?subscription|unsubscribed|not[_-]?subscribed/.test(hay)) {
    return { ok: false, reason: "非 SuperGrok 订阅（free）" };
  }

  // Usable SuperGrok-style credits: period + product usage or prepaid / remaining
  if (
    credits.productUsage?.length ||
    (typeof credits.prepaidBalance === "number" && credits.prepaidBalance > 0) ||
    (typeof credits.creditUsagePercent === "number" &&
      Number.isFinite(credits.creditUsagePercent) &&
      (credits.periodType || credits.periodStart || credits.periodEnd))
  ) {
    return { ok: true };
  }

  // Bare 0% usage with no period/products is weak — treat as not SuperGrok
  if (
    credits.creditUsagePercent === 0 &&
    !credits.periodType &&
    !credits.productUsage?.length &&
    !(typeof credits.prepaidBalance === "number" && credits.prepaidBalance > 0)
  ) {
    return { ok: false, reason: "未检测到 SuperGrok 额度/订阅" };
  }

  // Default: billing succeeded with a usage meter → accept
  if (Number.isFinite(credits.creditUsagePercent)) {
    return { ok: true };
  }
  return { ok: false, reason: "无法确认 SuperGrok 资格" };
}

async function fetchBillingJson(accessToken: string): Promise<{ config?: BillingConfig }> {
  const billingUrl = await getBillingUrl();
  const res = await outboundFetch(billingUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "User-Agent": "grok-api/1.0",
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`billing HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text) as { config?: BillingConfig };
  } catch {
    throw new Error("billing response is not JSON");
  }
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
  const json = await fetchBillingJson(access);
  const snap = parseCredits(json, now());
  await setCredits(accountId, snap);
  return snap;
}

/**
 * Validate SuperGrok using a raw access token (OAuth just finished; account may be pending).
 * Does not go through getValidAccessToken.
 */
export async function checkSuperGrokWithAccessToken(
  accessToken: string,
): Promise<SuperGrokCheck> {
  const json = await fetchBillingJson(accessToken);
  const credits = parseCredits(json, now());
  const verdict = isSuperGrokCredits(credits);
  return { ok: verdict.ok, reason: verdict.reason, credits };
}
