import { execSync } from "node:child_process";
import { ProxyAgent, setGlobalDispatcher, getGlobalDispatcher } from "undici";

function normalizeProxyUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  // Windows registry often stores "127.0.0.1:7890" or "http=127.0.0.1:7890;https=..."
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

export function resolveProxyUrl(): string {
  return fromEnv() || fromWindowsRegistry();
}

let applied = false;

/** Make global fetch use HTTP(S) proxy (Node undici does not use OS proxy by default). */
export function applyProxy(): string {
  if (applied) return resolveProxyUrl();
  applied = true;

  const proxyUrl = resolveProxyUrl();
  if (!proxyUrl) {
    console.log("[grok-api] proxy    → (none)  如需代理请设 HTTPS_PROXY 或开启系统代理");
    return "";
  }

  // Ensure child libs that read env also see it
  process.env.HTTPS_PROXY ||= proxyUrl;
  process.env.HTTP_PROXY ||= proxyUrl;
  process.env.https_proxy ||= proxyUrl;
  process.env.http_proxy ||= proxyUrl;

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log(`[grok-api] proxy    → ${proxyUrl}`);
  return proxyUrl;
}

export function currentDispatcher() {
  return getGlobalDispatcher();
}
