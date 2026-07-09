import { listAccounts, listApiKeys } from "../account/store.js";
import { readLogsSince } from "./logger.js";
import type { RequestLog, TokenUsage } from "./types.js";

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
}

export interface UsageStats {
  rangeDays: number;
  fromDay: string;
  toDay: string;
  summary: {
    requests: number;
    ok: number;
    fail: number;
    avgLatencyMs: number;
  } & TokenTotals;
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
    ...emptyTokens(),
  };
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
  if (log.usage) addTokens(b, log.usage);
}

function finalize(b: UsageBucket) {
  b.avgLatencyMs = b.requests ? Math.round(b.latencySum / b.requests) : 0;
}

function sortBuckets(arr: UsageBucket[]): UsageBucket[] {
  return arr.sort((a, b) => b.requests - a.requests || b.totalTokens - a.totalTokens);
}

function summaryOf(b: UsageBucket): UsageStats["summary"] {
  return {
    requests: b.requests,
    ok: b.ok,
    fail: b.fail,
    avgLatencyMs: b.avgLatencyMs,
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

export async function computeUsageStats(
  days = 7,
  filter?: { userId?: string; apiKeyIds?: string[] },
): Promise<UsageStats> {
  const rangeDays = Math.max(1, Math.min(90, days));
  const [allLogs, accounts, apiKeys] = await Promise.all([
    readLogsSince(rangeDays),
    listAccounts(),
    listApiKeys(filter?.userId),
  ]);
  let logs = allLogs;
  if (filter?.userId) {
    const keySet = new Set(
      filter.apiKeyIds ?? apiKeys.filter((k) => k.userId === filter.userId).map((k) => k.id),
    );
    logs = allLogs.filter(
      (r) => r.userId === filter.userId || (r.apiKeyId != null && keySet.has(r.apiKeyId)),
    );
  } else if (filter?.apiKeyIds) {
    const keySet = new Set(filter.apiKeyIds);
    logs = allLogs.filter((r) => r.apiKeyId != null && keySet.has(r.apiKeyId));
  }
  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));
  const allKeysForLabel = filter?.userId ? apiKeys : await listApiKeys();
  const keyAliasById = new Map(allKeysForLabel.map((k) => [k.id, k.alias || k.keyPrefix]));

  const byDayMap = new Map<string, UsageBucket>();
  const byModelMap = new Map<string, UsageBucket>();
  const byAccountMap = new Map<string, UsageBucket>();
  const byKeyMap = new Map<string, UsageBucket>();
  const summary = emptyBucket("all", "all");

  const today = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400_000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    byDayMap.set(key, emptyBucket(key, key));
  }

  for (const log of logs) {
    add(summary, log);

    const day = log.day || "unknown-day";
    if (!byDayMap.has(day)) byDayMap.set(day, emptyBucket(day, day));
    add(byDayMap.get(day)!, log);

    const model = log.model || "(no model)";
    if (!byModelMap.has(model)) byModelMap.set(model, emptyBucket(model, model));
    add(byModelMap.get(model)!, log);

    if (log.accountId) {
      const accKey = log.accountId;
      const accLabel =
        log.accountName || accountNameById.get(accKey) || accKey.slice(0, 8);
      if (!byAccountMap.has(accKey)) byAccountMap.set(accKey, emptyBucket(accKey, accLabel));
      else if (
        byAccountMap.get(accKey)!.label === accKey.slice(0, 8) &&
        (log.accountName || accountNameById.get(accKey))
      ) {
        byAccountMap.get(accKey)!.label = log.accountName || accountNameById.get(accKey)!;
      }
      add(byAccountMap.get(accKey)!, log);
    } else {
      const missKey = "__unrouted__";
      if (!byAccountMap.has(missKey)) byAccountMap.set(missKey, emptyBucket(missKey, "(unrouted)"));
      add(byAccountMap.get(missKey)!, log);
    }

    if (log.apiKeyId) {
      const keyId = log.apiKeyId;
      const keyLabel = log.apiKeyAlias || keyAliasById.get(keyId) || keyId.slice(0, 8);
      if (!byKeyMap.has(keyId)) byKeyMap.set(keyId, emptyBucket(keyId, keyLabel));
      add(byKeyMap.get(keyId)!, log);
    } else {
      const missKey = "__no_key__";
      if (!byKeyMap.has(missKey)) byKeyMap.set(missKey, emptyBucket(missKey, "(no key)"));
      add(byKeyMap.get(missKey)!, log);
    }
  }

  for (const b of byDayMap.values()) finalize(b);
  for (const b of byModelMap.values()) finalize(b);
  for (const b of byAccountMap.values()) finalize(b);
  for (const b of byKeyMap.values()) finalize(b);
  finalize(summary);

  const byDay = [...byDayMap.values()].sort((a, b) => a.key.localeCompare(b.key));
  const fromDay = byDay[0]?.key ?? "";
  const toDay = byDay[byDay.length - 1]?.key ?? "";

  return {
    rangeDays,
    fromDay,
    toDay,
    summary: summaryOf(summary),
    byDay,
    byModel: sortBuckets([...byModelMap.values()]),
    byAccount: sortBuckets([...byAccountMap.values()]),
    byKey: sortBuckets([...byKeyMap.values()]),
  };
}
