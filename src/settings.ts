import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { atomicWriteJson } from "./fs-atomic.js";

export interface AppSettings {
  /** Outbound HTTP(S) proxy, e.g. http://127.0.0.1:7890. Empty = auto-detect. */
  proxyUrl: string;
  /**
   * OpenAI-compatible upstream API base (should end with /v1).
   * Empty = use env XAI_BASE_URL or https://api.x.ai/v1.
   * Example: https://xai-vercel-proxy.vercel.app/v1
   */
  upstreamBaseUrl: string;
  /** Keep request logs for N days (auto cleanup). Min 1. */
  logRetentionDays: number;
  /** Whether to write request log rows at all. */
  logEnabled: boolean;
  /**
   * Whether to store full request/response bodies in logs.
   * Default false — only metadata + usage (bodies are large).
   */
  logBodies: boolean;
  /** Allow public self-registration after admin setup. */
  allowRegister: boolean;
}

const DEFAULT_UPSTREAM = "https://api.x.ai/v1";

const defaultSettings = (): AppSettings => ({
  proxyUrl: "",
  upstreamBaseUrl: "",
  logRetentionDays: 7,
  logEnabled: true,
  logBodies: false,
  allowRegister: true,
});

/** Normalize user input to a /v1 API base. Empty string stays empty (means "use default"). */
export function normalizeUpstreamBaseUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim().replace(/\/+$/, "");
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) {
    throw new Error("上游地址须以 http:// 或 https:// 开头");
  }
  // Allow pasting host only; OpenAI-style paths expect .../v1
  if (!/\/v1$/i.test(s)) {
    s = `${s}/v1`;
  }
  return s;
}

/** Effective base used for models + chat/completions (+ responses). */
export function resolveUpstreamBaseUrl(settingsUpstream: string | undefined | null): string {
  try {
    const fromSettings = normalizeUpstreamBaseUrl(settingsUpstream ?? "");
    if (fromSettings) return fromSettings;
  } catch {
    // fall through to env/default
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

export async function getUpstreamBaseUrl(): Promise<string> {
  const s = await loadSettings();
  return resolveUpstreamBaseUrl(s.upstreamBaseUrl);
}

function settingsPath(): string {
  return path.join(config.dataDir, "settings.json");
}

function normalizeRetention(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(365, Math.floor(n)));
}

export async function loadSettings(): Promise<AppSettings> {
  await mkdir(config.dataDir, { recursive: true });
  try {
    const raw = await readFile(settingsPath(), "utf8");
    const data = JSON.parse(raw) as Partial<AppSettings>;
    let upstreamBaseUrl = "";
    if (typeof data.upstreamBaseUrl === "string" && data.upstreamBaseUrl.trim()) {
      try {
        upstreamBaseUrl = normalizeUpstreamBaseUrl(data.upstreamBaseUrl);
      } catch {
        upstreamBaseUrl = data.upstreamBaseUrl.trim().replace(/\/+$/, "");
      }
    }
    return {
      proxyUrl: typeof data.proxyUrl === "string" ? data.proxyUrl.trim() : "",
      upstreamBaseUrl,
      logRetentionDays: normalizeRetention(data.logRetentionDays, 7),
      logEnabled: data.logEnabled !== false,
      // Default false (omit bodies). Only true when explicitly set.
      logBodies: data.logBodies === true,
      allowRegister: data.allowRegister !== false,
    };
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = await loadSettings();
  let upstreamBaseUrl = cur.upstreamBaseUrl;
  if (patch.upstreamBaseUrl !== undefined) {
    upstreamBaseUrl = normalizeUpstreamBaseUrl(patch.upstreamBaseUrl);
  }
  const next: AppSettings = {
    proxyUrl: patch.proxyUrl !== undefined ? String(patch.proxyUrl).trim() : cur.proxyUrl,
    upstreamBaseUrl,
    logRetentionDays:
      patch.logRetentionDays !== undefined
        ? normalizeRetention(patch.logRetentionDays, cur.logRetentionDays)
        : cur.logRetentionDays,
    logEnabled: patch.logEnabled !== undefined ? Boolean(patch.logEnabled) : cur.logEnabled,
    logBodies: patch.logBodies !== undefined ? Boolean(patch.logBodies) : cur.logBodies,
    allowRegister:
      patch.allowRegister !== undefined ? Boolean(patch.allowRegister) : cur.allowRegister,
  };
  await atomicWriteJson(settingsPath(), next);
  return next;
}
