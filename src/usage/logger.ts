import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  rename,
  unlink,
  writeFile,
  stat,
} from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { listAccounts, listApiKeys } from "../account/store.js";
import { config } from "../config.js";
import { loadSettings } from "../settings.js";
import { randomId } from "../utils.js";
import type { RequestLog, TokenUsage } from "./types.js";
import type { ProxyMode } from "../client/xai.js";

export type { RequestLog, TokenUsage };

function logsDir(): string {
  return path.join(config.dataDir, "logs");
}

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayFile(day: string): string {
  return path.join(logsDir(), `${day}.jsonl`);
}

let writeChain: Promise<void> = Promise.resolve();
let lastCleanupAt = 0;

/** Per-day in-memory cache keyed by file size + mtime (meta only, no bodies). */
interface DayLogCache {
  size: number;
  mtimeMs: number;
  rows: RequestLog[];
}
const dayLogCache = new Map<string, DayLogCache>();
/** Merge concurrent cold reads of the same day. */
const dayLogInflight = new Map<string, Promise<RequestLog[]>>();

/**
 * Cache-friendly row: drop request/response bodies, keep presence flags for list UI.
 * Does not change on-disk jsonl.
 */
function toCachedLog(row: RequestLog): RequestLog {
  const hasRequest = row.request !== undefined;
  const hasResponse = row.response !== undefined;
  if (
    !hasRequest &&
    !hasResponse &&
    row.requestTruncated === undefined &&
    row.responseTruncated === undefined
  ) {
    return row;
  }
  const {
    request: _req,
    response: _res,
    requestTruncated: _rt,
    responseTruncated: _rst,
    ...rest
  } = row;
  const out = rest as RequestLog & { hasRequest?: boolean; hasResponse?: boolean };
  if (hasRequest) out.hasRequest = true;
  if (hasResponse) out.hasResponse = true;
  return out;
}

function invalidateDayCache(day?: string): void {
  if (day) dayLogCache.delete(day);
  else dayLogCache.clear();
}

function invalidateStatsCacheSoft(): void {
  void import("./stats.js")
    .then((m) => {
      m.invalidateUsageStatsCache?.();
    })
    .catch(() => {
      // ignore circular/load races
    });
}

function invalidateDiskInfoCache(): void {
  diskInfoCache = null;
}

export interface AppendLogInput {
  mode: ProxyMode;
  path: string;
  model?: string;
  stream: boolean;
  apiKeyId?: string | null;
  apiKeyAlias?: string | null;
  userId?: string | null;
  accountId?: string;
  accountName?: string;
  status: number;
  ok: boolean;
  latencyMs: number;
  /** Ms from proxy accept to outbound LLM fetch */
  localPrepMs?: number;
  /** TTFT from outbound LLM fetch start to first upstream body byte */
  firstTokenMs?: number;
  error?: string;
  request?: unknown;
  requestTruncated?: boolean;
  response?: unknown;
  responseTruncated?: boolean;
  usage?: TokenUsage;
  reasoningEffort?: string | null;
  headers?: Record<string, string>;
  userAgent?: string;
  client?: string;
  fallback?: boolean;
  fallbackFromPath?: string;
  fallbackToPath?: string;
  fallbackReason?: string;
  fallbackOriginalStatus?: number;
  fallbackOriginalError?: string;
  effectiveMode?: ProxyMode | "chat" | "responses";
  effectivePath?: string;
  inputSanitized?: boolean;
  inputFixedReasoning?: number;
  inputConvertedCustomCalls?: number;
  inputDroppedItems?: number;
}

export function appendRequestLog(input: AppendLogInput): Promise<RequestLog> {
  const ts = Date.now();
  const entry: RequestLog = {
    id: randomId(8),
    ts,
    day: dayKey(ts),
    ...input,
  };

  writeChain = writeChain
    .then(async () => {
      await mkdir(logsDir(), { recursive: true });
      await appendFile(dayFile(entry.day), JSON.stringify(entry) + "\n", "utf8");

      // Keep day cache warm when possible
      try {
        const file = dayFile(entry.day);
        const s = await stat(file);
        const cached = dayLogCache.get(entry.day);
        if (cached && cached.size <= s.size) {
          cached.rows.push(toCachedLog(entry));
          cached.size = s.size;
          cached.mtimeMs = s.mtimeMs;
        } else {
          invalidateDayCache(entry.day);
        }
      } catch {
        invalidateDayCache(entry.day);
      }

      // Stats rely on TTL (~15s); avoid thrashing cache on every append.
      invalidateDiskInfoCache();

      // Opportunistic cleanup every 10 minutes
      if (Date.now() - lastCleanupAt > 600_000) {
        lastCleanupAt = Date.now();
        const settings = await loadSettings();
        await cleanupLogs({ retentionDays: settings.logRetentionDays });
      }
    })
    .catch(() => {
      // never break proxy path
    });

  return writeChain.then(() => entry);
}

