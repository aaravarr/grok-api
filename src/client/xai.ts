import { onProviderError, onSuccess, routeAccount } from "../account/router.js";
import { advanceToNextActive } from "../account/store.js";
import { outboundFetch } from "../proxy.js";
import { getUpstreamBaseUrl } from "../settings.js";

export async function fetchUpstreamModels(
  preferredId?: string,
  callerUserId?: string | null,
): Promise<{
  status: number;
  body: unknown;
  accountId: string;
  accountName: string;
}> {
  const routed = await routeAccount({
    preferredId,
    checkCredits: false,
    callerUserId,
  });
  const base = await getUpstreamBaseUrl();
  const res = await outboundFetch(`${base}/models`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${routed.accessToken}`,
      Accept: "application/json",
      "User-Agent": "grok-api/1.0",
    },
  });
  const body = await res.json().catch(async () => ({ error: await res.text() }));
  return {
    status: res.status,
    body,
    accountId: routed.account.id,
    accountName: routed.account.name,
  };
}

export type ProxyMode = "responses" | "chat" | "media";

export interface ProxyRequest {
  mode: ProxyMode;
  body: unknown;
  accountId?: string;
  callerUserId?: string | null;
  maxRetries?: number;
  /** Optional override path under upstream base, e.g. /responses/compact */
  path?: string;
}

export interface ProxyResponse {
  status: number;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  accountId: string;
  accountName: string;
  /** Date.now() when the outbound LLM/upstream fetch was issued for this response */
  upstreamStartedAt?: number;
}

function endpoint(base: string, mode: ProxyMode): string {
  return mode === "responses" ? `${base}/responses` : `${base}/chat/completions`;
}

export async function proxyLLM(req: ProxyRequest): Promise<ProxyResponse> {
  const path =
    req.path ||
    (req.mode === "responses" ? "/responses" : "/chat/completions");
  return proxyUpstream({
    method: "POST",
    path,
    body: req.body,
    accountId: req.accountId,
    callerUserId: req.callerUserId,
    maxRetries: req.maxRetries,
    checkCredits: true,
  });
}

export type UpstreamProxyRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Path under upstream base, e.g. /images/generations */
  path: string;
  body?: unknown;
  accountId?: string;
  callerUserId?: string | null;
  maxRetries?: number;
  checkCredits?: boolean;
  /** If true, do not JSON.stringify body (raw string/ArrayBuffer) */
  rawBody?: any;
  contentType?: string | null;
  // Override Accept header (default application/json). Use "*/*" for binary TTS.
  accept?: string | null;
};

/**
 * Generic upstream proxy with account-pool routing + retry on exhausted/retryable.
 */
export async function proxyUpstream(req: UpstreamProxyRequest): Promise<ProxyResponse> {
  const maxRetries = req.maxRetries ?? 3;
  const tried = new Set<string>();
  let lastError = "unknown";
  const base = await getUpstreamBaseUrl();
  const method = req.method ?? "POST";
  const checkCredits = req.checkCredits !== false;
  const path = req.path.startsWith("/") ? req.path : `/${req.path}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let routed;
    try {
      routed = await routeAccount({
        preferredId: attempt === 0 ? req.accountId : undefined,
        checkCredits,
        forceAuto: attempt > 0,
        callerUserId: req.callerUserId,
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      break;
    }

    if (tried.has(routed.account.id)) break;
    tried.add(routed.account.id);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${routed.accessToken}`,
      Accept: req.accept || "application/json",
      "User-Agent": "grok-api/1.0",
    };
    let body: any;
    if (req.rawBody != null) {
      body = req.rawBody;
      if (req.contentType) headers["Content-Type"] = req.contentType;
    } else if (req.body !== undefined && method !== "GET" && method !== "DELETE") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(req.body);
    }

    const upstreamStartedAt = Date.now();
    const res = await outboundFetch(`${base}${path}`, {
      method,
      headers,
      body,
    });

    if (res.ok || res.status === 202) {
      // do not block first-byte on markUsed persist
      void onSuccess(routed.account.id);
      return {
        status: res.status,
        headers: res.headers,
        body: res.body,
        accountId: routed.account.id,
        accountName: routed.account.name,
        upstreamStartedAt,
      };
    }

    const text = await res.text();
    lastError = `account ${routed.account.name}: HTTP ${res.status} ${text.slice(0, 200)}`;
    const kind = await onProviderError(routed.account.id, res.status, text);

    if (kind === "exhausted" || kind === "retryable") {
      await advanceToNextActive(routed.account.id);
      continue;
    }

    return {
      status: res.status,
      headers: new Headers({ "Content-Type": "application/json" }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      }),
      accountId: routed.account.id,
      accountName: routed.account.name,
      upstreamStartedAt,
    };
  }

  throw new Error(`代理失败（已尝试 ${tried.size} 个账号）: ${lastError}`);
}

