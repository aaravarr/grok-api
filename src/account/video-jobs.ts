import { kvGetJson, kvSetJson } from "../db/sqlite.js";
import { now } from "../utils.js";

type VideoJobRecord = {
  requestId: string;
  accountId: string;
  accountName?: string;
  createdAt: number;
  updatedAt: number;
  callerUserId?: string | null;
};

type VideoJobStore = {
  jobs: Record<string, VideoJobRecord>;
};

const TTL_MS = 48 * 60 * 60 * 1000;
const MAX_JOBS = 5000;
const NS = "video-jobs";
const KEY = "store";

let cache: VideoJobStore | null = null;
let writeChain: Promise<void> = Promise.resolve();

function emptyStore(): VideoJobStore {
  return { jobs: {} };
}

function prune(store: VideoJobStore): VideoJobStore {
  const cutoff = now() - TTL_MS;
  const entries = Object.entries(store.jobs || {})
    .filter(([, job]) => job && typeof job.requestId === "string" && job.updatedAt >= cutoff)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, MAX_JOBS);
  return {
    jobs: Object.fromEntries(entries),
  };
}

function persist(store: VideoJobStore): void {
  kvSetJson(NS, KEY, store);
}

async function loadStore(): Promise<VideoJobStore> {
  if (cache) return cache;
  const fromDb = kvGetJson<VideoJobStore>(NS, KEY);
  cache =
    fromDb != null
      ? prune({
          jobs: fromDb && typeof fromDb === "object" && fromDb.jobs ? fromDb.jobs : {},
        })
      : emptyStore();
  return cache;
}

async function saveStore(store: VideoJobStore): Promise<void> {
  cache = prune(store);
  const run = writeChain.then(() => {
    persist(cache!);
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  await run;
}

export async function rememberVideoJob(opts: {
  requestId: string;
  accountId: string;
  accountName?: string;
  callerUserId?: string | null;
}): Promise<void> {
  const requestId = String(opts.requestId || "").trim();
  const accountId = String(opts.accountId || "").trim();
  if (!requestId || !accountId) return;
  const store = await loadStore();
  const prev = store.jobs[requestId];
  const ts = now();
  store.jobs[requestId] = {
    requestId,
    accountId,
    accountName: opts.accountName || prev?.accountName,
    createdAt: prev?.createdAt || ts,
    updatedAt: ts,
    callerUserId: opts.callerUserId ?? prev?.callerUserId ?? null,
  };
  await saveStore(store);
}

export async function lookupVideoJobAccount(requestId: string): Promise<string | undefined> {
  const id = String(requestId || "").trim();
  if (!id) return undefined;
  const store = await loadStore();
  const job = store.jobs[id];
  if (!job) return undefined;
  if (job.updatedAt < now() - TTL_MS) {
    delete store.jobs[id];
    await saveStore(store);
    return undefined;
  }
  // touch for retention
  job.updatedAt = now();
  store.jobs[id] = job;
  void saveStore(store);
  return job.accountId;
}

export function extractVideoRequestId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const body = payload as Record<string, unknown>;
  const candidates = [body.request_id, body.id, body.job_id];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return undefined;
}

export function extractVideoRequestIdFromPath(pathValue: string): string | undefined {
  const m = String(pathValue || "").match(/\/videos\/([^/?#]+)/i);
  if (!m) return undefined;
  try {
    return decodeURIComponent(m[1] || "").trim() || undefined;
  } catch {
    return (m[1] || "").trim() || undefined;
  }
}
