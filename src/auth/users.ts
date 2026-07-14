import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { atomicWriteJson } from "../fs-atomic.js";
import { randomId, now } from "../utils.js";
import {
  generateSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./password.js";

export type UserRole = "admin" | "user";

/** Per-user outbound routing preference for /v1 proxy */
export type RouteScope = "auto" | "public" | "mine" | "account";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  enabled: boolean;
  /** Total token budget; null = unlimited */
  tokenQuota: number | null;
  /** Accumulated totalTokens consumed */
  tokenUsed: number;
  /**
   * auto = any seat this user may use (public + allowlisted + own donations)
   * public = shared pool only (+ seats where user is allowlisted)
   * mine = only accounts donated by this user (or allowlisted for them)
   * account = pin to routeAccountId
   */
  routeScope: RouteScope;
  /** Used when routeScope === "account" */
  routeAccountId: string | null;
  /**
   * Explicit MCP tool enable-list for this user (by tool name).
   * null/undefined = use defaults (core tools on, heavy optional tools off).
   * Array = exact enabled set after normalization.
   */
  mcpEnabledTools?: string[] | null;
  /** @deprecated migrated into mcpEnabledTools */
  mcpOptionalTools?: string[] | null;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
}

interface UsersStore {
  version: 1;
  users: User[];
  sessions: Session[];
}

const SESSION_TTL_MS = 30 * 86400_000; // 30 days

function usersPath(): string {
  return path.join(config.dataDir, "users.json");
}

let writeChain: Promise<unknown> = Promise.resolve();

function emptyStore(): UsersStore {
  return { version: 1, users: [], sessions: [] };
}

function normalizeRouteScope(v: unknown): RouteScope {
  if (v === "auto" || v === "mine" || v === "account" || v === "public") return v;
  return "auto";
}

/** Full MCP tool catalog. Keep in sync with src/mcp/tools.ts */
export const MCP_TOOL_CATALOG = [
  { name: "grok_list_image_models", defaultEnabled: true },
  { name: "grok_list_video_models", defaultEnabled: true },
  { name: "grok_image_generate", defaultEnabled: true },
  { name: "grok_image_edit", defaultEnabled: true },
  { name: "grok_video_generate", defaultEnabled: true },
  { name: "grok_video_edit", defaultEnabled: true },
  { name: "grok_video_extend", defaultEnabled: true },
  { name: "grok_video_status", defaultEnabled: true },
  { name: "grok_list_voices", defaultEnabled: true },
  { name: "grok_list_custom_voices", defaultEnabled: true },
  { name: "grok_get_custom_voice", defaultEnabled: false },
  { name: "grok_create_custom_voice", defaultEnabled: false },
  { name: "grok_update_custom_voice", defaultEnabled: false },
  { name: "grok_delete_custom_voice", defaultEnabled: false },
  { name: "grok_get_custom_voice_audio", defaultEnabled: false },
  { name: "grok_tts", defaultEnabled: true },
  { name: "grok_voice_create_client_secret", defaultEnabled: true },
] as const;

export const MCP_TOOL_NAMES = MCP_TOOL_CATALOG.map((x) => x.name);
export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

/** @deprecated use MCP_TOOL_CATALOG / tools with defaultEnabled=false */
export const MCP_OPTIONAL_TOOL_NAMES = MCP_TOOL_CATALOG
  .filter((x) => !x.defaultEnabled)
  .map((x) => x.name);

export type McpOptionalToolName = (typeof MCP_OPTIONAL_TOOL_NAMES)[number];

const MCP_TOOL_NAME_SET = new Set<string>(MCP_TOOL_NAMES as unknown as string[]);

export function defaultMcpEnabledTools(): string[] {
  return MCP_TOOL_CATALOG.filter((x) => x.defaultEnabled).map((x) => x.name);
}

export function normalizeMcpToolNames(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const name = String(item || "").trim();
    if (!name || !MCP_TOOL_NAME_SET.has(name) || out.includes(name)) continue;
    out.push(name);
  }
  return out;
}

/** Normalize an explicit enable-list. null/non-array => defaults; empty array stays empty. */
export function normalizeMcpEnabledTools(v: unknown): string[] {
  if (v == null) return defaultMcpEnabledTools();
  if (!Array.isArray(v)) return defaultMcpEnabledTools();
  return normalizeMcpToolNames(v);
}

