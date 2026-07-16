import { kvGet, kvSet } from "../db/sqlite.js";
import { now } from "../utils.js";

/**
 * Responses continuity store (trial):
 * - remember plaintext turns
 * - remember opaque items (compaction / encrypted_content / full output items) verbatim
 * - on later turns, prefer replaying stored opaque items as-is
 * - do NOT strip client opaque blobs as a "degrade" path
 */

export type ConversationMessage = {
  role: "user" | "assistant" | "system" | "developer" | "tool";
  content: string;
  ts: number;
};

export type ConversationPreferredMode = "responses" | "chat";

type ConversationRecord = {
  id: string;
  messages: ConversationMessage[];
  /** Verbatim opaque/continuity items from last successful upstream response */
  opaqueItems: unknown[];
  /** last response id if known */
  lastResponseId?: string | null;
  /**
   * Session lineage:
   * - responses: born/kept on Responses API
   * - chat: has Completions history; keep using Completions when client hits /responses
   */
  preferredMode?: ConversationPreferredMode | null;
  createdAt: number;
  updatedAt: number;
  lastAccountId?: string | null;
};

type ConversationStore = {
  conversations: Record<string, ConversationRecord>;
  aliases: Record<string, string>;
};

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CONVERSATIONS = 300;
const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8_000;
const MAX_OPAQUE_ITEMS = 4;
/** Per opaque item serialized size cap (chars ≈ bytes for ASCII/base64 blobs). */
const MAX_OPAQUE_ITEM_CHARS = 8_000;
/** Per-conversation opaque payload total cap. */
const MAX_OPAQUE_TOTAL_CHARS = 32_000;
/** Refuse to persist a store larger than this; hard-prune first. */
const MAX_STORE_PERSIST_CHARS = 8_000_000;
/** Never JSON.parse a raw kv blob bigger than this into the hot path. */
const MAX_STORE_LOAD_RAW_CHARS = 20_000_000;
const NS = "conversations";
const KEY = "store";

let cache: ConversationStore | null = null;
let writeChain: Promise<void> = Promise.resolve();

function emptyStore(): ConversationStore {
  return { conversations: {}, aliases: {} };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Bounded JSON clone for opaque continuity items.
 * Oversized compaction / encrypted_content blobs are reduced to type/id placeholders
 * instead of deep-cloning multi-MB payloads into the single store key.
 */
function boundedCloneOpaqueItem(item: unknown): unknown | null {
  if (item == null) return null;
  let raw: string;
  try {
    raw = JSON.stringify(item);
  } catch {
    return null;
  }
  if (raw.length <= MAX_OPAQUE_ITEM_CHARS) {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  // Prefer dropping dangerous blobs over stuffing the store.
  if (!isObj(item)) return null;
  const type = typeof item.type === "string" ? item.type : "unknown";
  const id = typeof item.id === "string" ? item.id : undefined;
  const placeholder: Record<string, unknown> = {
    type,
    _truncated: true,
    _origChars: raw.length,
  };
  if (id) placeholder.id = id;
  // Keep a short fingerprint only (never the full encrypted_content / compaction blob).
  const enc = item.encrypted_content;
  if (typeof enc === "string" && enc.length > 0) {
    placeholder.encrypted_content_fp = enc.slice(0, 24);
  }
  return placeholder;
}

/** Cap opaque list: item count, per-item size, and total serialized budget. */
function capOpaqueItems(items: unknown[] | undefined | null): unknown[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  const recent = items.slice(-MAX_OPAQUE_ITEMS);
  const out: unknown[] = [];
  let total = 0;
  for (const item of recent) {
    const cloned = boundedCloneOpaqueItem(item);
    if (cloned == null) continue;
    let len: number;
    try {
      len = JSON.stringify(cloned).length;
    } catch {
      continue;
    }
    if (len > MAX_OPAQUE_ITEM_CHARS) continue;
    if (total + len > MAX_OPAQUE_TOTAL_CHARS) continue;
    out.push(cloned);
    total += len;
  }
  return out;
}

function clipContent(s: string): string {
  if (s.length <= MAX_CONTENT_CHARS) return s;
  return s.slice(0, MAX_CONTENT_CHARS) + "\n…[truncated]";
}

function filterAliases(
  aliases: Record<string, string> | undefined,
  valid: Set<string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(aliases || {})) {
    if (!valid.has(v)) continue;
    // Drop historical poison: bare content fingerprints mixed threads.
    if (k.startsWith("fp_") || k.includes("::fp_")) continue;
    out[k] = v;
  }
  return out;
}

function prune(store: ConversationStore): ConversationStore {
  const cutoff = now() - TTL_MS;
  const entries = Object.entries(store.conversations || {})
    .filter(([, c]) => c && c.updatedAt >= cutoff)
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, MAX_CONVERSATIONS);
  const conversations = Object.fromEntries(
    entries.map(([id, c]) => [
      id,
      {
        ...c,
        messages: (c.messages || [])
          .slice(-MAX_MESSAGES)
          .map((m) => ({
            ...m,
            content: clipContent(String(m?.content || "")),
          })),
        opaqueItems: capOpaqueItems(c.opaqueItems),
      },
    ]),
  );
  const valid = new Set(Object.keys(conversations));
  return { conversations, aliases: filterAliases(store.aliases, valid) };
}

