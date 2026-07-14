/** Capture inbound request headers for logging (secrets redacted). */

const SENSITIVE = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
]);

/** Headers worth keeping for debugging clients. */
const KEEP = [
  "user-agent",
  "x-title",
  "x-stainless-lang",
  "x-stainless-package-version",
  "x-stainless-runtime",
  "x-stainless-os",
  "x-stainless-arch",
  "http-referer",
  "referer",
  "origin",
  "content-type",
  "accept",
  "x-request-id",
  "x-account-id",
  "anthropic-version",
  "anthropic-beta",
  "openai-organization",
  "x-forwarded-for",
  "x-real-ip",
];

export function collectRequestHeaders(
  getHeader: (name: string) => string | undefined,
): { headers: Record<string, string>; userAgent: string; client: string } {
  const headers: Record<string, string> = {};
  for (const name of KEEP) {
    const v = getHeader(name);
    if (v) headers[name] = v;
  }
  // Always record auth presence without leaking token
  const auth = getHeader("authorization");
  if (auth) {
    if (auth.toLowerCase().startsWith("bearer ")) {
      headers.authorization = "Bearer ***";
    } else {
      headers.authorization = "***";
    }
  }
  for (const [k, v] of Object.entries(headers)) {
    if (SENSITIVE.has(k.toLowerCase()) && !k.toLowerCase().startsWith("authorization")) {
      headers[k] = "***";
    }
    // cap very long values
    if (v.length > 512) headers[k] = v.slice(0, 512) + "…";
  }
  const userAgent = headers["user-agent"] || getHeader("user-agent") || "";
  const client = detectClient(userAgent, headers);
  return { headers, userAgent, client };
}

/**
 * Map User-Agent / client headers to a short display name.
 */
export function detectClient(userAgent: string, headers: Record<string, string> = {}): string {
  const ua = userAgent || "";
  const lower = ua.toLowerCase();
  const title = (headers["x-title"] || "").toLowerCase();
  const stainless = (headers["x-stainless-lang"] || "").toLowerCase();
  const packageVer = headers["x-stainless-package-version"] || "";

  // Explicit product title (OpenRouter-style / many proxies)
  if (title) {
    if (/media\s*studio/i.test(headers["x-title"] || "")) return "Media Studio";
    if (/claude\s*code/i.test(headers["x-title"] || "")) return "Claude Code";
    if (/cursor/i.test(headers["x-title"] || "")) return "Cursor";
    if (/opencode/i.test(headers["x-title"] || "")) return "OpenCode";
    if (/cline/i.test(headers["x-title"] || "")) return "Cline";
    if (/continue/i.test(headers["x-title"] || "")) return "Continue";
    // keep original title if short
    const raw = headers["x-title"] || "";
    if (raw.length <= 32) return raw;
  }

  // Claude Code / Claude CLI
  if (
    /claude[-_ ]?(code|cli)/i.test(ua) ||
    /anthropic[-_ ]?cli/i.test(ua) ||
    lower.includes("claude-code") ||
    lower.includes("claude_cli")
  ) {
    const m = ua.match(/claude[-_ ]?(?:code|cli)[\/\s-]?([\d.]+)?/i);
    return m?.[1] ? `Claude Code ${m[1]}` : "Claude Code";
  }

  // Cursor
  if (/cursor/i.test(ua)) {
    const m = ua.match(/cursor[\/\s-]?([\d.]+)?/i);
    return m?.[1] ? `Cursor ${m[1]}` : "Cursor";
  }

  // OpenCode / opencode
  if (/opencode/i.test(ua)) {
    const m = ua.match(/opencode[\/\s-]?([\d.]+)?/i);
    return m?.[1] ? `OpenCode ${m[1]}` : "OpenCode";
  }

  // Cline / Roo / Continue / Aider / Windsurf
  if (/cline/i.test(ua)) return "Cline";
  if (/roo[-_]?code/i.test(ua)) return "Roo Code";
  if (/continue/i.test(ua)) return "Continue";
  if (/aider/i.test(ua)) return "Aider";
  if (/windsurf|codeium/i.test(ua)) return "Windsurf";
  if (/copilot/i.test(ua)) return "Copilot";
  if (/zed/i.test(ua)) return "Zed";

  // OpenAI official SDKs
  if (/openai-python/i.test(ua) || (stainless === "python" && /openai/i.test(packageVer + ua))) {
    const m = ua.match(/openai-python\/([\d.]+)/i);
    return m ? `OpenAI Python ${m[1]}` : "OpenAI Python";
  }
  if (/openai-node|openai\/node/i.test(ua) || stainless === "js" || stainless === "javascript") {
    const m = ua.match(/openai[\/-]?(?:node|js)?[\/\s-]?([\d.]+)/i);
    return m?.[1] ? `OpenAI Node ${m[1]}` : "OpenAI Node";
  }
  if (/openai-go/i.test(ua)) return "OpenAI Go";
  if (/openai-java/i.test(ua)) return "OpenAI Java";
  if (/openai-dotnet|\.net/i.test(ua) && /openai/i.test(ua)) return "OpenAI .NET";

  // API clients / IDEs
  if (/apifox/i.test(ua)) return "Apifox";
  if (/postman/i.test(ua)) return "Postman";
  if (/insomnia/i.test(ua)) return "Insomnia";
  if (/httpie/i.test(ua)) return "HTTPie";
  if (/curl\//i.test(ua)) {
    const m = ua.match(/curl\/([\d.]+)/i);
    return m ? `curl ${m[1]}` : "curl";
  }
  if (/python-requests/i.test(ua)) return "Python requests";
  if (/aiohttp/i.test(ua)) return "aiohttp";
  if (/httpx/i.test(ua)) return "httpx";
  if (/axios/i.test(ua)) return "axios";
  if (/node-fetch|undici|got\//i.test(ua)) return "Node HTTP";
  if (/okhttp/i.test(ua)) return "OkHttp";
  if (/java\//i.test(ua)) return "Java";
  if (/go-http-client/i.test(ua)) return "Go HTTP";
  if (/rust|reqwest/i.test(ua)) return "Rust HTTP";

  // Browsers
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return "Chrome";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/safari\//i.test(ua) && !/chrome/i.test(ua)) return "Safari";

  if (!ua) return "(unknown)";
  // Truncate raw UA for display
  return ua.length > 40 ? ua.slice(0, 40) + "…" : ua;
}