/** @deprecated prefer normalizeMcpEnabledTools */
export function normalizeMcpOptionalTools(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const allow = new Set<string>(MCP_OPTIONAL_TOOL_NAMES as unknown as string[]);
  return normalizeMcpToolNames(v).filter((name) => allow.has(name));
}

export function resolveUserMcpEnabledTools(raw: {
  mcpEnabledTools?: unknown;
  mcpOptionalTools?: unknown;
}): string[] {
  if (raw.mcpEnabledTools != null) {
    return normalizeMcpEnabledTools(raw.mcpEnabledTools);
  }
  // Migrate old optional-only field: defaults + previously enabled optional tools
  const optional = normalizeMcpOptionalTools(raw.mcpOptionalTools);
  if (!optional.length) return defaultMcpEnabledTools();
  const base = new Set(defaultMcpEnabledTools());
  for (const name of optional) base.add(name);
  return MCP_TOOL_NAMES.filter((name) => base.has(name));
}

function normalizeUser(raw: Partial<User> & Pick<User, "id" | "username" | "passwordHash" | "role">): User {
  const quota =
    typeof raw.tokenQuota === "number" && Number.isFinite(raw.tokenQuota) && raw.tokenQuota >= 0
      ? Math.floor(raw.tokenQuota)
      : null;
  const used =
    typeof raw.tokenUsed === "number" && Number.isFinite(raw.tokenUsed) && raw.tokenUsed > 0
      ? Math.floor(raw.tokenUsed)
      : 0;
  return {
    id: raw.id,
    username: raw.username,
    passwordHash: raw.passwordHash,
    role: raw.role === "admin" ? "admin" : "user",
    enabled: raw.enabled !== false,
    tokenQuota: quota,
    tokenUsed: used,
    routeScope: normalizeRouteScope(raw.routeScope),
    routeAccountId:
      typeof raw.routeAccountId === "string" && raw.routeAccountId.trim()
        ? raw.routeAccountId.trim()
        : null,
    mcpEnabledTools: resolveUserMcpEnabledTools(raw),
    mcpOptionalTools: normalizeMcpOptionalTools(raw.mcpOptionalTools),
    createdAt: raw.createdAt ?? 0,
    updatedAt: raw.updatedAt ?? 0,
    lastLoginAt: raw.lastLoginAt,
  };
}

async function loadStore(): Promise<UsersStore> {
  await mkdir(config.dataDir, { recursive: true });
  try {
    const raw = await readFile(usersPath(), "utf8");
    const data = JSON.parse(raw) as Partial<UsersStore>;
    return {
      version: 1,
      users: Array.isArray(data.users) ? data.users.map((u) => normalizeUser(u as User)) : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
    };
  } catch {
    return emptyStore();
  }
}

async function saveStore(store: UsersStore): Promise<void> {
  await atomicWriteJson(usersPath(), store);
}

async function mutate<T>(fn: (store: UsersStore) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const store = await loadStore();
    // prune expired sessions
    const t = now();
    store.sessions = store.sessions.filter((s) => s.expiresAt > t);
    const result = await fn(store);
    await saveStore(store);
    return result;
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function publicUser(u: User) {
  const tokenQuota = u.tokenQuota ?? null;
  const tokenUsed = u.tokenUsed ?? 0;
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    enabled: u.enabled,
    tokenQuota,
    tokenUsed,
    tokenRemaining: tokenQuota == null ? null : Math.max(0, tokenQuota - tokenUsed),
    routeScope: u.routeScope ?? "auto",
    routeAccountId: u.routeAccountId ?? null,
    mcpEnabledTools: resolveUserMcpEnabledTools(u),
    mcpOptionalTools: normalizeMcpOptionalTools(
      resolveUserMcpEnabledTools(u).filter((name) =>
        (MCP_OPTIONAL_TOOL_NAMES as unknown as string[]).includes(name),
      ),
    ),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
  };
}

/** true when a finite quota is set and already exhausted */
export function isUserQuotaExceeded(u: User): boolean {
  if (u.tokenQuota == null) return false;
  return (u.tokenUsed ?? 0) >= u.tokenQuota;
}

export async function needsSetup(): Promise<boolean> {
  const store = await loadStore();
  return store.users.length === 0;
}

