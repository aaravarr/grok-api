import { config } from "./config.js";
import { kvGetJson, kvSetJson } from "./db/sqlite.js";

export interface AppSettings {
  /** Outbound HTTP(S) proxy, e.g. http://127.0.0.1:7890. Empty = auto-detect. "direct" = force none. */
  proxyUrl: string;
  /**
   * OpenAI-compatible LLM API base (should end with /v1).
   * Empty = env XAI_BASE_URL or https://cli-chat-proxy.grok.com/v1.
   */
  upstreamBaseUrl: string;
  /**
   * OAuth base for server-side token/device calls.
   * Empty = https://auth.x.ai
   * Jump example: https://xai.ahao1.tech  →  {base}/oauth2/token
   */
  oauthBaseUrl: string;
  /**
   * Billing base for SuperGrok credits.
   * Empty = https://cli-chat-proxy.grok.com
   * Jump example: https://xai.ahao1.tech  →  {base}/billing?format=credits
   */
  billingBaseUrl: string;
  /** Keep request logs for N days (auto cleanup). Min 1. */
  logRetentionDays: number;
  /** Whether to write request log rows at all. */
  logEnabled: boolean;
  /**
   * Whether to store full request/response bodies in logs.
   * Default false — only metadata + usage (bodies are large).
   */
  logBodies: boolean;
  /**
   * When true (default), always store response body for failed requests
   * (HTTP non-2xx or body-level error), even if logBodies is off.
   */
  logBodiesOnError: boolean;
  /** Allow public self-registration after admin setup. */
  allowRegister: boolean;
  /** Auto-inject xAI server tools on /v1/responses when client omitted them. Default true. */
  defaultServerToolsEnabled: boolean;
  /** Subset of injectable types. Default ["web_search","x_search"]. */
  defaultServerTools: string[];
}

const DEFAULT_UPSTREAM = "https://cli-chat-proxy.grok.com/v1";
const DEFAULT_OAUTH = "https://auth.x.ai";
const DEFAULT_BILLING = "https://cli-chat-proxy.grok.com";

const defaultSettings = (): AppSettings => ({
  proxyUrl: "",
  upstreamBaseUrl: "",
  oauthBaseUrl: "",
  billingBaseUrl: "",
  logRetentionDays: 7,
  logEnabled: true,
  logBodies: false,
  logBodiesOnError: true,
  allowRegister: true,
  defaultServerToolsEnabled: true,
  defaultServerTools: ["web_search", "x_search"],
});

const ALLOWED_DEFAULT_SERVER_TOOLS = new Set(["web_search", "x_search"]);

/** Keep only injectable server tool types; dedupe; preserve order. Empty input => default pair. */
export function normalizeDefaultServerTools(v: unknown): string[] {
  if (!Array.isArray(v)) return ["web_search", "x_search"];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of v) {
    const t = String(item ?? "").toLowerCase().trim();
    if (!ALLOWED_DEFAULT_SERVER_TOOLS.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function assertHttpUrl(raw: string, label: string): void {
  if (!/^https?:\/\//i.test(raw)) {
    throw new Error(`${label} 须以 http:// 或 https:// 开头`);
  }
}

/** Normalize LLM API base to .../v1. Empty stays empty. */
export function normalizeUpstreamBaseUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim().replace(/\/+$/, "");
  if (!s) return "";
  assertHttpUrl(s, "上游地址");
  if (!/\/v1$/i.test(s)) s = `${s}/v1`;
  return s;
}

/** Normalize origin-like base (no forced path). Empty stays empty. */
export function normalizeOriginBaseUrl(raw: unknown, label: string): string {
  if (typeof raw !== "string") return "";
  const s = raw.trim().replace(/\/+$/, "");
  if (!s) return "";
  assertHttpUrl(s, label);
  return s;
}

export function resolveUpstreamBaseUrl(settingsUpstream: string | undefined | null): string {
  try {
    const fromSettings = normalizeUpstreamBaseUrl(settingsUpstream ?? "");
    if (fromSettings) return fromSettings;
  } catch {
    // fall through
  }
  const fromEnv = (process.env.XAI_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv) {
    try {
      return normalizeUpstreamBaseUrl(fromEnv);
    } catch {
      return fromEnv;
    }
  }
  return DEFAULT_UPSTREAM;
}

export function resolveOauthBaseUrl(settingsOauth: string | undefined | null): string {
  try {
    const fromSettings = normalizeOriginBaseUrl(settingsOauth ?? "", "OAuth 地址");
    if (fromSettings) return fromSettings;
  } catch {
    // fall through
  }
  const fromEnv = (process.env.XAI_OAUTH_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv) {
    try {
      return normalizeOriginBaseUrl(fromEnv, "OAuth 地址");
    } catch {
      return fromEnv;
    }
  }
  return DEFAULT_OAUTH;
}

export function resolveBillingBaseUrl(settingsBilling: string | undefined | null): string {
  try {
    const fromSettings = normalizeOriginBaseUrl(settingsBilling ?? "", "额度地址");
    if (fromSettings) return fromSettings;
  } catch {
    // fall through
  }
  const fromEnv = (process.env.XAI_BILLING_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv) {
    try {
      return normalizeOriginBaseUrl(fromEnv, "额度地址");
    } catch {
      return fromEnv;
    }
  }
  return DEFAULT_BILLING;
}

export async function getUpstreamBaseUrl(): Promise<string> {
  const s = await loadSettings();
  return resolveUpstreamBaseUrl(s.upstreamBaseUrl);
}

/** OAuth token/device endpoints (server-side). Browser authorize URL stays official. */
export async function getOAuthEndpoints(): Promise<{
  tokenUrl: string;
  deviceAuthorizationUrl: string;
  authorizeUrl: string;
  userinfoUrl: string;
  base: string;
  viaJump: boolean;
}> {
  const s = await loadSettings();
  const base = resolveOauthBaseUrl(s.oauthBaseUrl);
  const viaJump = base.replace(/\/+$/, "").toLowerCase() !== DEFAULT_OAUTH;
  return {
    tokenUrl: `${base}/oauth2/token`,
    deviceAuthorizationUrl: `${base}/oauth2/device/code`,
    userinfoUrl: `${base}/oauth2/userinfo`,
    authorizeUrl: config.oauth.authorizeUrl,
    base,
    viaJump,
  };
}

/** SuperGrok credits API URL. */
export async function getBillingUrl(): Promise<string> {
  const s = await loadSettings();
  const base = resolveBillingBaseUrl(s.billingBaseUrl).replace(/\/+$/, "");
  // Official host uses /v1/billing
  if (base.toLowerCase() === DEFAULT_BILLING) {
    return `${base}/v1/billing?format=credits`;
  }
  // Full path already pasted
  if (/\/billing/i.test(base)) {
    return base.includes("format=")
      ? base
      : `${base}${base.includes("?") ? "&" : "?"}format=credits`;
  }
  // Jump host origin → /billing?format=credits
  return `${base}/billing?format=credits`;
}

const NS = "settings";
const KEY = "app";

let mem: AppSettings | null = null;

function normalizeRetention(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(365, Math.floor(n)));
}

