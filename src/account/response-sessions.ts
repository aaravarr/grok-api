import { kvGetJson, kvSetJson } from "../db/sqlite.js";
import { now } from "../utils.js";

/**
 * Sticky mapping for Responses API conversation continuity.
 *
 * xAI context compaction returns an opaque encrypted blob that can only be
 * decoded by the same upstream account/session family that produced it.
 * If our pool routes a follow-up turn to another SuperGrok seat, upstream
 * returns: "Could not decode the compaction blob...".
 *
 * We remember response ids / compaction ids -> accountId and pin later turns.
 */

type ResponseSessionRecord = {
  key: string;
  accountId: string;
  accountName?: string;
  createdAt: number;
  updatedAt: number;
  callerUserId?: string | null;
  kind?: "response" | "compaction" | "unknown";
};

type ResponseSessionStore = {
  sessions: Record<string, ResponseSessionRecord>;
};

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 8000;
const NS = "response-sessions";
const KEY = "store";

let cache: ResponseSessionStore | null = null;
let writeChain: Promise<void> = Promise.resolve();

function emptyStore(): ResponseSessionStore {
  return { sessions: {} };
}

function prune(store: ResponseSessionStore): ResponseSessionStore {
  const cutoff = now() - TTL_MS;
  const entries = Object.entries(store.sessions || {})
    .filter(([, s]) => s && typeof s.key === "string" && s.updatedAt >= cutoff)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, MAX_SESSIONS);
  return { sessions: Object.fromEntries(entries) };
}

function persist(store: ResponseSessionStore): void {
  kvSetJson(NS, KEY, store);
}

async function loadStore(): Promise<ResponseSessionStore> {
  if (cache) return cache;
  const fromDb = kvGetJson<ResponseSessionStore>(NS, KEY);
  cache =
    fromDb != null
      ? prune({
          sessions:
            fromDb && typeof fromDb === "object" && fromDb.sessions ? fromDb.sessions : {},
        })
      : emptyStore();
  return cache;
}

async function saveStore(store: ResponseSessionStore): Promise<void> {
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

function kindOfKey(key: string): ResponseSessionRecord["kind"] {
  if (key.startsWith("cmp_")) return "compaction";
  if (key.startsWith("resp_") || key.length >= 16) return "response";
  return "unknown";
}

export async function rememberResponseSession(opts: {
  key: string;
  accountId: string;
  accountName?: string;
  callerUserId?: string | null;
  kind?: ResponseSessionRecord["kind"];
}): Promise<void> {
  const key = String(opts.key || "").trim();
  const accountId = String(opts.accountId || "").trim();
  if (!key || !accountId) return;
  const store = await loadStore();
  const prev = store.sessions[key];
  const ts = now();
  store.sessions[key] = {
    key,
    accountId,
    accountName: opts.accountName || prev?.accountName,
    createdAt: prev?.createdAt || ts,
    updatedAt: ts,
    callerUserId: opts.callerUserId ?? prev?.callerUserId ?? null,
    kind: opts.kind || prev?.kind || kindOfKey(key),
  };
  await saveStore(store);
}

export async function lookupResponseSessionAccount(key: string): Promise<string | undefined> {
  const id = String(key || "").trim();
  if (!id) return undefined;
  const store = await loadStore();
  const rec = store.sessions[id];
  if (!rec) return undefined;
  if (rec.updatedAt < now() - TTL_MS) {
    delete store.sessions[id];
    await saveStore(store);
    return undefined;
  }
  rec.updatedAt = now();
  store.sessions[id] = rec;
  void saveStore(store);
  return rec.accountId;
}

function pushKey(out: string[], seen: Set<string>, v: unknown) {
  if (typeof v !== "string") return;
  const key = v.trim();
  if (!key || seen.has(key)) return;
  seen.add(key);
  out.push(key);
}

/** Collect sticky keys from a responses request body (ids that imply prior state). */
export function extractResponseStickyKeysFromRequest(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const b = body as Record<string, unknown>;
  const out: string[] = [];
  const seen = new Set<string>();

  pushKey(out, seen, b.previous_response_id);
  pushKey(out, seen, b.response_id);
  // some clients may send conversation continuity fields
  pushKey(out, seen, b.conversation_id);

  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || node == null) return;
    if (Array.isArray(node)) {
      for (const it of node) walk(it, depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const type = typeof o.type === "string" ? o.type.toLowerCase() : "";
    if (type === "compaction" || type === "response.compaction") {
      pushKey(out, seen, o.id);
      // encrypted_content alone cannot map without id; keep id if present
    }
    if (typeof o.id === "string" && (String(o.id).startsWith("cmp_") || String(o.id).startsWith("resp_"))) {
      pushKey(out, seen, o.id);
    }
    if (o.encrypted_content && typeof o.id === "string") {
      pushKey(out, seen, o.id);
    }
    for (const v of Object.values(o)) {
      if (v && typeof v === "object") walk(v, depth + 1);
    }
  };

  walk(b.input);
  walk(b.output);
  return out;
}

/** Collect sticky keys from a responses response body / SSE aggregate. */
export function extractResponseStickyKeysFromResponse(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const o = payload as Record<string, unknown>;
  pushKey(out, seen, o.id);
  pushKey(out, seen, o.previous_response_id);

  const walk = (node: unknown, depth = 0) => {
    if (depth > 8 || node == null) return;
    if (Array.isArray(node)) {
      for (const it of node) walk(it, depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const type = typeof obj.type === "string" ? obj.type.toLowerCase() : "";
    if (type.includes("compaction") || type === "compaction") {
      pushKey(out, seen, obj.id);
    }
    if (typeof obj.id === "string" && (obj.id.startsWith("cmp_") || obj.id.startsWith("resp_"))) {
      pushKey(out, seen, obj.id);
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") walk(v, depth + 1);
    }
  };
  walk(o.output);
  walk(o);
  return out;
}

/** Best-effort parse sticky keys from SSE text capture. */
export function extractResponseStickyKeysFromSseText(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  if (!text) return out;
  // response ids / compaction ids
  const re = /\b((?:resp|cmp)_[A-Za-z0-9_-]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    pushKey(out, seen, m[1]);
    if (out.length >= 20) break;
  }
  // also try JSON parse of data lines for structured output
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const raw = line.slice(5).trim();
    if (!raw || raw === "[DONE]") continue;
    try {
      const obj = JSON.parse(raw);
      for (const k of extractResponseStickyKeysFromResponse(obj)) pushKey(out, seen, k);
    } catch {
      /* ignore */
    }
    if (out.length >= 30) break;
  }
  return out;
}
