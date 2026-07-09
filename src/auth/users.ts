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
  patch: Partial<Pick<User, "enabled" | "role" | "passwordHash" | "tokenQuota" | "tokenUsed">>,
): Promise<User | undefined> {
  return mutate((store) => {
    const u = store.users.find((x) => x.id === id);
    if (!u) return undefined;
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
