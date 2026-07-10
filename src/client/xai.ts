import { onProviderError, onSuccess, routeAccount } from "../account/router.js";
import { advanceToNextActive } from "../account/store.js";
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
  const res = await fetch(`${base}/models`, {
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

export type ProxyMode = "responses" | "chat";

export interface ProxyRequest {
  mode: ProxyMode;
  body: unknown;
  accountId?: string;
  callerUserId?: string | null;
  maxRetries?: number;
}

export interface ProxyResponse {
  status: number;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  accountId: string;
  accountName: string;
}

function endpoint(base: string, mode: ProxyMode): string {
  return mode === "responses" ? `${base}/responses` : `${base}/chat/completions`;
}

export async function proxyLLM(req: ProxyRequest): Promise<ProxyResponse> {
  const maxRetries = req.maxRetries ?? 3;
  const tried = new Set<string>();
  let lastError = "unknown";
  const base = await getUpstreamBaseUrl();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let routed;
    try {
      routed = await routeAccount({
        preferredId: attempt === 0 ? req.accountId : undefined,
        checkCredits: true,
        forceAuto: attempt > 0,
        callerUserId: req.callerUserId,
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      break;
    }

    if (tried.has(routed.account.id)) break;
    tried.add(routed.account.id);

    const res = await fetch(endpoint(base, req.mode), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${routed.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "grok-api/1.0",
      },
      body: JSON.stringify(req.body),
    });

    if (res.ok) {
      await onSuccess(routed.account.id);
      return {
        status: res.status,
        headers: res.headers,
        body: res.body,
        accountId: routed.account.id,
        accountName: routed.account.name,
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
    };
  }

  throw new Error(`代理失败（已尝试 ${tried.size} 个账号）: ${lastError}`);
}