/**
 * If the serialized store still exceeds the persist budget after normal prune,
 * progressively destroy data rather than freeze the event loop / blow up sqlite.
 */
function ensurePersistBudget(store: ConversationStore): ConversationStore {
  let s = prune(store);
  let json: string;
  try {
    json = JSON.stringify(s);
  } catch {
    return emptyStore();
  }
  if (json.length <= MAX_STORE_PERSIST_CHARS) return s;

  console.warn(
    `[conversations] store oversized before persist (${json.length} chars); hard-pruning`,
  );

  // 1) Keep newest half of conversations and clear all opaque payloads.
  const ranked = Object.entries(s.conversations || {}).sort(
    (a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0),
  );
  const halfN = Math.max(1, Math.floor(ranked.length / 2));
  let kept = ranked.slice(0, halfN);
  let conversations = Object.fromEntries(
    kept.map(([id, c]) => [id, { ...c, opaqueItems: [] as unknown[] }]),
  );
  s = {
    conversations,
    aliases: filterAliases(s.aliases, new Set(Object.keys(conversations))),
  };
  try {
    json = JSON.stringify(s);
  } catch {
    return emptyStore();
  }
  if (json.length <= MAX_STORE_PERSIST_CHARS) return s;

  // 2) Still too large: keep only 50 newest sessions, no opaque.
  kept = ranked.slice(0, 50);
  conversations = Object.fromEntries(
    kept.map(([id, c]) => [
      id,
      {
        ...c,
        messages: (c.messages || []).slice(-MAX_MESSAGES),
        opaqueItems: [] as unknown[],
      },
    ]),
  );
  s = {
    conversations,
    aliases: filterAliases(s.aliases, new Set(Object.keys(conversations))),
  };
  try {
    json = JSON.stringify(s);
  } catch {
    return emptyStore();
  }
  if (json.length > MAX_STORE_PERSIST_CHARS) {
    console.warn(
      `[conversations] store still oversized after hard-prune (${json.length}); using empty store`,
    );
    return emptyStore();
  }
  return s;
}

function persist(store: ConversationStore): void {
  const bounded = ensurePersistBudget(store);
  // Align in-memory cache with what we actually write when this is the live store.
  if (cache === store || cache == null) {
    cache = bounded;
  }
  try {
    kvSet(NS, KEY, JSON.stringify(bounded));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[conversations] persist failed: ${msg}`);
  }
}

async function loadStore(): Promise<ConversationStore> {
  if (cache) return cache;
  const raw = kvGet(NS, KEY);
  if (raw == null) {
    cache = emptyStore();
    return cache;
  }
  if (raw.length > MAX_STORE_LOAD_RAW_CHARS) {
    console.warn(
      `[conversations] store raw too large (${raw.length} chars > ${MAX_STORE_LOAD_RAW_CHARS}); resetting to empty`,
    );
    cache = emptyStore();
    // Fire-and-forget empty write; do not block the request on large I/O.
    schedulePersist(cache);
    return cache;
  }
  let fromDb: ConversationStore | null = null;
  try {
    fromDb = JSON.parse(raw) as ConversationStore;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[conversations] store JSON parse failed: ${msg}; using empty`);
    cache = emptyStore();
    schedulePersist(cache);
    return cache;
  }
  cache = ensurePersistBudget({
    conversations: fromDb?.conversations || {},
    aliases: fromDb?.aliases || {},
  });
  // If load-time prune shrunk a previously huge blob, write back asynchronously.
  if (raw.length > MAX_STORE_PERSIST_CHARS) {
    schedulePersist(cache);
  }
  return cache;
}

/** Enqueue disk write without awaiting it on the request path. */
function schedulePersist(store: ConversationStore): void {
  const snapshot = store;
  const run = writeChain.then(() => {
    // Prefer latest cache if present (coalesces rapid updates).
    persist(cache ?? snapshot);
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
}

async function saveStore(store: ConversationStore): Promise<void> {
  // Memory is the source of truth for the hot path; disk is best-effort.
  cache = ensurePersistBudget(store);
  schedulePersist(cache);
  // Intentionally do not await writeChain — large JSON.stringify + DatabaseSync
  // must not block health checks / request handlers.
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const p of content) {
      if (typeof p === "string") parts.push(p);
      else if (isObj(p)) {
        if (typeof p.text === "string") parts.push(p.text);
        else if (typeof p.content === "string") parts.push(p.content);
        else if (typeof p.output_text === "string") parts.push(p.output_text);
      }
    }
    return parts.join("");
  }
  if (isObj(content) && typeof content.text === "string") return content.text;
  return "";
}

