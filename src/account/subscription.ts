import type { Account, CreditSnapshot } from "../types.js";
import { now } from "../utils.js";

/**
 * SuperGrok seats in this pool are only trusted for 7 days from account entry.
 * Upstream billing sometimes reports a periodEnd ~1 week past true expiry.
 * Cap: effectiveEnd = min(periodEnd, createdAt + 7d).
 */
export const MAX_SUBSCRIPTION_MS_FROM_ENTRY = 7 * 24 * 60 * 60 * 1000;

/** Parse billing period end into epoch ms; null if unknown. */
export function parsePeriodEndMs(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const s = String(raw).trim();
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return n < 1e12 ? n * 1000 : n;
  }
  const d = Date.parse(s);
  return Number.isFinite(d) ? d : null;
}

/**
 * Effective SuperGrok subscription end for routing / status / display.
 * Caps reported periodEnd to createdAt + 7 days when entry time is known.
 */
export function effectiveSubscriptionEndMs(acc: {
  createdAt?: number;
  credits?: Pick<CreditSnapshot, "periodEnd"> | null;
}): number | null {
  const end = parsePeriodEndMs(acc.credits?.periodEnd);
  if (end == null) return null;
  const created = Number(acc.createdAt) || 0;
  if (created > 0) {
    return Math.min(end, created + MAX_SUBSCRIPTION_MS_FROM_ENTRY);
  }
  return end;
}

/** True when effective subscription end is known and already past. */
export function isSubscriptionPeriodEnded(
  credits?: CreditSnapshot | null,
  t = now(),
  createdAt?: number,
): boolean {
  if (!credits) return false;
  const end = effectiveSubscriptionEndMs({ createdAt, credits });
  return end != null && end <= t;
}

/** ISO string for console/API display of effective period end. */
export function effectivePeriodEndIso(acc: {
  createdAt?: number;
  credits?: Pick<CreditSnapshot, "periodEnd"> | null;
}): string | undefined {
  const end = effectiveSubscriptionEndMs(acc);
  if (end == null) {
    const raw = acc.credits?.periodEnd;
    return raw == null || raw === "" ? undefined : String(raw);
  }
  return new Date(end).toISOString();
}

/**
 * SuperGrok subscription still valid?
 * - known effectiveEnd in the future => yes
 * - known effectiveEnd already past => no
 * - unknown periodEnd => true (do not block solely on sub)
 */
export function isSubscriptionUnexpired(
  acc: Pick<Account, "credits" | "createdAt">,
  t = now(),
): boolean {
  const end = effectiveSubscriptionEndMs(acc);
  if (end == null) return true;
  return end > t;
}