export interface ListLogsQuery {
  page?: number;
  limit?: number;
  day?: string;
  model?: string;
  accountId?: string;
  apiKeyId?: string;
  userId?: string;
  /** Restrict to these key ids (user isolation) */
  apiKeyIds?: string[];
  ok?: boolean;
  /** Free-text search across model/client/UA/names/ids/error */
  q?: string;
}

export interface ListLogsResult {
  items: RequestLogListItem[];
  total: number;
  page: number;
  limit: number;
  days: string[];
}

export async function listRequestLogs(query: ListLogsQuery = {}): Promise<ListLogsResult> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const days = await listLogDays();
  const targetDays = query.day ? days.filter((d) => d === query.day) : days;

  // Parallel per-day reads (hit memory cache when warm)
  const dayRows = await Promise.all(targetDays.map((day) => readDayLogs(day)));
  const all: RequestLog[] = [];
  for (const rows of dayRows) all.push(...rows);
  all.sort((a, b) => b.ts - a.ts);

  let filtered = all;
  if (query.model) filtered = filtered.filter((r) => r.model === query.model);
  if (query.accountId) filtered = filtered.filter((r) => r.accountId === query.accountId);
  if (query.apiKeyId) filtered = filtered.filter((r) => r.apiKeyId === query.apiKeyId);
  if (query.userId) {
    filtered = filtered.filter(
      (r) => r.userId === query.userId || (query.apiKeyIds?.includes(r.apiKeyId || "") ?? false),
    );
  } else if (query.apiKeyIds) {
    const set = new Set(query.apiKeyIds);
    filtered = filtered.filter((r) => r.apiKeyId != null && set.has(r.apiKeyId));
  }
  if (query.ok !== undefined) filtered = filtered.filter((r) => r.ok === query.ok);

  const q = (query.q || "").trim().toLowerCase();
  if (q) {
    // Search snapshot meta only — avoid live-name resolution on the full set
    filtered = filtered.filter((r) => logMatchesQuery(r, q));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  // List view never needs bodies — drop them; set has* before strip (response only)
  const pageSlice = filtered.slice(start, start + limit).map(slimLogForList);
  // Live display names only for the final page
  const items = await withLiveDisplayNames(pageSlice);
  return { items, total, page, limit, days };
}

function logMatchesQuery(r: RequestLog, q: string): boolean {
  const hay = [
    r.id,
    r.model,
    r.client,
    r.userAgent,
    r.apiKeyAlias,
    r.apiKeyId,
    r.accountName,
    r.accountId,
    r.userId,
    r.status,
    r.ok ? "ok" : "fail",
    r.error,
    r.path,
    r.mode,
  ]
    .filter((v) => v != null && v !== "")
    .map((v) => String(v).toLowerCase());
  return hay.some((v) => v.includes(q));
}

/** List item: meta only + body presence flags (not persisted to jsonl). */
export type RequestLogListItem = Omit<
  RequestLog,
  "request" | "response" | "requestTruncated" | "responseTruncated"
> & {
  hasRequest?: boolean;
  hasResponse?: boolean;
};

/** Drop heavy fields for table/list responses; capture body presence first. */
function slimLogForList(
  r: RequestLog & { hasRequest?: boolean; hasResponse?: boolean },
): RequestLogListItem {
  const hasRequest = r.hasRequest === true || r.request !== undefined;
  const hasResponse = r.hasResponse === true || r.response !== undefined;
  const {
    request: _req,
    response: _res,
    requestTruncated: _rt,
    responseTruncated: _rst,
    hasRequest: _hr,
    hasResponse: _hs,
    ...rest
  } = r;
  return {
    ...rest,
    ...(hasRequest ? { hasRequest: true } : {}),
    ...(hasResponse ? { hasResponse: true } : {}),
  };
}

