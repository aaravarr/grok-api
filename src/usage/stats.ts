import { listAccounts, listApiKeys } from "../account/store.js";
import { readLogsSince } from "./logger.js";
import type { RequestLog, TokenUsage } from "./types.js";

export type UsageGranularity = "day" | "hour" | "minute" | "5m";

export interface TokenTotals {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens: number;
  textTokens: number;
  imageTokens: number;
  audioTokens: number;
  reasoningTokens: number;
  completionAudioTokens: number;
  acceptedPredictionTokens: number;
  rejectedPredictionTokens: number;
  numSourcesUsed: number;
  costInUsdTicks: number;
}

export interface UsageBucket extends TokenTotals {
  key: string;
  label: string;
  requests: number;
  ok: number;
  fail: number;
  latencySum: number;
  avgLatencyMs: number;
  /** Sum of (latencyMs - firstTokenMs) only for logs with firstTokenMs */
  genLatencySum: number;
  /** completion+reasoning tokens only for valid TPS samples */
  genTokensForTps: number;
  /** Requests that contributed to genLatencySum / genTokensForTps */
  tpsSampleCount: number;
  firstTokenSum: number;
  firstTokenCount: number;
  avgFirstTokenMs: number;
}

export interface UsageStatsQuery {
  /** Calendar days (legacy). Ignored when hours is set. */
  days?: number;
  /** Rolling window in hours (takes precedence over days). */
  hours?: number;
  /** Bucket size for time series. */
  granularity?: UsageGranularity;
  userId?: string;
  apiKeyIds?: string[];
}

export interface UsageStats {
  rangeDays: number;
  rangeHours: number;
  granularity: UsageGranularity;
  fromDay: string;
  toDay: string;
  fromTs: number;
  toTs: number;
  summary: {
    requests: number;
    ok: number;
    fail: number;
    avgLatencyMs: number;
    /**
     * TPS only from logs that have firstTokenMs:
     * sum(completion + reasoning) / sum(latencyMs - firstTokenMs) / 1000.
     * Older logs without TTFT are excluded from TPS (still count in requests/tokens KPIs).
     */
    avgTps: number;
    /** Same as avgTps (compat alias) */
    avgReqTps: number;
    /** Sum of end-to-end latencyMs (all requests) */
    latencySumMs: number;
    /** Sum of generation latency (e2e − TTFT), TTFT-only sample */
    genLatencySumMs: number;
    /** Average TTFT over logs that recorded firstTokenMs */
    avgFirstTokenMs: number | null;
    /** How many requests contributed to avgTps / avgFirstTokenMs */
    tpsSampleCount: number;
  } & TokenTotals;
  /** Time series at selected granularity (kept name byDay for API compat). */
  byDay: UsageBucket[];
  byModel: UsageBucket[];
  byAccount: UsageBucket[];
  byKey: UsageBucket[];
}

function emptyTokens(): TokenTotals {
  return {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cachedTokens: 0,
    textTokens: 0,
    imageTokens: 0,
    audioTokens: 0,
    reasoningTokens: 0,
    completionAudioTokens: 0,
    acceptedPredictionTokens: 0,
    rejectedPredictionTokens: 0,
    numSourcesUsed: 0,
    costInUsdTicks: 0,
  };
}

function emptyBucket(key: string, label: string): UsageBucket {
  return {
    key,
    label,
    requests: 0,
    ok: 0,
    fail: 0,
    latencySum: 0,
    avgLatencyMs: 0,
    genLatencySum: 0,
    genTokensForTps: 0,
    tpsSampleCount: 0,
    firstTokenSum: 0,
    firstTokenCount: 0,
    avgFirstTokenMs: 0,
    ...emptyTokens(),
  };
}

/** Min generation window for stable TPS (avoids 63tok/1ms → 63000). */
export const MIN_GEN_MS_FOR_TPS = 50;

function hasTtft(log: { firstTokenMs?: number }): boolean {
  return log.firstTokenMs != null && Number.isFinite(Number(log.firstTokenMs));
}

/** Generation time for TPS: only when TTFT is recorded (latency − prep − TTFT). */
export function genLatencyMs(log: {
  latencyMs?: number;
  firstTokenMs?: number;
  localPrepMs?: number;
}): number {
  if (!hasTtft(log)) return 0;
  const lat = Number(log.latencyMs) || 0;
  if (!(lat > 0)) return 0;
  const f = Math.max(0, Number(log.firstTokenMs));
  const prep =
    log.localPrepMs != null && Number.isFinite(Number(log.localPrepMs))
      ? Math.max(0, Number(log.localPrepMs))
      : 0;
  // end - firstByte ≈ latency - localPrep - upstreamTTFT
  return Math.max(0, lat - Math.min(prep + f, lat));
}

