/**
 * Outbound client identity aligned with xAI grok-build (grok-shell).
 * Mirror official CLI headers so OAuth / billing / LLM traffic looks like grok-shell.
 */

const PRODUCT = "grok-shell";
const IDENTIFIER = "grok-shell";
const TOKEN_AUTH = "xai-grok-cli";
const OAUTH_REFERRER = "grok-build";
/** Installed CLI version on this machine; override with GROK_CLIENT_VERSION. */
const DEFAULT_VERSION = "0.2.101";

export type ClientSurface = "ui" | "cli" | "headless";

export function grokClientVersion(): string {
  const v = (process.env.GROK_CLIENT_VERSION ?? DEFAULT_VERSION).trim();
  return v || DEFAULT_VERSION;
}

export function grokClientMode(): "interactive" | "headless" {
  const m = (process.env.GROK_CLIENT_MODE ?? "interactive").trim().toLowerCase();
  return m === "headless" ? "headless" : "interactive";
}

export function grokOAuthReferrer(): string {
  return (process.env.GROK_OAUTH_REFERRER ?? OAUTH_REFERRER).trim() || OAUTH_REFERRER;
}

function platformOs(): string {
  switch (process.platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return process.platform;
  }
}

function platformArch(): string {
  switch (process.arch) {
    case "arm64":
      return "aarch64";
    case "x64":
      return "x86_64";
    default:
      return process.arch;
  }
}

/** e.g. grok-shell/0.2.101 (windows; x86_64) */
export function grokUserAgent(): string {
  return `${PRODUCT}/${grokClientVersion()} (${platformOs()}; ${platformArch()})`;
}

export function isCliChatProxyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "cli-chat-proxy.grok.com" || host.endsWith(".cli-chat-proxy.grok.com");
  } catch {
    return /cli-chat-proxy\.grok\.com/i.test(url);
  }
}

/** Base fingerprint shared by all first-party outbound calls. */
export function grokClientHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "User-Agent": grokUserAgent(),
    "x-grok-client-identifier": IDENTIFIER,
    "x-grok-client-version": grokClientVersion(),
    ...extra,
  };
}

/**
 * OAuth device-code / token / refresh headers.
 * Official CLI also sends x-grok-client-surface + x-grok-client-version.
 */
export function grokOAuthHeaders(opts?: {
  form?: boolean;
  surface?: ClientSurface;
}): Record<string, string> {
  const headers = grokClientHeaders({
    Accept: "application/json",
    "x-grok-client-surface": opts?.surface ?? "cli",
  });
  if (opts?.form !== false) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  return headers;
}

/**
 * Authenticated upstream headers (LLM / models / media / billing).
 * User OAuth tokens require X-XAI-Token-Auth: xai-grok-cli.
 * cli-chat-proxy also wants x-authenticateresponse + x-grok-client-mode.
 */
export function grokUpstreamHeaders(opts: {
  accessToken: string;
  /** Full request URL or base URL — used to detect cli-chat-proxy */
  url?: string;
  accept?: string | null;
  contentType?: string | null;
  /** Include X-XAI-Token-Auth (default true for OAuth user tokens) */
  tokenAuth?: boolean;
}): Record<string, string> {
  const headers = grokClientHeaders({
    Authorization: `Bearer ${opts.accessToken}`,
    Accept: opts.accept || "application/json",
    "x-grok-client-mode": grokClientMode(),
  });

  if (opts.tokenAuth !== false) {
    headers["X-XAI-Token-Auth"] = TOKEN_AUTH;
  }

  if (opts.url && isCliChatProxyUrl(opts.url)) {
    headers["x-authenticateresponse"] = "authenticate-response";
  }

  if (opts.contentType) {
    headers["Content-Type"] = opts.contentType;
  }

  return headers;
}