/**
 * Resolve live account names + API key aliases for display
 * (historical logs store snapshot names that can go stale after rename).
 */
export async function withLiveDisplayNames<T extends RequestLog>(
  logs: T[],
): Promise<T[]> {
  if (!logs.length) return logs;
  const [accounts, keys] = await Promise.all([listAccounts(), listApiKeys()]);
  const nameById = new Map(accounts.map((a) => [a.id, a.name]));
  const aliasById = new Map(keys.map((k) => [k.id, k.alias || k.keyPrefix]));
  return logs.map((r) => {
    let next = r;
    if (r.accountId) {
      const live = nameById.get(r.accountId);
      if (live && live !== r.accountName) next = { ...next, accountName: live };
    }
    if (r.apiKeyId) {
      const live = aliasById.get(r.apiKeyId);
      if (live && live !== r.apiKeyAlias) next = { ...next, apiKeyAlias: live };
    }
    return next;
  });
}

/** @deprecated use withLiveDisplayNames */
export async function withLiveAccountNames(
  logs: RequestLog[],
): Promise<RequestLog[]> {
  return withLiveDisplayNames(logs);
}

function stripBodiesFromEntry(r: RequestLog): { entry: RequestLog; changed: boolean } {
  const hasBody =
    r.request !== undefined ||
    r.response !== undefined ||
    r.requestTruncated !== undefined ||
    r.responseTruncated !== undefined;
  if (!hasBody) return { entry: r, changed: false };
  const {
    request: _req,
    response: _res,
    requestTruncated: _rt,
    responseTruncated: _rst,
    ...rest
  } = r;
  return { entry: rest, changed: true };
}

async function atomicWriteText(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const tmp = path.join(
    dir,
    `${path.basename(filePath)}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`,
  );
  await writeFile(tmp, content, "utf8");
  try {
    await rename(tmp, filePath);
  } catch {
    try {
      await unlink(filePath);
    } catch {
      // ignore
    }
    try {
      await rename(tmp, filePath);
    } catch {
      const { copyFile } = await import("node:fs/promises");
      await copyFile(tmp, filePath);
      await unlink(tmp).catch(() => {});
    }
  }
}

export interface StripBodiesResult {
  days: number;
  rows: number;
  stripped: number;
  bytesBefore: number;
  bytesAfter: number;
}

/**
 * Rewrite all log files without request/response bodies.
 * Serialized on writeChain so concurrent appends stay ordered.
 */
export function stripLogBodies(): Promise<StripBodiesResult> {
  const run = writeChain.then(async () => {
    const days = await listLogDays();
    let rows = 0;
    let stripped = 0;
    let bytesBefore = 0;
    let bytesAfter = 0;

    for (const day of days) {
      const file = dayFile(day);
      let raw: string;
      try {
        raw = await readFile(file, "utf8");
        bytesBefore += Buffer.byteLength(raw, "utf8");
      } catch {
        continue;
      }

      const lines = raw.split("\n");
      const outLines: string[] = [];
      let dayChanged = false;

      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        try {
          const parsed = JSON.parse(t) as RequestLog;
          rows += 1;
          const { entry, changed } = stripBodiesFromEntry(parsed);
          if (changed) {
            stripped += 1;
            dayChanged = true;
          }
          outLines.push(JSON.stringify(entry));
        } catch {
          outLines.push(t);
        }
      }

      const next = outLines.length ? outLines.join("\n") + "\n" : "";
      if (dayChanged) {
        await atomicWriteText(file, next);
        bytesAfter += Buffer.byteLength(next, "utf8");
      } else {
        bytesAfter += Buffer.byteLength(raw, "utf8");
      }

      invalidateDayCache(day);
    }

    invalidateStatsCacheSoft();
    invalidateDiskInfoCache();
    return { days: days.length, rows, stripped, bytesBefore, bytesAfter };
  });

  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getRequestLog(id: string): Promise<RequestLog | undefined> {
  const days = await listLogDays();
  // Day cache holds slim meta only — locate day first, then re-read full line for bodies.
  for (const day of days) {
    const rows = await readDayLogs(day);
    if (!rows.some((r) => r.id === id)) continue;
    const full = await readFullLogFromDay(day, id);
    if (full) return full;
  }
  return undefined;
}