/** True when TTFT sample is usable for TPS (enough post-TTFT duration). */
export function isTpsSample(log: {
  latencyMs?: number;
  firstTokenMs?: number;
  localPrepMs?: number;
}): boolean {
  return genLatencyMs(log) >= MIN_GEN_MS_FOR_TPS;
}

function addTokens(b: TokenTotals, u: TokenUsage) {
  b.promptTokens += u.promptTokens ?? 0;
  b.completionTokens += u.completionTokens ?? 0;
  b.totalTokens += u.totalTokens ?? 0;
  b.cachedTokens += u.cachedTokens ?? 0;
  b.textTokens += u.textTokens ?? 0;
  b.imageTokens += u.imageTokens ?? 0;
  b.audioTokens += u.audioTokens ?? 0;
  b.reasoningTokens += u.reasoningTokens ?? 0;
  b.completionAudioTokens += u.completionAudioTokens ?? 0;
  b.acceptedPredictionTokens += u.acceptedPredictionTokens ?? 0;
  b.rejectedPredictionTokens += u.rejectedPredictionTokens ?? 0;
  b.numSourcesUsed += u.numSourcesUsed ?? 0;
  b.costInUsdTicks += u.costInUsdTicks ?? 0;
}

function add(b: UsageBucket, log: RequestLog) {
  b.requests += 1;
  if (log.ok) b.ok += 1;
  else b.fail += 1;
  b.latencySum += log.latencyMs || 0;
  if (hasTtft(log)) {
    b.firstTokenSum += Number(log.firstTokenMs);
    b.firstTokenCount += 1;
    // TPS sample: need enough generation time after TTFT
    if (isTpsSample(log)) {
      b.genLatencySum += genLatencyMs(log);
      b.tpsSampleCount += 1;
      if (log.usage) {
        b.genTokensForTps +=
          (log.usage.completionTokens ?? 0) + (log.usage.reasoningTokens ?? 0);
      }
    }
  }
  if (log.usage) addTokens(b, log.usage);
}

function finalize(b: UsageBucket) {
  b.avgLatencyMs = b.requests ? Math.round(b.latencySum / b.requests) : 0;
  b.avgFirstTokenMs = b.firstTokenCount
    ? Math.round(b.firstTokenSum / b.firstTokenCount)
    : 0;
}

function sortBuckets(arr: UsageBucket[]): UsageBucket[] {
  return arr.sort((a, b) => b.requests - a.requests || b.totalTokens - a.totalTokens);
}

function summaryOf(
  b: UsageBucket,
  _windowMs: number,
): UsageStats["summary"] {
  // TPS only from TTFT-instrumented logs with enough post-TTFT duration
  const latencySumMs = b.latencySum || 0;
  const genLatencySumMs = b.genLatencySum || 0;
  const genSec = genLatencySumMs > 0 ? genLatencySumMs / 1000 : 0;
  const genTok = b.genTokensForTps || 0;
  const avgTps =
    genSec > 0 && genTok > 0
      ? Math.round((genTok / genSec) * 100) / 100
      : 0;
  return {
    requests: b.requests,
    ok: b.ok,
    fail: b.fail,
    avgLatencyMs: b.avgLatencyMs,
    avgTps,
    avgReqTps: avgTps,
    latencySumMs,
    genLatencySumMs,
    avgFirstTokenMs: b.firstTokenCount > 0 ? b.avgFirstTokenMs : null,
    tpsSampleCount: b.tpsSampleCount,
    promptTokens: b.promptTokens,
    completionTokens: b.completionTokens,
    totalTokens: b.totalTokens,
    cachedTokens: b.cachedTokens,
    textTokens: b.textTokens,
    imageTokens: b.imageTokens,
    audioTokens: b.audioTokens,
    reasoningTokens: b.reasoningTokens,
    completionAudioTokens: b.completionAudioTokens,
    acceptedPredictionTokens: b.acceptedPredictionTokens,
    rejectedPredictionTokens: b.rejectedPredictionTokens,
    numSourcesUsed: b.numSourcesUsed,
    costInUsdTicks: b.costInUsdTicks,
  };
}

const STEP_MS: Record<UsageGranularity, number> = {
  day: 86_400_000,
  hour: 3_600_000,
  "5m": 300_000,
  minute: 60_000,
};

/** Max buckets we prefill (avoid huge charts). */
const MAX_BUCKETS: Record<UsageGranularity, number> = {
  day: 90,
  hour: 168, // 7d
  "5m": 288, // 24h
  minute: 720, // 12h
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function floorTs(ts: number, gran: UsageGranularity): number {
  const d = new Date(ts);
  if (gran === "day") {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }
  if (gran === "hour") {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime();
  }
  if (gran === "5m") {
    const m = Math.floor(d.getMinutes() / 5) * 5;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      m,
    ).getTime();
  }
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  ).getTime();
}

