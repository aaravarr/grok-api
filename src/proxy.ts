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
 * undici single-Agent pools can serialize concurrent long streaming requests
 * to the same origin (observed: CONC 8 first-byte stacks ~1s,2s,4s… while curl
 * parallel stays ~0.5s). Shard into many Agents so concurrent LLM streams do
 * not queue on one pool.
 */
const SHARD_COUNT = 32;
const agentOpts = {
  /** per-shard sockets; total ≈ SHARD_COUNT * connections */
  connections: 8,
  pipelining: 1,
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 60_000,
  /** 0 = disable; SSE/chat streams can exceed undici defaults */
  bodyTimeout: 0,
  headersTimeout: 0,
} as const;

let dispatcherShards: Dispatcher[] = [];
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
  shardCursor = 0;
}

function nextDispatcher(): Dispatcher {
  if (dispatcherShards.length === 0) {
    return getGlobalDispatcher();
  }
  const i = shardCursor % dispatcherShards.length;
  shardCursor = (shardCursor + 1) % dispatcherShards.length;
  return dispatcherShards[i]!;
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
  setGlobalDispatcher(dispatcherShards[0]!);
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

/**
 * All outbound calls to xAI / Grok hosts MUST use this helper so they always
 * go through the installed ProxyAgent (or direct Agent when configured).
 * Prefer this over bare global fetch for external traffic.
 *
 * Uses a round-robin shard dispatcher so concurrent stream requests do not
 * stall behind each other on a single undici pool.
 */
export function outboundFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const next = {
    ...(init as UndiciRequestInit | undefined),
    dispatcher: nextDispatcher(),
    bodyTimeout: agentOpts.bodyTimeout,
    headersTimeout: agentOpts.headersTimeout,
  } as UndiciRequestInit;
  // undici fetch returns undici.Response; compatible enough for our usage
  return undiciFetch(input, next) as unknown as Promise<Response>;
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
