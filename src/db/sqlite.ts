import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "../config.js";

let db: DatabaseSync | null = null;

export function dbPath(): string {
  return config.dbFile || path.join(config.dataDir, "grok-api.db");
}

function kvHasRaw(database: DatabaseSync, ns: string, key: string): boolean {
  const row = database
    .prepare("SELECT 1 AS ok FROM kv WHERE ns = ? AND key = ?")
    .get(ns, key) as { ok: number } | undefined;
  return Boolean(row);
}

function kvSetJsonRaw(database: DatabaseSync, ns: string, key: string, value: unknown): void {
  database
    .prepare(
      `INSERT INTO kv(ns, key, value) VALUES(?, ?, ?)
       ON CONFLICT(ns, key) DO UPDATE SET value = excluded.value`,
    )
    .run(ns, key, JSON.stringify(value));
}

/**
 * Only when creating a brand-new sqlite file: import existing JSON once.
 * If grok.db already exists → never touch JSON.
 */
function migrateJsonIfNewDb(database: DatabaseSync): void {
  const sources: Array<{ label: string; file: string; ns: string; key: string }> = [
    { label: "accounts.json", file: config.authFile, ns: "accounts", key: "store" },
    {
      label: "users.json",
      file: path.join(config.dataDir, "users.json"),
      ns: "users",
      key: "store",
    },
    {
      label: "settings.json",
      file: path.join(config.dataDir, "settings.json"),
      ns: "settings",
      key: "app",
    },
    {
      label: "conversations.json",
      file: path.join(config.dataDir, "conversations.json"),
      ns: "conversations",
      key: "store",
    },
    {
      label: "video-jobs.json",
      file: path.join(config.dataDir, "video-jobs.json"),
      ns: "video-jobs",
      key: "store",
    },
    {
      label: "response-sessions.json",
      file: path.join(config.dataDir, "response-sessions.json"),
      ns: "response-sessions",
      key: "store",
    },
  ];

  let n = 0;
  for (const src of sources) {
    if (kvHasRaw(database, src.ns, src.key)) continue;
    if (!existsSync(src.file)) continue;
    try {
      const data = JSON.parse(readFileSync(src.file, "utf8")) as unknown;
      kvSetJsonRaw(database, src.ns, src.key, data);
      console.log(`[grok-api] migrated ${src.label} → sqlite (${src.ns}/${src.key})`);
      n += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[grok-api] skip migrate ${src.label}: ${msg}`);
    }
  }
  if (n === 0) {
    console.log("[grok-api] sqlite new db (no json to migrate)");
  }
}

export function getDb(): DatabaseSync {
  if (db) return db;
  mkdirSync(config.dataDir, { recursive: true });
  const file = dbPath();
  const isNew = !existsSync(file);
  db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = MEMORY;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS kv (
      ns TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (ns, key)
    );
  `);
  if (isNew) {
    migrateJsonIfNewDb(db);
  }
  return db;
}

export function kvGet(ns: string, key: string): string | null {
  const row = getDb()
    .prepare("SELECT value FROM kv WHERE ns = ? AND key = ?")
    .get(ns, key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function kvSet(ns: string, key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO kv(ns, key, value) VALUES(?, ?, ?)
       ON CONFLICT(ns, key) DO UPDATE SET value = excluded.value`,
    )
    .run(ns, key, value);
}

export function kvGetJson<T>(ns: string, key: string): T | null {
  const raw = kvGet(ns, key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function kvSetJson(ns: string, key: string, value: unknown): void {
  kvSet(ns, key, JSON.stringify(value));
}

export function kvHas(ns: string, key: string): boolean {
  return kvHasRaw(getDb(), ns, key);
}
