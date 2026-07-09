import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

export interface AppSettings {
  /** Outbound HTTP(S) proxy, e.g. http://127.0.0.1:7890. Empty = auto-detect. */
  proxyUrl: string;
}

const defaultSettings = (): AppSettings => ({
  proxyUrl: "",
});

function settingsPath(): string {
  return path.join(config.dataDir, "settings.json");
}

export async function loadSettings(): Promise<AppSettings> {
  await mkdir(config.dataDir, { recursive: true });
  try {
    const raw = await readFile(settingsPath(), "utf8");
    const data = JSON.parse(raw) as Partial<AppSettings>;
    return {
      proxyUrl: typeof data.proxyUrl === "string" ? data.proxyUrl.trim() : "",
    };
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const cur = await loadSettings();
  const next: AppSettings = {
    proxyUrl: patch.proxyUrl !== undefined ? String(patch.proxyUrl).trim() : cur.proxyUrl,
  };
  await mkdir(config.dataDir, { recursive: true });
  const tmp = `${settingsPath()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await rename(tmp, settingsPath());
  return next;
}