export function isOpaqueInputItem(item: unknown): boolean {
  if (!isObj(item)) return false;
  const type = String(item.type || "").toLowerCase();
  const enc = item.encrypted_content;
  const hasEnc = typeof enc === "string" ? enc.trim().length > 0 : enc != null;
  if (type.includes("compaction") && hasEnc) return true;
  if (hasEnc) return true;
  if (type.includes("encrypted") && hasEnc) return true;
  // Empty reasoning shells (content:null / empty encrypted_content) are not opaque.
  return false;
}

/**
 * HARD RULE for session identity (Codex Desktop):
 * - Primary key: client_metadata.thread_id (fallback session_id)
 * - Secondary: previous_response_id / response_id / cmp_* only as aliases UNDER that thread
 * - NEVER use plaintext content fingerprints as global keys (that caused cross-thread mixing)
 */

function codexThreadIdFromBody(body: Record<string, unknown>): string | null {
  const meta = isObj(body.client_metadata) ? body.client_metadata : null;
  if (meta) {
    if (typeof meta.thread_id === "string" && meta.thread_id.trim()) return meta.thread_id.trim();
    if (typeof meta.session_id === "string" && meta.session_id.trim()) return meta.session_id.trim();
    const turnMeta = meta["x-codex-turn-metadata"];
    if (typeof turnMeta === "string" && turnMeta.trim().startsWith("{")) {
      try {
        const tm = JSON.parse(turnMeta) as Record<string, unknown>;
        if (isObj(tm)) {
          if (typeof tm.thread_id === "string" && tm.thread_id.trim()) return tm.thread_id.trim();
          if (typeof tm.session_id === "string" && tm.session_id.trim()) return tm.session_id.trim();
        }
      } catch {
        /* ignore */
      }
    }
  }
  if (isObj(body.metadata)) {
    if (typeof body.metadata.thread_id === "string" && body.metadata.thread_id.trim()) {
      return body.metadata.thread_id.trim();
    }
    if (typeof body.metadata.session_id === "string" && body.metadata.session_id.trim()) {
      return body.metadata.session_id.trim();
    }
  }
  return null;
}

function threadConvId(threadId: string): string {
  return `thread:${threadId}`;
}

export function extractContinuityKeysFromRequest(body: unknown): string[] {
  if (!isObj(body)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v !== "string") return;
    const k = v.trim();
    if (!k || seen.has(k)) return;
    // Never accept bare content fingerprints
    if (k.startsWith("fp_") || k.includes("::fp_")) return;
    seen.add(k);
    out.push(k);
  };

  const threadId = codexThreadIdFromBody(body);
  if (threadId) {
    add(threadConvId(threadId));
    add(threadId);
  }

  // Continuity ids are secondary only
  add(body.previous_response_id);
  add(body.response_id);
  add(body.conversation_id);

  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || node == null) return;
    if (Array.isArray(node)) {
      for (const it of node) walk(it, depth + 1);
      return;
    }
    if (!isObj(node)) return;
    if (typeof node.id === "string") {
      const id = node.id.trim();
      if (id.startsWith("cmp_") || id.startsWith("resp_") || id.startsWith("rs_")) add(id);
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") walk(v, depth + 1);
    }
  };
  walk(body.input);
  return out;
}

export function extractPlainMessagesFromInput(input: unknown): ConversationMessage[] {
  const items = Array.isArray(input) ? input : input != null ? [input] : [];
  const out: ConversationMessage[] = [];
  const ts = now();
  for (const item of items) {
    if (!isObj(item) || isOpaqueInputItem(item)) continue;
    const type = String(item.type || "").toLowerCase();
    if (type.includes("function_call") || type.includes("tool_call") || type.includes("web_search_call")) continue;
    let role = String(item.role || "").toLowerCase();
    if (!role && (type === "message" || type === "input_text" || !type)) role = "user";
    if (!role) continue;
    if (!["user", "assistant", "system", "developer", "tool"].includes(role)) continue;
    const content = clipContent(textFromContent(item.content ?? item.text ?? item.input_text ?? ""));
    if (!content.trim()) continue;
    out.push({ role: role as ConversationMessage["role"], content, ts });
  }
  return out;
}

function requestHasOpaqueItems(body: unknown): boolean {
  if (!isObj(body)) return false;
  const input = body.input;
  const items = Array.isArray(input) ? input : input != null ? [input] : [];
  return items.some(isOpaqueInputItem);
}


export function extractPlainMessagesFromChatBody(body: unknown): ConversationMessage[] {
  if (!isObj(body) || !Array.isArray(body.messages)) return [];
  const ts = now();
  const out: ConversationMessage[] = [];
  for (const item of body.messages) {
    if (!isObj(item)) continue;
    let role = String(item.role || "").toLowerCase();
    if (role === "developer") role = "system";
    if (!["user", "assistant", "system", "tool"].includes(role)) continue;
    const content = clipContent(textFromContent(item.content ?? item.text ?? ""));
    if (!content.trim() && role !== "assistant") continue;
    out.push({ role: role as ConversationMessage["role"], content, ts });
  }
  return out;
}

