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
}

export interface ListLogsResult {
  items: RequestLog[];
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

  // Load newest first across selected days
  const all: RequestLog[] = [];
  for (const day of targetDays) {
    const rows = await readDayLogs(day);
    all.push(...rows);
  }
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

  const total = filtered.length;
  const start = (page - 1) * limit;
  // List view never needs bodies — drop them to cut JSON size / UI lag
  const items = filtered.slice(start, start + limit).map(slimLogForList);
  return { items, total, page, limit, days };
}

/** Drop heavy fields for table/list responses. */
function slimLogForList(r: RequestLog): RequestLog {
  if (r.request === undefined && r.response === undefined) return r;
  const { request: _req, response: _res, requestTruncated: _rt, responseTruncated: _rst, ...rest } =
    r;
  return rest;
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
    }

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
  for (const day of days) {
    const rows = await readDayLogs(day);
    const hit = rows.find((r) => r.id === id);
    if (hit) return hit;
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
  try {
    const raw = await readFile(dayFile(day), "utf8");
    const out: RequestLog[] = [];
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        out.push(JSON.parse(t) as RequestLog);
      } catch {
        // skip bad line
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function readLogsSince(daysBack: number): Promise<RequestLog[]> {
  const days = await listLogDays();
  if (daysBack <= 0) {
    const all: RequestLog[] = [];
    for (const d of days) all.push(...(await readDayLogs(d)));
    return all;
  }
  const cutoff = dayKey(Date.now() - (daysBack - 1) * 86400_000);
  const selected = days.filter((d) => d >= cutoff);
  const all: RequestLog[] = [];
  for (const d of selected) all.push(...(await readDayLogs(d)));
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
    } else {
      keptDays.push(day);
    }
  }

  return { deletedDays, keptDays };
}

export async function logsDiskInfo(): Promise<{ days: number; bytes: number }> {
  const days = await listLogDays();
  let bytes = 0;
  for (const day of days) {
    try {
      const s = await stat(dayFile(day));
      bytes += s.size;
    } catch {
      // ignore
    }
  }
  return { days: days.length, bytes };
}
