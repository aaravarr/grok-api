import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { atomicWriteJson } from "./fs-atomic.js";

export interface AppSettings {
  /** Outbound HTTP(S) proxy, e.g. http://127.0.0.1:7890. Empty = auto-detect. */
  proxyUrl: string;
  /** Keep request logs for N days (auto cleanup). Min 1. */
  logRetentionDays: number;
  /** Whether to record full request/response logs. */
  logEnabled: boolean;
}

const defaultSettings = (): AppSettings => ({
  proxyUrl: "",
  logRetentionDays: 7,
  logEnabled: true,
});

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
    return {
      proxyUrl: typeof data.proxyUrl === "string" ? data.proxyUrl.trim() : "",
      logRetentionDays: normalizeRetention(data.logRetentionDays, 7),
      logEnabled: data.logEnabled !== false,
    };
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = await loadSettings();
  const next: AppSettings = {
    proxyUrl: patch.proxyUrl !== undefined ? String(patch.proxyUrl).trim() : cur.proxyUrl,
    logRetentionDays:
      patch.logRetentionDays !== undefined
        ? normalizeRetention(patch.logRetentionDays, cur.logRetentionDays)
        : cur.logRetentionDays,
    logEnabled: patch.logEnabled !== undefined ? Boolean(patch.logEnabled) : cur.logEnabled,
  };
  await atomicWriteJson(settingsPath(), next);
  return next;
}