function readOptionalOrigin(
  raw: unknown,
  label: string,
): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  try {
    return normalizeOriginBaseUrl(raw, label);
  } catch {
    return raw.trim().replace(/\/+$/, "");
  }
}

function normalizeSettings(data: Partial<AppSettings> | null | undefined): AppSettings {
  let upstreamBaseUrl = "";
  if (typeof data?.upstreamBaseUrl === "string" && data.upstreamBaseUrl.trim()) {
    try {
      upstreamBaseUrl = normalizeUpstreamBaseUrl(data.upstreamBaseUrl);
    } catch {
      upstreamBaseUrl = data.upstreamBaseUrl.trim().replace(/\/+$/, "");
    }
  }
  return {
    proxyUrl: typeof data?.proxyUrl === "string" ? data.proxyUrl.trim() : "",
    upstreamBaseUrl,
    oauthBaseUrl: readOptionalOrigin(data?.oauthBaseUrl, "OAuth 地址"),
    billingBaseUrl: readOptionalOrigin(data?.billingBaseUrl, "额度地址"),
    logRetentionDays: normalizeRetention(data?.logRetentionDays, 7),
    logEnabled: data?.logEnabled !== false,
    logBodies: data?.logBodies === true,
    // default true when missing (legacy installs)
    logBodiesOnError: data?.logBodiesOnError !== false,
    allowRegister: data?.allowRegister !== false,
    defaultServerToolsEnabled: data?.defaultServerToolsEnabled !== false,
    defaultServerTools: normalizeDefaultServerTools(
      data?.defaultServerTools ?? ["web_search", "x_search"],
    ),
  };
}

function persist(settings: AppSettings): void {
  kvSetJson(NS, KEY, settings);
}

export async function loadSettings(): Promise<AppSettings> {
  if (mem) return mem;
  const fromDb = kvGetJson<Partial<AppSettings>>(NS, KEY);
  mem = fromDb != null ? normalizeSettings(fromDb) : defaultSettings();
  return mem;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = await loadSettings();
  let upstreamBaseUrl = cur.upstreamBaseUrl;
  if (patch.upstreamBaseUrl !== undefined) {
    upstreamBaseUrl = normalizeUpstreamBaseUrl(patch.upstreamBaseUrl);
  }
  let oauthBaseUrl = cur.oauthBaseUrl;
  if (patch.oauthBaseUrl !== undefined) {
    oauthBaseUrl = normalizeOriginBaseUrl(patch.oauthBaseUrl, "OAuth 地址");
  }
  let billingBaseUrl = cur.billingBaseUrl;
  if (patch.billingBaseUrl !== undefined) {
    billingBaseUrl = normalizeOriginBaseUrl(patch.billingBaseUrl, "额度地址");
  }
  const next: AppSettings = {
    proxyUrl: patch.proxyUrl !== undefined ? String(patch.proxyUrl).trim() : cur.proxyUrl,
    upstreamBaseUrl,
    oauthBaseUrl,
    billingBaseUrl,
    logRetentionDays:
      patch.logRetentionDays !== undefined
        ? normalizeRetention(patch.logRetentionDays, cur.logRetentionDays)
        : cur.logRetentionDays,
    logEnabled: patch.logEnabled !== undefined ? Boolean(patch.logEnabled) : cur.logEnabled,
    logBodies: patch.logBodies !== undefined ? Boolean(patch.logBodies) : cur.logBodies,
    logBodiesOnError:
      patch.logBodiesOnError !== undefined
        ? Boolean(patch.logBodiesOnError)
        : cur.logBodiesOnError,
    allowRegister:
      patch.allowRegister !== undefined ? Boolean(patch.allowRegister) : cur.allowRegister,
    defaultServerToolsEnabled:
      patch.defaultServerToolsEnabled !== undefined
        ? Boolean(patch.defaultServerToolsEnabled)
        : cur.defaultServerToolsEnabled,
    defaultServerTools:
      patch.defaultServerTools !== undefined
        ? normalizeDefaultServerTools(patch.defaultServerTools)
        : cur.defaultServerTools,
  };
  mem = next;
  persist(next);
  return next;
}
