import { execSync } from "node:child_process";
import {
  Agent,
  ProxyAgent,
  fetch as undiciFetch,
  setGlobalDispatcher,
  getGlobalDispatcher,
  type Dispatcher,
  type RequestInit as UndiciRequestInit,
} from "undici";
import { loadSettings } from "./settings.js";

function normalizeProxyUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s) || /^socks/i.test(s)) return s;
  if (s.includes("=")) {
    const parts = s.split(";").map((p) => p.trim());
    for (const key of ["https", "http", "all"]) {
      const hit = parts.find((p) => p.toLowerCase().startsWith(`${key}=`));
      if (hit) {
        const v = hit.slice(hit.indexOf("=") + 1).trim();
        return /^https?:\/\//i.test(v) ? v : `http://${v}`;
      }
    }
  }
  return `http://${s}`;
}

function fromEnv(): string {
  const raw =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy ||
    process.env.PROXY ||
    "";
  return raw ? normalizeProxyUrl(raw) : "";
}

function fromWindowsRegistry(): string {
  if (process.platform !== "win32") return "";
  try {
    const out = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable',
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    if (!/ProxyEnable\s+REG_DWORD\s+0x1\b/i.test(out)) return "";

    const serverOut = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer',
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const m = serverOut.match(/ProxyServer\s+REG_SZ\s+(.+)/i);
    if (!m?.[1]) return "";
    return normalizeProxyUrl(m[1].trim());
  } catch {
    return "";
  }
}

export type ProxySource = "settings" | "direct" | "env" | "system" | "none";

let appliedProxyUrl = "";
let appliedSource: ProxySource = "none";
let configuredOverride = "";

function isDirect(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "direct" || s === "none" || s === "off" || s === "false";
}

export function resolveProxyUrl(override?: string): { url: string; source: ProxySource } {
  const manual = (override ?? configuredOverride).trim();
  // Explicit direct: skip env/system auto-detect
  if (manual && isDirect(manual)) return { url: "", source: "direct" };
  if (manual) return { url: normalizeProxyUrl(manual), source: "settings" };
  const env = fromEnv();
  if (env) return { url: env, source: "env" };
  const sys = fromWindowsRegistry();
  if (sys) return { url: sys, source: "system" };
  return { url: "", source: "none" };
}

/**
 * undici single-Agent / multi-connection Pools can serialize concurrent long
 * streaming requests to the same origin (observed: CONC 8 first-byte stacks
 * ~1s,2s,4s… while curl parallel stays ~0.5s).
 *
 * Fix model:
 * - Many independent dispatchers (shards)
 * - Each shard uses connections=1 so a long SSE never shares a Pool queue
 * - least-inflight pick so idle shards are preferred over busy streams
 *
 * Env: GROK_OUTBOUND_SHARDS (default 256, clamp 8..1024)
 *
 * Replacing undici (got/axios/node-fetch) does not help on Node 18+: global
 * fetch is undici. Native http.Agent is the only real alternative transport.
 */