/** Parse one day file without using the slim cache; return full row by id. */
async function readFullLogFromDay(day: string, id: string): Promise<RequestLog | undefined> {
  try {
    const raw = await readFile(dayFile(day), "utf8");
    for (const line of raw.split("\n")) {
      const tline = line.trim();
      if (!tline) continue;
      try {
        const row = JSON.parse(tline) as RequestLog;
        if (row.id === id) return row;
      } catch {
        // skip bad line
      }
    }
  } catch {
    // missing day file
  }
  return undefined;
}

export async function listLogDays(): Promise<string[]> {
  try {
    await mkdir(logsDir(), { recursive: true });
    const files = await readdir(logsDir());
    return files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f))
      .map((f) => f.replace(/\.jsonl$/, ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

async function readDayLogs(day: string): Promise<RequestLog[]> {
  const file = dayFile(day);
  try {
    const s = await stat(file);
    const cached = dayLogCache.get(day);
    if (cached && cached.size === s.size && cached.mtimeMs === s.mtimeMs) {
      return cached.rows;
    }
  } catch {
    return [];
  }

  const inflight = dayLogInflight.get(day);
  if (inflight) return inflight;

  const load = (async () => {
    const filePath = dayFile(day);
    try {
      const s = await stat(filePath);
      const cached = dayLogCache.get(day);
      if (cached && cached.size === s.size && cached.mtimeMs === s.mtimeMs) {
        return cached.rows;
      }

      const raw = await readFile(filePath, "utf8");
      const out: RequestLog[] = [];
      for (const line of raw.split("\n")) {
        const tline = line.trim();
        if (!tline) continue;
        try {
          out.push(toCachedLog(JSON.parse(tline) as RequestLog));
        } catch {
          // skip bad line
        }
      }

      dayLogCache.set(day, { size: s.size, mtimeMs: s.mtimeMs, rows: out });
      return out;
    } catch {
      return [];
    }
  })();

  dayLogInflight.set(day, load);
  try {
    return await load;
  } finally {
    if (dayLogInflight.get(day) === load) dayLogInflight.delete(day);
  }
}

export async function readLogsSince(daysBack: number): Promise<RequestLog[]> {
  const days = await listLogDays();
  let selected: string[];
  if (daysBack <= 0) {
    selected = days;
  } else {
    const cutoff = dayKey(Date.now() - (daysBack - 1) * 86400_000);
    selected = days.filter((d) => d >= cutoff);
  }
  const dayRows = await Promise.all(selected.map((d) => readDayLogs(d)));
  const all: RequestLog[] = [];
  for (const rows of dayRows) all.push(...rows);
  return all;
}

export interface CleanupResult {
  deletedDays: string[];
  keptDays: string[];
}

export async function cleanupLogs(opts: {
  retentionDays?: number;
  beforeDay?: string;
  all?: boolean;
}): Promise<CleanupResult> {
  const days = await listLogDays();
  const deletedDays: string[] = [];
  const keptDays: string[] = [];

  for (const day of days) {
    let del = false;
    if (opts.all) del = true;
    else if (opts.beforeDay) del = day < opts.beforeDay;
    else {
      const retention = Math.max(1, opts.retentionDays ?? 7);
      const keepFrom = dayKey(Date.now() - (retention - 1) * 86400_000);
      del = day < keepFrom;
    }

    if (del) {
      try {
        await unlink(dayFile(day));
        deletedDays.push(day);
      } catch {
        // ignore
      }
      invalidateDayCache(day);
    } else {
      keptDays.push(day);
    }
  }

  if (deletedDays.length) {
    invalidateStatsCacheSoft();
    invalidateDiskInfoCache();
  }

  return { deletedDays, keptDays };
}

interface DiskInfoCache {
  at: number;
  value: { days: number; bytes: number };
}
let diskInfoCache: DiskInfoCache | null = null;
const DISK_INFO_TTL_MS = 30_000;

export async function logsDiskInfo(): Promise<{ days: number; bytes: number }> {
  const now = Date.now();
  if (diskInfoCache && now - diskInfoCache.at < DISK_INFO_TTL_MS) {
    return diskInfoCache.value;
  }

  const days = await listLogDays();
  let bytes = 0;
  // Parallel stat for day files
  const sizes = await Promise.all(
    days.map(async (day) => {
      try {
        const s = await stat(dayFile(day));
        return s.size;
      } catch {
        return 0;
      }
    }),
  );
  for (const n of sizes) bytes += n;

  const value = { days: days.length, bytes };
  diskInfoCache = { at: now, value };
  return value;
}
