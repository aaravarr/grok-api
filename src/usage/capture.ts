import type { TokenUsage } from "./types.js";

const MAX_CAPTURE_BYTES = 1_048_576; // 1 MiB

export function extractUsage(obj: unknown): TokenUsage | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const root = obj as Record<string, unknown>;
  const u = root.usage;
  if (!u || typeof u !== "object") return undefined;
  const usage = u as Record<string, unknown>;
  const prompt = num(usage.prompt_tokens ?? usage.input_tokens);
  const completion = num(usage.completion_tokens ?? usage.output_tokens);
  let total = num(usage.total_tokens);
  if (total == null && prompt != null && completion != null) total = prompt + completion;

  const ptd = asObj(usage.prompt_tokens_details ?? usage.input_tokens_details);
  const ctd = asObj(usage.completion_tokens_details ?? usage.output_tokens_details);

  const cachedTokens =
    num(ptd?.cached_tokens) ??
    num(usage.cached_tokens) ??
    num(usage.cache_read_input_tokens);
  const textTokens = num(ptd?.text_tokens) ?? num(usage.text_tokens);
  const imageTokens = num(ptd?.image_tokens) ?? num(usage.image_tokens);
  const audioTokens = num(ptd?.audio_tokens);

  const reasoningTokens =
    num(ctd?.reasoning_tokens) ??
    num(usage.reasoning_tokens);
  const completionAudioTokens = num(ctd?.audio_tokens);
  const acceptedPredictionTokens = num(ctd?.accepted_prediction_tokens);
  const rejectedPredictionTokens = num(ctd?.rejected_prediction_tokens);

  const numSourcesUsed = num(usage.num_sources_used);
  const costInUsdTicks = num(usage.cost_in_usd_ticks);

  if (
    prompt == null &&
    completion == null &&
    total == null &&
    cachedTokens == null &&
    reasoningTokens == null
  ) {
    return undefined;
  }

  return {
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens: total,
    cachedTokens,
    textTokens,
    imageTokens,
    audioTokens,
    reasoningTokens,
    completionAudioTokens,
    acceptedPredictionTokens,
    rejectedPredictionTokens,
    numSourcesUsed,
    costInUsdTicks,
  };
}