/** Stable-ish fingerprint for plaintext chat history so lineage can survive mode switches. */
export function fingerprintPlainMessages(messages: ConversationMessage[]): string | null {
  const fps = fingerprintPlainMessageVariants(messages);
  return fps[0] || null;
}

/** Multiple fingerprints (full window + prefixes) for fuzzy lineage lookup across turns. */
export function fingerprintPlainMessageVariants(messages: ConversationMessage[]): string[] {
  const cleaned = (messages || [])
    .filter((m) => m && m.content && m.content.trim())
    .slice(-12)
    .map((m) => `${m.role}:${m.content.trim().slice(0, 400)}`);
  if (!cleaned.length) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  const addFrom = (parts: string[]) => {
    if (!parts.length) return;
    const raw = parts.join("\n");
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const fp = `fp_${(h >>> 0).toString(16)}`;
    if (!seen.has(fp)) {
      seen.add(fp);
      out.push(fp);
    }
  };

  // Prefer longer windows first.
  for (let n = cleaned.length; n >= 1; n--) {
    addFrom(cleaned.slice(-n));
    // Also hash prefix windows (history without the newest turn).
    if (n < cleaned.length) addFrom(cleaned.slice(0, n));
  }
  return out;
}

export function extractContinuityKeysFromChatBody(body: unknown): string[] {
  if (!isObj(body)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v !== "string") return;
    const k = v.trim();
    if (!k || seen.has(k) || k.startsWith("fp_") || k.includes("::fp_")) return;
    seen.add(k);
    out.push(k);
  };
  const threadId = codexThreadIdFromBody(body);
  if (threadId) {
    add(threadConvId(threadId));
    add(threadId);
  }
  if (isObj(body.metadata)) {
    add(body.metadata.conversation_id);
    add(body.metadata.thread_id);
    add(body.metadata.session_id);
  }
  add(body.conversation_id);
  add(body.previous_response_id);
  add(body.response_id);
  return out;
}


export async function loadConversationMessages(keys: string[]): Promise<ConversationMessage[]> {
  const rec = await loadConversation(keys);
  return rec?.messages ? rec.messages.slice() : [];
}

export async function getConversationLineage(keys: string[]): Promise<{
  hit: boolean;
  conversationId?: string;
  preferredMode?: ConversationPreferredMode | null;
  messageCount: number;
  lastAccountId?: string | null;
}> {
  const rec = await loadConversation(keys);
  if (!rec) return { hit: false, messageCount: 0 };
  return {
    hit: true,
    conversationId: rec.id,
    preferredMode: rec.preferredMode ?? null,
    messageCount: Array.isArray(rec.messages) ? rec.messages.length : 0,
    lastAccountId: rec.lastAccountId ?? null,
  };
}

async function loadConversation(keys: string[]): Promise<ConversationRecord | null> {
  if (!keys.length) return null;
  const store = await loadStore();

  const threadKeys = keys.filter((k) => k.startsWith("thread:") || k.startsWith("session:"));
  const strongKeys = keys.filter(
    (k) =>
      k.startsWith("resp_") ||
      k.startsWith("cmp_") ||
      k.startsWith("rs_") ||
      k.startsWith("conv_"),
  );

  // If Codex thread id is present, ONLY resolve via thread/session. Never fall through to shared secondary keys.
  const lookupOrder = threadKeys.length ? threadKeys : strongKeys;
  const seen = new Set<string>();
  for (const key of lookupOrder) {
    if (seen.has(key)) continue;
    seen.add(key);
    const id = store.aliases[key] || key;
    const rec = store.conversations[id];
    if (rec) return rec;
  }
  return null;
}


async function findStoredOpaqueByEncryptedContent(_enc: string): Promise<Record<string, unknown> | null> {
  // Intentionally disabled: global encrypted_content lookup can attach another thread's
  // opaque items and mix sessions. Restore only from the matched conversation record.
  return null;
}


/**
 * Fix Codex re-serialized reasoning/compaction items without modifying encrypted payload.
 *
 * Observed failure:
 *   prev: {type:"reasoning", id, status, summary, encrypted_content}
 *   next: {type:"reasoning", content:null, summary, encrypted_content}  // id/status dropped
 * xAI then returns: Could not decode the compaction blob...
 */