function envInt(name: string, fallback: number, min: number, max: number): number {
  const n = Number(process.env[name]);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

const SHARD_COUNT = envInt("GROK_OUTBOUND_SHARDS", 256, 8, 1024);
const agentOpts = {
  /** one Client per shard — no multi-socket Pool scheduling across streams */
  connections: 1,
  pipelining: 1,
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 60_000,
  /** 0 = disable; SSE/chat streams can exceed undici defaults */
  bodyTimeout: 0,
  headersTimeout: 0,
} as const;

let dispatcherShards: Dispatcher[] = [];
/** in-flight streams per shard (request start → body fully consumed/cancelled) */
let shardInflight: number[] = [];
let shardCursor = 0;

function closeShards(): void {
  for (const d of dispatcherShards) {
    try {
      void (d as Agent).close?.();
    } catch {
      /* ignore */
    }
  }
  dispatcherShards = [];
  shardInflight = [];
  shardCursor = 0;
}

function nextDispatcher(): { dispatcher: Dispatcher; release: () => void } {
  if (dispatcherShards.length === 0) {
    return { dispatcher: getGlobalDispatcher(), release: () => undefined };
  }
  const n = dispatcherShards.length;
  let best = 0;
  let bestLoad = Number.POSITIVE_INFINITY;
  // Scan from rotating cursor so ties spread instead of always picking shard 0.
  for (let k = 0; k < n; k++) {
    const i = (shardCursor + k) % n;
    const load = shardInflight[i] ?? 0;
    if (load < bestLoad) {
      bestLoad = load;
      best = i;
      if (load === 0) break;
    }
  }
  shardCursor = (best + 1) % n;
  shardInflight[best] = (shardInflight[best] ?? 0) + 1;
  let released = false;
  return {
    dispatcher: dispatcherShards[best]!,
    release: () => {
      if (released) return;
      released = true;
      shardInflight[best] = Math.max(0, (shardInflight[best] ?? 1) - 1);
    },
  };
}

/** Keep least-inflight accurate for long SSE: release only when body ends/cancels. */
function attachReleaseToResponse(res: Response, release: () => void): Response {
  const body = res.body;
  if (!body) {
    release();
    return res;
  }
  const reader = body.getReader();
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    release();
  };
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          settle();
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (err) {
        settle();
        controller.error(err);
      }
    },
    cancel(reason) {
      settle();
      return reader.cancel(reason);
    },
  });
  return new Response(stream, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

function installDispatcher(proxyUrl: string): void {
  closeShards();
  if (proxyUrl) {
    process.env.HTTPS_PROXY = proxyUrl;
    process.env.HTTP_PROXY = proxyUrl;
    process.env.https_proxy = proxyUrl;
    process.env.http_proxy = proxyUrl;
    dispatcherShards = Array.from({ length: SHARD_COUNT }, () =>
      new ProxyAgent({
        uri: proxyUrl,
        connections: agentOpts.connections,
        pipelining: agentOpts.pipelining,
        keepAliveTimeout: agentOpts.keepAliveTimeout,
        keepAliveMaxTimeout: agentOpts.keepAliveMaxTimeout,
        bodyTimeout: agentOpts.bodyTimeout,
        headersTimeout: agentOpts.headersTimeout,
      }),
    );
  } else {
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;
    delete process.env.https_proxy;
    delete process.env.http_proxy;
    dispatcherShards = Array.from({ length: SHARD_COUNT }, () => new Agent({ ...agentOpts }));
  }
  shardInflight = Array.from({ length: dispatcherShards.length }, () => 0);
  setGlobalDispatcher(dispatcherShards[0]!);
  console.log(
    `[grok-api] outbound → ${dispatcherShards.length} shards × connections=${agentOpts.connections} (least-inflight)`,
  );
}

/** Initial load: settings file → env → OS system proxy. */
export async function applyProxy(): Promise<string> {
  const settings = await loadSettings();
  configuredOverride = settings.proxyUrl || "";
  const { url, source } = resolveProxyUrl();
  appliedProxyUrl = url;
  appliedSource = source;
  installDispatcher(url);
  if (url) {
    console.log(`[grok-api] proxy    → ${url} (${source})`);
  } else {
    console.log(
      "[grok-api] proxy    → (none) — OAuth/billing to auth.x.ai & cli-chat-proxy.grok.com may fail without a proxy",
    );
  }
  return url;
}

/**
 * Runtime update (from admin UI).
 * - empty string → clear override, re-auto-detect env/system
 * - "direct" → force no proxy (ignore env/system)
 * - otherwise → use that URL
 */
export async function setProxyOverride(proxyUrl: string): Promise<{
  proxy: string | null;
  source: ProxySource;
  configured: string;
}> {
  configuredOverride = proxyUrl.trim();
  const { url, source } = resolveProxyUrl(configuredOverride);
  appliedProxyUrl = url;
  appliedSource = source;
  installDispatcher(url);
  console.log(`[grok-api] proxy    → ${url || "(none)"} (${source})`);
  return {
    proxy: url || null,
    source,
    configured: configuredOverride,
  };
}

export function getAppliedProxy(): string {
  return appliedProxyUrl;
}

export function getProxyInfo(): {
  proxy: string | null;
  source: ProxySource;
  configured: string;
} {
  return {
    proxy: appliedProxyUrl || null,
    source: appliedSource,
    configured: configuredOverride,
  };
}

export function currentDispatcher(): Dispatcher {
  return getGlobalDispatcher();
}

/** Snapshot for diagnostics / health. */
export function getOutboundPoolStats(): {
  shards: number;
  connectionsPerShard: number;
  inflight: number;
  busiestShard: number;
} {
  const inflight = shardInflight.reduce((a, b) => a + b, 0);
  const busiestShard = shardInflight.reduce((m, v) => Math.max(m, v), 0);
  return {
    shards: dispatcherShards.length,
    connectionsPerShard: agentOpts.connections,
    inflight,
    busiestShard,
  };
}

/**
 * All outbound calls to xAI / Grok hosts MUST use this helper so they always
 * go through the installed ProxyAgent (or direct Agent when configured).
 * Prefer this over bare global fetch for external traffic.
 *
 * Uses least-inflight shard dispatchers so concurrent stream requests do not
 * stall behind each other on a single undici pool.
 */
export function outboundFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const { dispatcher, release } = nextDispatcher();
  const next = {
    ...(init as UndiciRequestInit | undefined),
    dispatcher,
    bodyTimeout: agentOpts.bodyTimeout,
    headersTimeout: agentOpts.headersTimeout,
  } as UndiciRequestInit;
  return (undiciFetch(input, next) as unknown as Promise<Response>).then(
    (res) => attachReleaseToResponse(res, release),
    (err) => {
      release();
      throw err;
    },
  );
}

/** Hosts that typically need the outbound proxy in restricted networks. */
export function isXaiHost(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return (
      h === "api.x.ai" ||
      h.endsWith(".x.ai") ||
      h === "auth.x.ai" ||
      h === "accounts.x.ai" ||
      h === "cli-chat-proxy.grok.com" ||
      h.endsWith(".grok.com") ||
      h === "management-api.x.ai"
    );
  } catch {
    return false;
  }
}