function asObj(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function parseBodyMeta(body: unknown): {
  model?: string;
  stream: boolean;
  reasoningEffort?: string | null;
} {
  if (!body || typeof body !== "object") return { stream: false };
  const b = body as Record<string, unknown>;
  const model = typeof b.model === "string" ? b.model : undefined;
  const stream = b.stream === true;
  let reasoningEffort: string | null | undefined;
  if (typeof b.reasoning_effort === "string") reasoningEffort = b.reasoning_effort;
  else if (b.reasoning && typeof b.reasoning === "object") {
    const effort = (b.reasoning as Record<string, unknown>).effort;
    if (typeof effort === "string") reasoningEffort = effort;
  }
  return { model, stream, reasoningEffort: reasoningEffort ?? null };
}

/**
 * Ensure streaming chat requests ask upstream for a final usage chunk.
 * xAI / OpenAI only emit usage in SSE when stream_options.include_usage=true.
 * Without this, clients like Apifox (stream:true only) log 0 tokens.
 */
export function ensureStreamUsage(mode: "chat" | "responses", body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const b = { ...(body as Record<string, unknown>) };
  if (mode === "chat" && b.stream === true) {
    const prev =
      b.stream_options && typeof b.stream_options === "object"
        ? { ...(b.stream_options as Record<string, unknown>) }
        : {};
    b.stream_options = { ...prev, include_usage: true };
  }
  return b;
}

export function safeCloneBody(body: unknown, maxBytes = MAX_CAPTURE_BYTES): {
  value: unknown;
  truncated: boolean;
} {
  try {
    const raw = JSON.stringify(body);
    if (raw == null) return { value: body, truncated: false };
    if (Buffer.byteLength(raw, "utf8") <= maxBytes) {
      return { value: JSON.parse(raw), truncated: false };
    }
    return {
      value: {
        _truncated: true,
        _originalBytes: Buffer.byteLength(raw, "utf8"),
        preview: raw.slice(0, Math.min(raw.length, 8000)),
      },
      truncated: true,
    };
  } catch {
    return { value: String(body), truncated: false };
  }
}

export interface CaptureResult {
  response?: unknown;
  responseTruncated?: boolean;
  usage?: TokenUsage;
  error?: string;
}

/**
 * Detect business-level errors in upstream JSON / SSE even when HTTP is 2xx.
 * OpenAI-style: { error: { message } } | { error: "..." }
 * Also: empty choices with finish_reason content_filter, etc.
 */
export function extractBodyError(payload: unknown): string | undefined {
  if (payload == null) return undefined;
  if (typeof payload === "string") {
    const t = payload.trim();
    if (!t) return undefined;
    // SSE: scan data lines for error objects
    if (t.includes("data:") || t.includes("\n")) {
      let last: string | undefined;
      for (const line of t.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const err = extractBodyError(JSON.parse(data));
          if (err) last = err;
        } catch {
          // ignore
        }
      }
      if (last) return last;
    }
    if (t.trimStart().startsWith("{")) {
      try {
        return extractBodyError(JSON.parse(t));
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  if (typeof payload !== "object") return undefined;
  const o = payload as Record<string, unknown>;

  // { error: "msg" } | { error: { message, type, code } }
  if (o.error != null) {
    if (typeof o.error === "string" && o.error.trim()) return o.error.trim().slice(0, 500);
    if (typeof o.error === "object") {
      const e = o.error as Record<string, unknown>;
      const msg =
        (typeof e.message === "string" && e.message) ||
        (typeof e.msg === "string" && e.msg) ||
        (typeof e.code === "string" && e.code) ||
        (typeof e.type === "string" && e.type);
      if (msg) {
        const parts = [msg];
        if (typeof e.type === "string" && e.type !== msg) parts.push(e.type);
        if (typeof e.code === "string" && e.code !== msg) parts.push(String(e.code));
        return parts.join(" · ").slice(0, 500);
      }
      try {
        return JSON.stringify(e).slice(0, 500);
      } catch {
        return "upstream error object";
      }
    }
  }

  // { message, type: "error" } loose shapes
  if (
    typeof o.message === "string" &&
    o.message.trim() &&
    (o.type === "error" || o.status === "error" || o.ok === false)
  ) {
    return o.message.trim().slice(0, 500);
  }

  // content_filter is a real failure; empty choices alone is not
  if (Array.isArray(o.choices)) {
    for (const ch of o.choices) {
      if (!ch || typeof ch !== "object") continue;
      const c = ch as Record<string, unknown>;
      if (c.finish_reason === "content_filter") return "content_filter";
      if (c.native_finish_reason === "content_filter") return "content_filter";
    }
  }

  return undefined;
}

/** HTTP 2xx + body business error → not ok */
export function isLogOk(status: number, bodyError?: string | null): boolean {
  if (!(status >= 200 && status < 300)) return false;
  return !bodyError;
}

/** Buffer non-stream response fully; return same bytes for client. */
export async function captureJsonResponse(
  stream: ReadableStream<Uint8Array>,
): Promise<{ bytes: Uint8Array; result: CaptureResult }> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
  }
  const bytes = concat(chunks, total);
  const text = new TextDecoder().decode(bytes);
  try {
    const json = JSON.parse(text) as unknown;
    const usage = extractUsage(json);
    if (bytes.byteLength <= MAX_CAPTURE_BYTES) {
      return { bytes, result: { response: json, responseTruncated: false, usage } };
    }
    return {
      bytes,
      result: {
        response: {
          _truncated: true,
          _originalBytes: bytes.byteLength,
          preview: text.slice(0, 8000),
          usage: usage ?? null,
        },
        responseTruncated: true,
        usage,
      },
    };
  } catch {
    const truncated = bytes.byteLength > MAX_CAPTURE_BYTES;
    return {
      bytes,
      result: {
        response: truncated ? text.slice(0, 8000) : text,
        responseTruncated: truncated,
      },
    };
  }
}

/**
 * Tee stream: client gets original; side branch captures SSE/text for logging.
 * Does not block the client path.
 */
export function teeAndCapture(
  stream: ReadableStream<Uint8Array>,
  onComplete: (result: CaptureResult) => void,
): ReadableStream<Uint8Array> {
  const [client, side] = stream.tee();
  void (async () => {
    const reader = side.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let truncated = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        if (total < MAX_CAPTURE_BYTES) {
          const room = MAX_CAPTURE_BYTES - total;
          if (value.byteLength <= room) {
            chunks.push(value);
            total += value.byteLength;
          } else {
            chunks.push(value.slice(0, room));
            total += room;
            truncated = true;
          }
        } else {
          truncated = true;
        }
      }
      const text = new TextDecoder().decode(concat(chunks, total));
      const usage = extractUsageFromSse(text) ?? tryExtractUsageFromJson(text);
      let response: unknown = text;
      try {
        // Prefer structured if pure JSON
        if (text.trimStart().startsWith("{")) response = JSON.parse(text);
      } catch {
        // keep text (SSE)
      }
      onComplete({ response, responseTruncated: truncated, usage });
    } catch (e) {
      onComplete({ error: e instanceof Error ? e.message : String(e), responseTruncated: truncated });
    }
  })();
  return client;
}

function tryExtractUsageFromJson(text: string): TokenUsage | undefined {
  try {
    return extractUsage(JSON.parse(text));
  } catch {
    return undefined;
  }
}

function extractUsageFromSse(text: string): TokenUsage | undefined {
  let usage: TokenUsage | undefined;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const u = extractUsage(JSON.parse(payload));
      if (u) usage = u;
    } catch {
      // ignore
    }
  }
  return usage;
}

function concat(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