export async function sanitizeResponsesInputItems(body: unknown): Promise<{
  body: unknown;
  modified: boolean;
  fixedReasoning: number;
  convertedCustomCalls: number;
  droppedItems: number;
}> {
  if (!isObj(body)) {
    return { body, modified: false, fixedReasoning: 0, convertedCustomCalls: 0, droppedItems: 0 };
  }
  const input = body.input;
  if (!Array.isArray(input)) {
    return { body, modified: false, fixedReasoning: 0, convertedCustomCalls: 0, droppedItems: 0 };
  }

  // Load stored opaque items for continuity keys so we can restore full envelopes.
  const keys = extractContinuityKeysFromRequest(body);
  const rec = await loadConversation(keys);
  const storedOpaque = Array.isArray(rec?.opaqueItems) ? rec!.opaqueItems : [];
  const byEnc = new Map<string, Record<string, unknown>>();
  for (const it of storedOpaque) {
    if (!isObj(it)) continue;
    const enc = it.encrypted_content;
    if (typeof enc === "string" && enc.trim()) byEnc.set(enc, it);
  }

  let modified = false;
  let fixedReasoning = 0;
  let convertedCustomCalls = 0;
  let droppedItems = 0;
  const nextItems: unknown[] = [];

  const asArgsString = (v: unknown): string => {
    if (typeof v === "string") return v;
    try {
      return JSON.stringify(v ?? {});
    } catch {
      return String(v ?? "");
    }
  };

  /** xAI function tools require arguments to be a JSON object string. Freeform text must be wrapped. */
  const asJsonObjectArgsString = (v: unknown): string => {
    const raw = asArgsString(v);
    const s = String(raw || "").trim();
    if (!s) return "{}";
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return JSON.stringify(parsed);
      }
      // arrays/primitives are not accepted as tool arguments object
      return JSON.stringify({ input: parsed });
    } catch {
      // freeform patch text etc.
      return JSON.stringify({ input: raw });
    }
  };

  for (const item of input) {
    if (!isObj(item)) {
      nextItems.push(item);
      continue;
    }
    const type = String(item.type || "").toLowerCase();

    // Codex tool_search_* is not an xAI ModelInput variant.
    // Convert to function_call / function_call_output (cc-switch style).
    if (type === "tool_search_call") {
      const callId = String(item.call_id || item.id || `call_${nextItems.length + 1}`);
      const args = asJsonObjectArgsString(item.arguments ?? item.input ?? {});
      const out: Record<string, unknown> = {
        type: "function_call",
        call_id: callId,
        name: "tool_search",
        arguments: args,
      };
      if (typeof item.status === "string" && item.status.trim()) out.status = item.status;
      if (typeof item.id === "string" && item.id.trim()) out.id = item.id;
      nextItems.push(out);
      convertedCustomCalls += 1;
      modified = true;
      continue;
    }
    if (type === "tool_search_output") {
      const callId = String(item.call_id || item.id || `call_${nextItems.length + 1}`);
      // Prefer explicit output; otherwise stringify the whole payload minus type/call_id.
      let output: string;
      if (typeof item.output === "string") output = item.output;
      else if (item.output != null) output = asArgsString(item.output);
      else {
        const cloneItem: Record<string, unknown> = { ...item };
        delete cloneItem.type;
        delete cloneItem.call_id;
        delete cloneItem.id;
        delete cloneItem.status;
        delete cloneItem.execution;
        output = asArgsString(Object.keys(cloneItem).length ? cloneItem : "");
      }
      nextItems.push({
        type: "function_call_output",
        call_id: callId,
        output,
      });
      convertedCustomCalls += 1;
      modified = true;
      continue;
    }

    // Codex freeform tools use custom_tool_call*; xAI ModelInput expects function_call*.
    // cc-switch: arguments = JSON.stringify({ input: <raw freeform string> })
    if (type === "custom_tool_call") {
      const callId = String(item.call_id || item.id || `call_${nextItems.length + 1}`);
      const name = String(item.name || "tool");
      const rawInput = item.input ?? item.arguments ?? "";
      let args: string;
      if (typeof rawInput === "string") {
        args = JSON.stringify({ input: rawInput });
      } else {
        args = asJsonObjectArgsString(rawInput);
      }
      const out: Record<string, unknown> = {
        type: "function_call",
        call_id: callId,
        name,
        arguments: args,
      };
      if (typeof item.status === "string" && item.status.trim()) out.status = item.status;
      if (typeof item.id === "string" && item.id.trim()) out.id = item.id;
      nextItems.push(out);
      convertedCustomCalls += 1;
      modified = true;
      continue;
    }
    if (type === "custom_tool_call_output") {
      const callId = String(item.call_id || item.id || `call_${nextItems.length + 1}`);
      const output = typeof item.output === "string" ? item.output : asArgsString(item.output);
      nextItems.push({
        type: "function_call_output",
        call_id: callId,
        output,
      });
      convertedCustomCalls += 1;
      modified = true;
      continue;
    }

    // Ensure function_call.arguments is always a string for untagged enum parse.
    if (type === "function_call") {
      const out: Record<string, unknown> = { ...item, type: "function_call" };
      const nextArgs = asJsonObjectArgsString(out.arguments ?? out.input ?? {});
      if (out.arguments !== nextArgs) {
        out.arguments = nextArgs;
        modified = true;
      }
      if (!out.call_id && typeof out.id === "string") out.call_id = out.id;
      if ("content" in out && out.content == null) {
        delete out.content;
        modified = true;
      }
      nextItems.push(out);
      continue;
    }
    if (type === "function_call_output") {
      const out: Record<string, unknown> = { ...item, type: "function_call_output" };
      if (typeof out.output !== "string") {
        out.output = asArgsString(out.output);
        modified = true;
      }
      nextItems.push(out);
      continue;
    }

    if (type === "reasoning" || type.includes("compaction")) {
      const enc = item.encrypted_content;
      const hasEnc = typeof enc === "string" && enc.trim().length > 0;

      if (hasEnc) {
        let restored = byEnc.get(enc as string) || null;
        if (!restored) restored = await findStoredOpaqueByEncryptedContent(enc as string);
        if (restored) {
          const c = boundedCloneOpaqueItem(restored);
          if (c != null) nextItems.push(c);
          fixedReasoning += 1;
          modified = true;
          continue;
        }
      } else if (type === "reasoning") {
        // Codex often re-sends empty reasoning shells (content:null, empty encrypted_content).
        // xAI ModelInput rejects these; drop them rather than poisoning the request.
        droppedItems += 1;
        fixedReasoning += 1;
        modified = true;
        continue;
      }

      const out: Record<string, unknown> = { ...item };
      if (type === "reasoning") {
        if ("content" in out && out.content == null) {
          delete out.content;
          modified = true;
          fixedReasoning += 1;
        }
        // empty string encrypted_content is worse than omitted
        if (typeof out.encrypted_content === "string" && !String(out.encrypted_content).trim()) {
          delete out.encrypted_content;
          modified = true;
        }
        out.type = "reasoning";
        if (typeof out.id === "string" && !out.id.trim()) {
          delete out.id;
          modified = true;
        }
        if (out.status != null && typeof out.status !== "string") {
          delete out.status;
          modified = true;
        }
        // If still no ciphertext and no useful payload, drop.
        const stillNoEnc = !(typeof out.encrypted_content === "string" && out.encrypted_content.trim());
        const hasSummary = Array.isArray(out.summary) && out.summary.length > 0;
        if (stillNoEnc && !hasSummary) {
          droppedItems += 1;
          fixedReasoning += 1;
          modified = true;
          continue;
        }
        // summary-only reasoning is also commonly rejected; drop to keep ModelInput valid.
        if (stillNoEnc) {
          droppedItems += 1;
          fixedReasoning += 1;
          modified = true;
          continue;
        }
      }
      if (type.includes("compaction")) {
        if ("content" in out && out.content == null) {
          delete out.content;
          modified = true;
        }
        if (!hasEnc) {
          // bare compaction without blob cannot be decoded
          droppedItems += 1;
          modified = true;
          continue;
        }
      }
      nextItems.push(out);
      continue;
    }

    // Generic null content cleanup on message-like items
    if (type === "message" || item.role) {
      const out: Record<string, unknown> = { ...item };
      if ("content" in out && out.content == null) {
        delete out.content;
        modified = true;
      }
      nextItems.push(out);
      continue;
    }

    nextItems.push(item);
  }

  if (!modified) {
    return { body, modified: false, fixedReasoning: 0, convertedCustomCalls: 0, droppedItems: 0 };
  }
  return {
    body: { ...body, input: nextItems },
    modified: true,
    fixedReasoning,
    convertedCustomCalls,
    droppedItems,
  };
}

