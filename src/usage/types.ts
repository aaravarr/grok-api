import type { ProxyMode } from "../client/xai.js";

/** Full token breakdown from xAI / OpenAI-compatible usage. */
export interface TokenUsage {
  /** Input / prompt tokens */
  promptTokens?: number;
  /** Output / completion tokens */
  completionTokens?: number;
  totalTokens?: number;
  /** Cached input tokens (prompt_tokens_details.cached_tokens) */
  cachedTokens?: number;
  /** Text portion of prompt */
  textTokens?: number;
  /** Image tokens in prompt */
  imageTokens?: number;
  /** Audio tokens in prompt */
  audioTokens?: number;
  /** Reasoning / thinking tokens in completion */
  reasoningTokens?: number;
  /** Audio tokens in completion */
  completionAudioTokens?: number;
  acceptedPredictionTokens?: number;
  rejectedPredictionTokens?: number;
  numSourcesUsed?: number;
  /** Upstream cost ticks (if present) */
  costInUsdTicks?: number;
}

export interface RequestLog {
  id: string;
  ts: number;
  day: string;
  mode: ProxyMode;
  path: string;
  model?: string;
  stream: boolean;
  apiKeyId?: string | null;
  apiKeyAlias?: string | null;
  /** Owning app user (from API key) */
  userId?: string | null;
  accountId?: string;
  accountName?: string;
  status: number;
  ok: boolean;
  /** End-to-end time from proxy accept to response complete */
  latencyMs: number;
  /**
   * Ms from proxy accept to the outbound LLM HTTP call being issued.
   * Local work only: route / sanitize / serialize / account pick.
   */
  localPrepMs?: number;
  /**
   * Time to first upstream body byte, measured from outbound LLM fetch start
   * (not from proxy accept). Absent on older logs / non-stream without progressive body.
   */
  firstTokenMs?: number;
  error?: string;
  /** Full request body (may be truncated). Omitted when logBodies is off. */
  request?: unknown;
  requestTruncated?: boolean;
  /**
   * Response body or SSE text (may be truncated).
   * Stored when logBodies is on, or when request failed and logBodiesOnError is on.
   */
  response?: unknown;
  responseTruncated?: boolean;
  usage?: TokenUsage;
  reasoningEffort?: string | null;
  /** Selected inbound headers (auth redacted) */
  headers?: Record<string, string>;
  /** Raw User-Agent */
  userAgent?: string;
  /** Friendly client label e.g. Claude Code / Cursor */
  client?: string;
  /** True when request was served via protocol fallback */
  fallback?: boolean;
  fallbackFromPath?: string;
  fallbackToPath?: string;
  fallbackReason?: string;
  fallbackOriginalStatus?: number;
  fallbackOriginalError?: string;
  /** Actual upstream mode after fallback decisions */
  effectiveMode?: ProxyMode | "chat" | "responses";
  effectivePath?: string;
  inputSanitized?: boolean;
  inputFixedReasoning?: number;
  inputConvertedCustomCalls?: number;
  inputDroppedItems?: number;
}
