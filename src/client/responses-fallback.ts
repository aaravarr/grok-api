import type { ConversationMessage } from '../account/conversation-store.js';
import {
  buildCodexToolContextFromRequest,
  chatCompletionToResponse,
  responsesToChatCompletions,
  transformChatSseToResponsesSse as transformChatSseToResponsesSseCore,
  transformXaiResponsesSseForCodex,
  remapXaiResponsesJsonForCodex,
  toResponsesUsage,
  type CodexToolContext,
} from './codex-chat-compat.js';

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export { toResponsesUsage, buildCodexToolContextFromRequest };
export type { CodexToolContext };

export function isResponsesContinuityError(status: number, errText: string): boolean {
  if (status !== 400 && status !== 422) return false;
  const t = String(errText || '');
  return (
    t.includes('compaction blob') ||
    t.includes('Could not decode the compaction') ||
    t.includes('ModelInput') ||
    t.includes('untagged enum') ||
    t.includes('encrypted_content') ||
    t.includes('previous_response_id')
  );
}

/**
 * Decide whether a /responses request should be eagerly served via chat/completions.
 *
 * Policy:
 * - If session lineage is chat => always eager fallback
 * - If session lineage is responses => never eager fallback
 * - If unknown lineage:
 *    - clean plaintext-ish request => responses
 *    - foreign/history continuity residue => completions
 */
export function shouldEagerFallbackResponses(
  body: unknown,
  opts?: {
    preferredMode?: 'responses' | 'chat' | null;
    storeHit?: boolean;
  },
): { eager: boolean; reason?: string } {
  if (!isObj(body)) return { eager: false };

  if (opts?.preferredMode === 'chat') {
    return { eager: true, reason: 'session_lineage_chat' };
  }
  if (opts?.preferredMode === 'responses') {
    return { eager: false, reason: 'session_lineage_responses' };
  }

  const hasPrev =
    (typeof body.previous_response_id === 'string' && !!body.previous_response_id.trim()) ||
    (typeof body.response_id === 'string' && !!body.response_id.trim()) ||
    (typeof body.conversation_id === 'string' && !!body.conversation_id.trim());

  const input = body.input;
  const items = Array.isArray(input) ? input : input != null ? [input] : [];
  let hasOpaque = false;
  let opaqueType = '';
  for (const item of items) {
    if (!isObj(item)) continue;
    if (isOpaqueItem(item)) {
      hasOpaque = true;
      opaqueType = String(item.type || 'opaque');
      break;
    }
  }

  if (hasPrev && hasOpaque) {
    return { eager: true, reason: 'foreign_history:' + (opaqueType || 'continuity') };
  }
  if (hasOpaque) {
    return { eager: true, reason: 'foreign_opaque:' + (opaqueType || 'opaque') };
  }
  if (hasPrev && !opts?.storeHit) {
    return { eager: true, reason: 'foreign_previous_response_id' };
  }

  return { eager: false };
}

function isOpaqueItem(item: unknown): boolean {
  if (!isObj(item)) return false;
  const type = String(item.type || '').toLowerCase();
  const enc = item.encrypted_content;
  const hasEnc = typeof enc === 'string' ? enc.trim().length > 0 : enc != null;
  if (type.includes('compaction') && hasEnc) return true;
  if (hasEnc) return true;
  if (type.includes('encrypted') && hasEnc) return true;
  return false;
}

/** Build chat.completions body from a responses request + optional stored plaintext history. */
export function buildChatFallbackFromResponses(
  responsesBody: unknown,
  storedMessages: ConversationMessage[] = [],
): Obj {
  const stored = (storedMessages || []).map((m) => ({ role: m.role, content: m.content }));
  return responsesToChatCompletions(responsesBody, stored).body;
}

/** Full conversion with tool context (preferred for streaming tool fidelity). */
export function buildChatFallbackFromResponsesWithContext(
  responsesBody: unknown,
  storedMessages: ConversationMessage[] = [],
): { body: Obj; toolContext: CodexToolContext } {
  const stored = (storedMessages || []).map((m) => ({ role: m.role, content: m.content }));
  return responsesToChatCompletions(responsesBody, stored);
}

export function chatJsonToResponsesJson(
  chat: unknown,
  modelHint?: string,
  toolContext?: CodexToolContext,
): Obj {
  return chatCompletionToResponse(chat, { modelHint, toolContext });
}

export function transformChatSseToResponsesSse(
  stream: ReadableStream<Uint8Array>,
  modelHint?: string,
  toolContext?: CodexToolContext,
): ReadableStream<Uint8Array> {
  return transformChatSseToResponsesSseCore(stream, { modelHint, toolContext });
}

export function transformNativeResponsesSseForCodex(
  stream: ReadableStream<Uint8Array>,
  toolContext?: CodexToolContext,
): ReadableStream<Uint8Array> {
  return transformXaiResponsesSseForCodex(stream, toolContext);
}

export function remapNativeResponsesJsonForCodex(
  payload: unknown,
  toolContext?: CodexToolContext,
): unknown {
  return remapXaiResponsesJsonForCodex(payload, toolContext);
}

export async function readErrorText(body: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!body) return '';
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    total += value.byteLength;
    if (total > 64_000) break;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(out);
}