export async function applyStoredOpaqueContinuity(body: unknown): Promise<{
  body: unknown;
  rewritten: boolean;
  injectedOpaque: number;
  usedConversationId?: string;
}> {
  if (!isObj(body)) {
    return { body, rewritten: false, injectedOpaque: 0 };
  }

  // Client already has opaque state — pass through unmodified for continuity payload.
  if (requestHasOpaqueItems(body)) {
    return { body, rewritten: false, injectedOpaque: 0 };
  }

  const keys = extractContinuityKeysFromRequest(body);
  if (!keys.length) {
    return { body, rewritten: false, injectedOpaque: 0 };
  }

  const rec = await loadConversation(keys);
  const opaque = Array.isArray(rec?.opaqueItems) ? rec!.opaqueItems : [];
  if (!opaque.length) {
    // nothing stored yet — pass through
    return { body, rewritten: false, injectedOpaque: 0, usedConversationId: rec?.id };
  }

  const input = body.input;
  const clientItems = Array.isArray(input) ? input : input != null ? [input] : [];
  // Keep only non-opaque client items (usually the new user turn). Opaque already none here.
  const kept = clientItems.filter((it) => !isOpaqueInputItem(it));
  const injected = capOpaqueItems(opaque);
  const nextInput = [...injected, ...kept];
  const next: Record<string, unknown> = { ...body, input: nextInput };
  // Prefer opaque items over previous_response_id mixed mode
  // Keep previous_response_id if present? User asked pass blob back.
  // If we inject opaque items, previous_response_id may be redundant; keep it unless it causes issues.
  // For pure blob replay, removing previous_response_id can reduce dual-mode conflicts.
  // User said no degrade and pass blob — keep previous_response_id for now.

  return {
    body: next,
    rewritten: true,
    injectedOpaque: injected.length,
    usedConversationId: rec?.id,
  };
}