export async function countUsers(): Promise<number> {
  return (await loadStore()).users.length;
}

export async function listUsers(): Promise<User[]> {
  return (await loadStore()).users;
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await loadStore()).users.find((u) => u.id === id);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const name = username.trim().toLowerCase();
  return (await loadStore()).users.find((u) => u.username.toLowerCase() === name);
}

function validateUsername(username: string): string {
  const u = username.trim();
  if (u.length < 2 || u.length > 32) throw new Error("用户名长度需 2–32");
  if (!/^[a-zA-Z0-9_\u4e00-\u9fff.-]+$/.test(u)) throw new Error("用户名含非法字符");
  return u;
}

function validatePassword(password: string): void {
  if (password.length < 6) throw new Error("密码至少 6 位");
  if (password.length > 128) throw new Error("密码过长");
}

/** First-time admin bootstrap. Only when no users exist. */
export async function setupAdmin(input: {
  username: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const username = validateUsername(input.username);
  validatePassword(input.password);

  return mutate(async (store) => {
    if (store.users.length > 0) throw new Error("已完成初始化，请登录");
    const t = now();
    const user: User = {
      id: randomId(8),
      username,
      passwordHash: await hashPassword(input.password),
      role: "admin",
      enabled: true,
      tokenQuota: null,
      tokenUsed: 0,
      routeScope: "auto",
      routeAccountId: null,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: t,
    };
    store.users.push(user);
    const token = generateSessionToken();
    store.sessions.push({
      id: randomId(8),
      userId: user.id,
      tokenHash: hashToken(token),
      createdAt: t,
      expiresAt: t + SESSION_TTL_MS,
    });
    return { user, token };
  });
}

export async function registerUser(input: {
  username: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const username = validateUsername(input.username);
  validatePassword(input.password);

  return mutate(async (store) => {
    if (store.users.length === 0) throw new Error("请先完成管理员初始化");
    if (store.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("用户名已存在");
    }
    const t = now();
    const user: User = {
      id: randomId(8),
      username,
      passwordHash: await hashPassword(input.password),
      role: "user",
      enabled: true,
      tokenQuota: null,
      tokenUsed: 0,
      routeScope: "auto",
      routeAccountId: null,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: t,
    };
    store.users.push(user);
    const token = generateSessionToken();
    store.sessions.push({
      id: randomId(8),
      userId: user.id,
      tokenHash: hashToken(token),
      createdAt: t,
      expiresAt: t + SESSION_TTL_MS,
    });
    return { user, token };
  });
}

export async function loginUser(input: {
  username: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const username = input.username.trim();
  const store = await loadStore();
  const user = store.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) throw new Error("用户名或密码错误");
  if (!user.enabled) throw new Error("账号已禁用");
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new Error("用户名或密码错误");

  return mutate(async (s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (!u) throw new Error("用户不存在");
    const t = now();
    u.lastLoginAt = t;
    u.updatedAt = t;
    // limit sessions per user
    s.sessions = s.sessions.filter((sess) => sess.userId !== u.id || sess.expiresAt > t);
    const mine = s.sessions.filter((sess) => sess.userId === u.id);
    if (mine.length >= 10) {
      mine.sort((a, b) => a.createdAt - b.createdAt);
      const drop = new Set(mine.slice(0, mine.length - 9).map((x) => x.id));
      s.sessions = s.sessions.filter((sess) => !drop.has(sess.id));
    }
    const token = generateSessionToken();
    s.sessions.push({
      id: randomId(8),
      userId: u.id,
      tokenHash: hashToken(token),
      createdAt: t,
      expiresAt: t + SESSION_TTL_MS,
    });
    return { user: u, token };
  });
}

export async function logoutSession(token: string): Promise<void> {
  const th = hashToken(token);
  await mutate((store) => {
    store.sessions = store.sessions.filter((s) => s.tokenHash !== th);
  });
}

export async function resolveSession(
  token: string | undefined | null,
): Promise<{ user: User; session: Session } | null> {
  if (!token) return null;
  const th = hashToken(token);
  const store = await loadStore();
  const t = now();
  const session = store.sessions.find((s) => s.tokenHash === th && s.expiresAt > t);
  if (!session) return null;
  const user = store.users.find((u) => u.id === session.userId);
  if (!user || !user.enabled) return null;
  return { user, session };
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<
      User,
      | "username"
      | "enabled"
      | "role"
      | "passwordHash"
      | "tokenQuota"
      | "tokenUsed"
      | "routeScope"
      | "routeAccountId"
      | "mcpEnabledTools"
      | "mcpOptionalTools"
    >
  >,
): Promise<User | undefined> {
  return mutate((store) => {
    const u = store.users.find((x) => x.id === id);
    if (!u) return undefined;
    if (patch.username !== undefined) {
      const name = validateUsername(patch.username);
      const taken = store.users.some(
        (x) => x.id !== id && x.username.toLowerCase() === name.toLowerCase(),
      );
      if (taken) throw new Error("用户名已存在");
      u.username = name;
    }
    if (patch.enabled !== undefined) u.enabled = patch.enabled;
    if (patch.role !== undefined) u.role = patch.role;
    if (patch.passwordHash !== undefined) u.passwordHash = patch.passwordHash;
    if (patch.tokenQuota !== undefined) {
      u.tokenQuota =
        patch.tokenQuota == null
          ? null
          : Math.max(0, Math.floor(Number(patch.tokenQuota)) || 0);
    }
    if (patch.tokenUsed !== undefined) {
      u.tokenUsed = Math.max(0, Math.floor(Number(patch.tokenUsed)) || 0);
    }
    if (patch.routeScope !== undefined) u.routeScope = normalizeRouteScope(patch.routeScope);
    if (patch.routeAccountId !== undefined) {
      u.routeAccountId =
        patch.routeAccountId == null || patch.routeAccountId === ""
          ? null
          : String(patch.routeAccountId);
    }
    if (patch.mcpEnabledTools !== undefined) {
      u.mcpEnabledTools = normalizeMcpEnabledTools(patch.mcpEnabledTools);
      u.mcpOptionalTools = normalizeMcpOptionalTools(
        u.mcpEnabledTools.filter((name) =>
          (MCP_OPTIONAL_TOOL_NAMES as unknown as string[]).includes(name),
        ),
      );
    } else if (patch.mcpOptionalTools !== undefined) {
      // legacy write path
      const optional = normalizeMcpOptionalTools(patch.mcpOptionalTools);
      const base = new Set(defaultMcpEnabledTools());
      for (const name of optional) base.add(name);
      u.mcpEnabledTools = MCP_TOOL_NAMES.filter((name) => base.has(name));
      u.mcpOptionalTools = optional;
    }
    u.updatedAt = now();
    return u;
  });
}

export async function incrementUserTokenUsed(id: string, tokens: number): Promise<void> {
  const n = Math.floor(Number(tokens));
  if (!id || !Number.isFinite(n) || n <= 0) return;
  await mutate((store) => {
    const u = store.users.find((x) => x.id === id);
    if (!u) return;
    u.tokenUsed = (u.tokenUsed ?? 0) + n;
    u.updatedAt = now();
  });
}

export async function setUserPassword(id: string, password: string): Promise<User | undefined> {
  validatePassword(password);
  const passwordHash = await hashPassword(password);
  return updateUser(id, { passwordHash });
}

export async function setUserUsername(id: string, username: string): Promise<User | undefined> {
  return updateUser(id, { username });
}

export async function deleteUser(id: string): Promise<boolean> {
  return mutate((store) => {
    const u = store.users.find((x) => x.id === id);
    if (!u) return false;
    if (u.role === "admin") {
      const admins = store.users.filter((x) => x.role === "admin" && x.id !== id);
      if (admins.length === 0) throw new Error("不能删除最后一个管理员");
    }
    store.users = store.users.filter((x) => x.id !== id);
    store.sessions = store.sessions.filter((s) => s.userId !== id);
    return true;
  });
}


export async function getUserMcpEnabledTools(userId?: string | null): Promise<string[]> {
  if (!userId) return defaultMcpEnabledTools();
  const u = await getUser(userId);
  if (!u) return defaultMcpEnabledTools();
  return resolveUserMcpEnabledTools(u);
}

/** @deprecated use getUserMcpEnabledTools */
export async function getUserMcpOptionalTools(userId?: string | null): Promise<string[]> {
  const enabled = await getUserMcpEnabledTools(userId);
  const allow = new Set<string>(MCP_OPTIONAL_TOOL_NAMES as unknown as string[]);
  return enabled.filter((name) => allow.has(name));
}