export function bucketKeyFromTs(ts: number, gran: UsageGranularity): string {
  const d = new Date(floorTs(ts, gran));
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  if (gran === "day") return `${y}-${mo}-${da}`;
  const h = pad2(d.getHours());
  if (gran === "hour") return `${y}-${mo}-${da}T${h}`;
  return `${y}-${mo}-${da}T${h}:${pad2(d.getMinutes())}`;
}

export function bucketLabelFromKey(key: string, gran: UsageGranularity): string {
  if (gran === "day") {
    // YYYY-MM-DD → MM-DD
    return key.length >= 10 ? key.slice(5) : key;
  }
  if (gran === "hour") {
    const m = key.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/);
    if (m) return `${m[2]}-${m[3]} ${m[4]}:00`;
  }
  if (gran === "minute" || gran === "5m") {
    const m = key.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (m) return `${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
  }
  return key;
}

function resolveWindow(query: UsageStatsQuery): {
  rangeMs: number;
  rangeHours: number;
  rangeDays: number;
  gran: UsageGranularity;
} {
  let rangeHours: number;
  if (query.hours != null && Number.isFinite(query.hours) && query.hours > 0) {
    rangeHours = Math.max(1 / 60, Math.min(90 * 24, Number(query.hours)));
  } else {
    const days = Math.max(1, Math.min(90, Number(query.days) || 7));
    rangeHours = days * 24;
  }

  // auto: ≤1h → 5m; ≤2h → 1m; ≤72h → hour; longer → day
  let gran: UsageGranularity =
    query.granularity === "hour" ||
    query.granularity === "minute" ||
    query.granularity === "5m" ||
    query.granularity === "day"
      ? query.granularity
      : rangeHours <= 1
        ? "5m"
        : rangeHours <= 2
          ? "minute"
          : rangeHours <= 72
            ? "hour"
            : "day";

  // clamp range so we don't exceed max buckets for granularity
  const maxH = (MAX_BUCKETS[gran] * STEP_MS[gran]) / 3_600_000;
  if (rangeHours > maxH) rangeHours = maxH;

  const rangeMs = rangeHours * 3_600_000;
  const rangeDays = Math.max(1, Math.ceil(rangeHours / 24));
  return { rangeMs, rangeHours, rangeDays, gran };
}

interface StatsCacheEntry {
  expires: number;
  value: UsageStats;
}

const statsCache = new Map<string, StatsCacheEntry>();

/** Clear usage stats cache (call after new request logs). */
export function invalidateUsageStatsCache(): void {
  statsCache.clear();
}

function statsCacheKey(query: UsageStatsQuery): string {
  const hours = query.hours != null && Number.isFinite(query.hours) ? String(query.hours) : "";
  const days = query.days != null ? String(query.days) : "";
  const gran = query.granularity || "";
  const userId = query.userId || "";
  const keys = (query.apiKeyIds ? [...query.apiKeyIds].sort() : []).join(",");
  return `${hours}|${days}|${gran}|${userId}|${keys}`;
}

function statsCacheTtlMs(_query: UsageStatsQuery, _rangeMs: number): number {
  return 15_000;
}

/**
 * Compute usage stats.
 * @param daysOrQuery - legacy number of days, or full query object
 * @param filter - legacy filter when first arg is number
 */
export async function computeUsageStats(
  daysOrQuery: number | UsageStatsQuery = 7,
  filter?: { userId?: string; apiKeyIds?: string[] },
): Promise<UsageStats> {
  const query: UsageStatsQuery =
    typeof daysOrQuery === "number"
      ? { days: daysOrQuery, userId: filter?.userId, apiKeyIds: filter?.apiKeyIds }
      : { ...daysOrQuery, ...filter };

  const cacheKey = statsCacheKey(query);
  const hit = statsCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return hit.value;
  }

  const { rangeMs, rangeHours, rangeDays, gran } = resolveWindow(query);
  const now = Date.now();
  const fromTs = now - rangeMs;
  const toTs = now;

  const [allLogs, accounts, apiKeys] = await Promise.all([
    readLogsSince(rangeDays + 1),
    listAccounts(),
    listApiKeys(query.userId),
  ]);

  let logs = allLogs.filter((r) => {
    const ts = typeof r.ts === "number" ? r.ts : 0;
    return ts >= fromTs && ts <= toTs;
  });

  if (query.userId) {
    const keySet = new Set(
      query.apiKeyIds ?? apiKeys.filter((k) => k.userId === query.userId).map((k) => k.id),
    );
    logs = logs.filter(
      (r) => r.userId === query.userId || (r.apiKeyId != null && keySet.has(r.apiKeyId)),
    );
  } else if (query.apiKeyIds) {
    const keySet = new Set(query.apiKeyIds);
    logs = logs.filter((r) => r.apiKeyId != null && keySet.has(r.apiKeyId));
  }

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const allKeysForLabel = query.userId ? apiKeys : await listApiKeys();
  const keyAliasById = new Map(allKeysForLabel.map((k) => [k.id, k.alias || k.keyPrefix]));

  const byTimeMap = new Map<string, UsageBucket>();
  const byModelMap = new Map<string, UsageBucket>();
  const byAccountMap = new Map<string, UsageBucket>();
  const byKeyMap = new Map<string, UsageBucket>();
  const summary = emptyBucket("all", "all");

  // Prefill empty buckets across the window
  const step = STEP_MS[gran];
  let t = floorTs(fromTs, gran);
  const endFloor = floorTs(toTs, gran);
  let count = 0;
  while (t <= endFloor && count < MAX_BUCKETS[gran]) {
    const key = bucketKeyFromTs(t, gran);
    byTimeMap.set(key, emptyBucket(key, bucketLabelFromKey(key, gran)));
    t += step;
    count += 1;
  }

  for (const log of logs) {
    add(summary, log);

    const ts = typeof log.ts === "number" ? log.ts : Date.now();
    const timeKey = bucketKeyFromTs(ts, gran);
    if (!byTimeMap.has(timeKey)) {
      byTimeMap.set(timeKey, emptyBucket(timeKey, bucketLabelFromKey(timeKey, gran)));
    }
    add(byTimeMap.get(timeKey)!, log);

    const model = log.model || "(no model)";
    if (!byModelMap.has(model)) byModelMap.set(model, emptyBucket(model, model));
    add(byModelMap.get(model)!, log);

    if (log.accountId) {
      const accKey = log.accountId;
      // Prefer live account name so renames show up in usage charts
      const accLabel =
        accountNameById.get(accKey) || log.accountName || accKey.slice(0, 8);
      if (!byAccountMap.has(accKey)) byAccountMap.set(accKey, emptyBucket(accKey, accLabel));
      else {
        const live = accountNameById.get(accKey);
        if (live) byAccountMap.get(accKey)!.label = live;
      }
      add(byAccountMap.get(accKey)!, log);
    } else {
      const missKey = "__unrouted__";
      if (!byAccountMap.has(missKey)) byAccountMap.set(missKey, emptyBucket(missKey, "(unrouted)"));
      add(byAccountMap.get(missKey)!, log);
    }

    if (log.apiKeyId) {
      const keyId = log.apiKeyId;
      // Prefer live key alias so renames show up in usage charts
      const keyLabel = keyAliasById.get(keyId) || log.apiKeyAlias || keyId.slice(0, 8);
      if (!byKeyMap.has(keyId)) byKeyMap.set(keyId, emptyBucket(keyId, keyLabel));
      else {
        const live = keyAliasById.get(keyId);
        if (live) byKeyMap.get(keyId)!.label = live;
      }
      add(byKeyMap.get(keyId)!, log);
    } else {
      const missKey = "__no_key__";
      if (!byKeyMap.has(missKey)) byKeyMap.set(missKey, emptyBucket(missKey, "(no key)"));
      add(byKeyMap.get(missKey)!, log);
    }
  }

  for (const b of byTimeMap.values()) finalize(b);
  for (const b of byModelMap.values()) finalize(b);
  for (const b of byAccountMap.values()) finalize(b);
  for (const b of byKeyMap.values()) finalize(b);
  finalize(summary);

  const byDay = [...byTimeMap.values()].sort((a, b) => a.key.localeCompare(b.key));
  const fromDay = byDay[0]?.key ?? "";
  const toDay = byDay[byDay.length - 1]?.key ?? "";

  const result: UsageStats = {
    rangeDays,
    rangeHours: Math.round(rangeHours * 1000) / 1000,
    granularity: gran,
    fromDay,
    toDay,
    fromTs,
    toTs,
    summary: summaryOf(summary, toTs - fromTs),
    byDay,
    byModel: sortBuckets([...byModelMap.values()]),
    byAccount: sortBuckets([...byAccountMap.values()]),
    byKey: sortBuckets([...byKeyMap.values()]),
  };

  statsCache.set(cacheKey, {
    expires: Date.now() + statsCacheTtlMs(query, rangeMs),
    value: result,
  });

  return result;
}