/** @deprecated name kept for app.ts import compatibility; now opaque-preserving apply */
export async function rewriteResponsesBodyForContinuity(body: unknown): Promise<{
  body: unknown;
  rewritten: boolean;
  historyCount: number;
  strippedOpaque: number;
}> {
  const r = await applyStoredOpaqueContinuity(body);
  return {
    body: r.body,
    rewritten: r.rewritten,
    historyCount: r.injectedOpaque,
    strippedOpaque: 0,
  };
}

export function extractAssistantTextFromResponsePayload(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return extractAssistantTextFromSse(payload);
  if (!isObj(payload)) return "";
  if (Array.isArray(payload.output)) {
    const parts: string[] = [];
    for (const item of payload.output) {
      if (!isObj(item)) continue;
      const type = String(item.type || "").toLowerCase();
      if (type === "message" || item.role === "assistant") {
        const t = textFromContent(item.content);
        if (t) parts.push(t);
      }
      if (type === "output_text" && typeof item.text === "string") parts.push(item.text);
    }
    if (parts.length) return clipContent(parts.join("\n"));
  }
  if (typeof payload.output_text === "string") return clipContent(payload.output_text);
  return "";
}

export function extractAssistantTextFromSse(text: string): string {
  if (!text) return "";
  const chunks: string[] = [];
  let fallbackMessage = "";
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const obj = JSON.parse(payload);
      if (!isObj(obj)) continue;
      const type = String(obj.type || "");
      if (type === "response.output_text.delta" && typeof obj.delta === "string") {
        chunks.push(obj.delta);
        continue;
      }
      if (type === "response.output_text.done" && typeof obj.text === "string") {
        fallbackMessage = obj.text;
        continue;
      }
      if (type === "response.output_item.done" && isObj(obj.item)) {
        const item = obj.item;
        if (item.type === "message" || item.role === "assistant") {
          const t = textFromContent(item.content);
          if (t) fallbackMessage = t;
        }
      }
      if (type === "response.completed" && isObj(obj.response)) {
        const t = extractAssistantTextFromResponsePayload(obj.response);
        if (t) fallbackMessage = t;
      }
      if (isObj(obj.response) && Array.isArray(obj.response.output)) {
        const t = extractAssistantTextFromResponsePayload(obj.response);
        if (t) fallbackMessage = t;
      }
    } catch {
      /* ignore */
    }
  }
  return clipContent(chunks.join("") || fallbackMessage);
}

export function extractResponseIdFromPayload(payload: unknown): string | undefined {
  if (!payload) return undefined;
  if (typeof payload === "string") {
    const all = payload.match(/\b(resp_[A-Za-z0-9_-]+)\b/g);
    if (all && all.length) return all[all.length - 1];
    const m = payload.match(/\b((?:resp|cmp)_[A-Za-z0-9_-]+)\b/);
    return m?.[1];
  }
  if (isObj(payload) && typeof payload.id === "string") return payload.id;
  if (isObj(payload) && isObj(payload.response) && typeof payload.response.id === "string") {
    return payload.response.id;
  }
  return undefined;
}

