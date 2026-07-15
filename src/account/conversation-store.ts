import { kvGetJson, kvSetJson } from "../db/sqlite.js";
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
const MAX_CONVERSATIONS = 2000;
const MAX_MESSAGES = 120;
const MAX_CONTENT_CHARS = 20_000;
const MAX_OPAQUE_ITEMS = 20;
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

function deepClone<T>(v: T): T {
  return v == null ? v : (JSON.parse(JSON.stringify(v)) as T);
}

function clipContent(s: string): string {
  if (s.length <= MAX_CONTENT_CHARS) return s;
  return s.slice(0, MAX_CONTENT_CHARS) + "\n…[truncated]";
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
        messages: (c.messages || []).slice(-MAX_MESSAGES),
        opaqueItems: Array.isArray(c.opaqueItems) ? c.opaqueItems.slice(-MAX_OPAQUE_ITEMS) : [],
      },
    ]),
  );
  const valid = new Set(Object.keys(conversations));
  const aliases: Record<string, string> = {};
  for (const [k, v] of Object.entries(store.aliases || {})) {
    if (valid.has(v)) aliases[k] = v;
  }
  return { conversations, aliases };
}

function persist(store: ConversationStore): void {
  kvSetJson(NS, KEY, store);
}

async function loadStore(): Promise<ConversationStore> {
  if (cache) return cache;
  const fromDb = kvGetJson<ConversationStore>(NS, KEY);
  cache =
    fromDb != null
      ? prune({
          conversations: fromDb.conversations || {},
          aliases: fromDb.aliases || {},
        })
      : emptyStore();
  return cache;
}

async function saveStore(store: ConversationStore): Promise<void> {
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

export function extractContinuityKeysFromRequest(body: unknown): string[] {
  if (!isObj(body)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v !== "string") return;
    const k = v.trim();
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(k);
  };
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
    const type = String(node.type || "").toLowerCase();
    if (type.includes("compaction") || typeof node.encrypted_content === "string") add(node.id);
    if (typeof node.id === "string" && (node.id.startsWith("cmp_") || node.id.startsWith("resp_") || node.id.startsWith("rs_"))) {
      add(node.id);
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") walk(v, depth + 1);
    }
  };
  walk(body.input);
  const plain = extractPlainMessagesFromInput(body.input);
  for (const fp of fingerprintPlainMessageVariants(plain)) add(fp);
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
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(k);
  };
  add(body.conversation_id);
  add(body.previous_response_id);
  add(body.response_id);
  // Some clients put thread ids in metadata
  if (isObj(body.metadata)) {
    add(body.metadata.conversation_id);
    add(body.metadata.thread_id);
    add(body.metadata.session_id);
  }
  const msgs = extractPlainMessagesFromChatBody(body);
  for (const fp of fingerprintPlainMessageVariants(msgs)) out.push(fp);
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
}> {
  const rec = await loadConversation(keys);
  if (!rec) return { hit: false, messageCount: 0 };
  return {
    hit: true,
    conversationId: rec.id,
    preferredMode: rec.preferredMode ?? null,
    messageCount: Array.isArray(rec.messages) ? rec.messages.length : 0,
  };
}

async function loadConversation(keys: string[]): Promise<ConversationRecord | null> {
  if (!keys.length) return null;
  const store = await loadStore();
  for (const key of keys) {
    const id = store.aliases[key] || key;
    const rec = store.conversations[id];
    if (rec) return rec;
  }
  return null;
}

async function findStoredOpaqueByEncryptedContent(enc: string): Promise<Record<string, unknown> | null> {
  if (!enc) return null;
  const store = await loadStore();
  // prefer newest conversations
  const recs = Object.values(store.conversations || {}).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  for (const rec of recs) {
    for (const it of rec.opaqueItems || []) {
      if (!isObj(it)) continue;
      if (it.encrypted_content === enc) return it;
    }
  }
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
          nextItems.push(deepClone(restored));
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
  const injected = deepClone(opaque);
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
    // store deep clone to freeze snapshot
    out.push(deepClone(item));
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
  return deduped.slice(-MAX_OPAQUE_ITEMS);
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
  for (const k of prevKeys) {
    const id = store.aliases[k] || (store.conversations[k] ? k : "");
    if (id && store.conversations[id]) {
      convId = id;
      break;
    }
  }
  if (!convId) convId = responseId || prevKeys[0] || `conv_${now().toString(16)}`;
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
      ? deepClone(opts.opaqueItems).slice(-MAX_OPAQUE_ITEMS)
      : prev?.opaqueItems || [];

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

  for (const k of prevKeys) store.aliases[k] = convId;
  if (responseId) {
    store.aliases[responseId] = convId;
    // also index cmp ids inside opaque items
    for (const item of nextOpaque) {
      if (isObj(item) && typeof item.id === "string" && item.id.trim()) {
        store.aliases[item.id.trim()] = convId;
      }
    }
  }

  // Keep plaintext fingerprint aliases so chat lineage can be found after switching to /responses.
  for (const fp of fingerprintPlainMessageVariants(messages)) store.aliases[fp] = convId;
  for (const fp of fingerprintPlainMessageVariants(opts.userMessages || [])) store.aliases[fp] = convId;

  await saveStore(store);
}