/** Extract verbatim opaque/continuity items worth replaying later. */
export function extractOpaqueItemsFromResponsePayload(payload: unknown): unknown[] {
  if (!payload) return [];
  if (typeof payload === "string") {
    // best-effort from SSE completed response
    let last: unknown = null;
    for (const line of payload.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const obj = JSON.parse(data);
        if (isObj(obj) && isObj(obj.response) && Array.isArray(obj.response.output)) {
          last = obj.response;
        } else if (isObj(obj) && Array.isArray(obj.output)) {
          last = obj;
        } else if (isObj(obj) && obj.type === "response.output_item.done" && isObj(obj.item)) {
          // accumulate single items via final response preferred
        }
      } catch {
        /* ignore */
      }
    }
    if (last) return extractOpaqueItemsFromResponsePayload(last);
    return [];
  }
  if (!isObj(payload)) return [];

  const out: unknown[] = [];
  const push = (item: unknown) => {
    if (!item) return;
    // Bounded clone: drop/truncate oversized encrypted_content / compaction blobs.
    const cloned = boundedCloneOpaqueItem(item);
    if (cloned != null) out.push(cloned);
  };

  // Full response object: keep output items that are useful for continuity
  if (Array.isArray(payload.output)) {
    for (const item of payload.output) {
      if (!isObj(item)) continue;
      const type = String(item.type || "").toLowerCase();
      if (
        type.includes("compaction") ||
        item.encrypted_content != null ||
        type.includes("encrypted") ||
        type === "reasoning" ||
        // keep assistant message items too? For pure blob trial, prefer opaque only.
        false
      ) {
        push(item);
      }
    }
  }

  // compact endpoint returns object with output: [{type:compaction, encrypted_content}]
  if (payload.object === "response.compaction" || String(payload.object || "").includes("compaction")) {
    if (Array.isArray(payload.output)) {
      for (const item of payload.output) push(item);
    } else {
      push(payload);
    }
  }

  // If response itself is a single compaction item
  if (isOpaqueInputItem(payload)) push(payload);

  // Dedup by id+type
  const seen = new Set<string>();
  const deduped: unknown[] = [];
  for (const item of out) {
    if (!isObj(item)) {
      deduped.push(item);
      continue;
    }
    const key = `${String(item.type || "")}:${String(item.id || "")}:${String(item.encrypted_content || "").slice(0, 24)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return capOpaqueItems(deduped);
}

export async function rememberConversationTurn(opts: {
  responseId?: string | null;
  previousKeys?: string[];
  userMessages: ConversationMessage[];
  assistantText?: string;
  accountId?: string | null;
  opaqueItems?: unknown[];
  /** set/update session lineage; chat is sticky once set */
  preferredMode?: ConversationPreferredMode | null;
}): Promise<void> {
  const responseId = String(opts.responseId || "").trim();
  const prevKeys = (opts.previousKeys || []).map((k) => String(k || "").trim()).filter(Boolean);
  if (!responseId && !prevKeys.length && !(opts.opaqueItems && opts.opaqueItems.length)) return;

  const store = await loadStore();
  let convId: string | undefined;

  // HARD: Codex thread_id is the only primary conversation id when present.
  const threadKey =
    prevKeys.find((k) => k.startsWith("thread:")) ||
    prevKeys.find((k) => k.startsWith("session:")) ||
    null;

  const orderedKeys = [
    ...(threadKey ? [threadKey] : []),
    ...prevKeys.filter((k) => k.startsWith("thread:") || k.startsWith("session:")),
    ...prevKeys.filter((k) => k.startsWith("resp_") || k.startsWith("cmp_") || k.startsWith("rs_")),
  ];
  const seenK = new Set<string>();
  for (const k of orderedKeys) {
    if (seenK.has(k)) continue;
    seenK.add(k);
    const id = store.aliases[k] || (store.conversations[k] ? k : "");
    if (id && store.conversations[id]) {
      convId = id;
      break;
    }
  }
  if (!convId) {
    convId =
      threadKey ||
      responseId ||
      prevKeys.find((k) => k.startsWith("resp_") || k.startsWith("cmp_")) ||
      `conv_${now().toString(16)}`;
  }
  if (!convId) return;

  const prev = store.conversations[convId];
  const ts = now();
  const messages = [...(prev?.messages || [])];
  for (const m of opts.userMessages || []) {
    if (!m?.content?.trim()) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === m.role && last.content === m.content) continue;
    messages.push({ role: m.role, content: clipContent(m.content), ts: m.ts || ts });
  }
  const assistant = String(opts.assistantText || "").trim();
  if (assistant) {
    const last = messages[messages.length - 1];
    if (!(last && last.role === "assistant" && last.content === assistant)) {
      messages.push({ role: "assistant", content: clipContent(assistant), ts });
    }
  }

  const nextOpaque =
    Array.isArray(opts.opaqueItems) && opts.opaqueItems.length
      ? capOpaqueItems(opts.opaqueItems)
      : capOpaqueItems(prev?.opaqueItems);

  // Lineage: once chat, stay chat; otherwise take provided mode or keep previous/default responses.
  let preferredMode: ConversationPreferredMode | null | undefined = prev?.preferredMode ?? null;
  if (opts.preferredMode === "chat" || preferredMode === "chat") {
    preferredMode = "chat";
  } else if (opts.preferredMode === "responses") {
    preferredMode = "responses";
  } else if (!preferredMode) {
    preferredMode = "responses";
  }

  store.conversations[convId] = {
    id: convId,
    messages: messages.slice(-MAX_MESSAGES),
    opaqueItems: nextOpaque,
    lastResponseId: responseId || prev?.lastResponseId || null,
    preferredMode,
    createdAt: prev?.createdAt || ts,
    updatedAt: ts,
    lastAccountId: opts.accountId ?? prev?.lastAccountId ?? null,
  };

  // Alias ONLY thread + response/compaction ids. Never content fingerprints.
  if (threadKey) {
    store.aliases[threadKey] = convId;
    if (threadKey.startsWith("thread:") || threadKey.startsWith("session:")) {
      store.aliases[threadKey.slice(threadKey.indexOf(":") + 1)] = convId;
    }
  }
  for (const k of prevKeys) {
    if (!k) continue;
    if (k.startsWith("fp_") || k.includes("::fp_")) continue;
    if (
      k.startsWith("thread:") ||
      k.startsWith("session:") ||
      k.startsWith("resp_") ||
      k.startsWith("cmp_") ||
      k.startsWith("rs_") ||
      k.startsWith("conv_")
    ) {
      store.aliases[k] = convId;
    }
  }
  if (responseId) {
    store.aliases[responseId] = convId;
    for (const item of nextOpaque) {
      if (isObj(item) && typeof item.id === "string" && item.id.trim()) {
        const oid = item.id.trim();
        if (oid.startsWith("cmp_") || oid.startsWith("resp_") || oid.startsWith("rs_")) {
          store.aliases[oid] = convId;
        }
      }
    }
  }

  await saveStore(store);
}

