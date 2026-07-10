import open from "open";
import { config } from "../config.js";
import { outboundFetch } from "../proxy.js";
import { getOAuthEndpoints } from "../settings.js";
import type { Account, AccountOAuthMeta, TokenResponse } from "../types.js";
import { now, randomId, sleep } from "../utils.js";
import {
  activatePendingAccount,
  addPendingAccount,
  getAccount,
  updateAccount,
} from "./store.js";

const DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
const DEFAULT_INTERVAL_MS = 5_000;
const MIN_INTERVAL_MS = 1_000;
const SLOW_DOWN_MS = 5_000;
const SAFETY_MS = 3_000;
const DEFAULT_EXPIRES_MS = 5 * 60 * 1000;

export type OAuthResult =
  | { ok: true; accountId: string; name: string }
  | { ok: false; error: string; pending?: true };

export interface DeviceSession {
  id: string;
  name?: string;
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  intervalMs: number;
  expiresAt: number;
  status: "pending" | "success" | "error";
  accountId?: string;
  error?: string;
  createdAt: number;
  donorUserId?: string | null;
  private?: boolean;
  allowedUserIds?: string[] | null;
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in?: number;
  interval?: number;
  error?: string;
  error_description?: string;
}

const sessions = new Map<string, DeviceSession>();
const pollers = new Map<string, Promise<void>>();

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "grok-api/1.0",
  };
}

function positiveSecondsToMs(value: unknown, defaultMs: number): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : defaultMs;
}

async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const ep = await getOAuthEndpoints();
  const res = await outboundFetch(ep.deviceAuthorizationUrl, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      client_id: config.oauth.clientId,
      scope: config.oauth.scope,
    }).toString(),
  });
  const data = (await res.json().catch(() => ({}))) as DeviceCodeResponse;
  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || `device code request failed (${res.status})`,
    );
  }
  if (!data.device_code || !data.user_code || !data.verification_uri) {
    throw new Error("device code 响应缺少 device_code / user_code / verification_uri");
  }
  return data;
}

export type XaiUserProfile = {
  email?: string | null;
  xaiUsername?: string | null;
};

/** Fetch OIDC userinfo (email / name). Best-effort — never throws for missing fields. */
export async function fetchXaiUserinfo(accessToken: string): Promise<XaiUserProfile> {
  try {
    const ep = await getOAuthEndpoints();
    const res = await outboundFetch(ep.userinfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "grok-api/1.0",
      },
    });
    if (!res.ok) return {};
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const email =
      typeof data.email === "string" && data.email.trim()
        ? data.email.trim()
        : null;
    const xaiUsername =
      (typeof data.preferred_username === "string" && data.preferred_username.trim()) ||
      (typeof data.nickname === "string" && data.nickname.trim()) ||
      (typeof data.name === "string" && data.name.trim()) ||
      null;
    return { email, xaiUsername: xaiUsername || null };
  } catch {
    return {};
  }
}

async function pollOnce(
  deviceCode: string,
): Promise<TokenResponse | { pending: true; slowDown?: boolean }> {
  const ep = await getOAuthEndpoints();
  const res = await outboundFetch(ep.tokenUrl, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      grant_type: DEVICE_CODE_GRANT,
      client_id: config.oauth.clientId,
      device_code: deviceCode,
    }).toString(),
  });

  if (res.ok) {
    return (await res.json()) as TokenResponse;
  }

  const body = (await res.json().catch(() => ({}))) as TokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (body.error === "authorization_pending") {
    return { pending: true };
  }
  if (body.error === "slow_down") {
    return { pending: true, slowDown: true };
  }
  if (body.error === "access_denied" || body.error === "authorization_denied") {
    throw new Error("用户拒绝了授权");
  }
  if (body.error === "expired_token") {
    throw new Error("设备码已过期，请重新添加");
  }
  throw new Error(body.error_description || body.error || `token 交换失败 (${res.status})`);
}

async function patchOAuth(
  accountId: string | undefined,
  patch: Partial<AccountOAuthMeta> & { lastError?: string; status?: "pending" | "error" },
): Promise<void> {
  if (!accountId) return;
  const acc = await getAccount(accountId);
  if (!acc?.oauth) return;
  const oauth: AccountOAuthMeta = {
    ...acc.oauth,
    ...patch,
    lastMessage: patch.lastMessage ?? patch.lastError ?? acc.oauth.lastMessage,
  };
  await updateAccount(accountId, {
    oauth,
    lastError: patch.lastError ?? (patch.lastMessage !== undefined ? patch.lastMessage : acc.lastError),
    status: patch.status ?? acc.status,
  });
}

function startPolling(sessionId: string): void {
  if (pollers.has(sessionId)) return;

  const task = (async () => {
    const session = sessions.get(sessionId);
    if (!session) return;

    let intervalMs = session.intervalMs;

    while (now() < session.expiresAt) {
      const current = sessions.get(sessionId);
      if (!current || current.status !== "pending") return;

      try {
        const result = await pollOnce(current.deviceCode);
        if ("pending" in result && result.pending) {
          if (result.slowDown) intervalMs += SLOW_DOWN_MS;
          const remaining = Math.max(0, current.expiresAt - now());
          await sleep(Math.min(intervalMs + SAFETY_MS, remaining || intervalMs));
          continue;
        }

        const tokens = result as TokenResponse;
        if (!tokens.access_token) {
          throw new Error("token 响应缺少 access_token");
        }

        const accountId = current.accountId;
        if (!accountId) {
          throw new Error("missing pending account");
        }

        const profile = await fetchXaiUserinfo(tokens.access_token);
        const account = await activatePendingAccount(
          accountId,
          {
            access: tokens.access_token,
            refresh: tokens.refresh_token ?? "",
            expires: now() + (tokens.expires_in ?? 3600) * 1000,
          },
          { ...profile, rename: true },
        );
        if (!account) {
          throw new Error("pending account missing");
        }

        current.status = "success";
        current.accountId = account.id;
        return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const s = sessions.get(sessionId);
        if (s) {
          s.status = "error";
          s.error = msg;
        }
        await patchOAuth(current.accountId, {
          phase: "failed",
          lastMessage: msg,
          lastError: msg,
          status: "error",
        });
        return;
      }
    }

    const s = sessions.get(sessionId);
    if (s && s.status === "pending") {
      s.status = "error";
      s.error = "授权超时，请重试";
      await patchOAuth(s.accountId, {
        phase: "failed",
        lastMessage: s.error,
        lastError: s.error,
        status: "error",
      });
    }
  })().finally(() => {
    pollers.delete(sessionId);
  });

  pollers.set(sessionId, task);
}

export async function startDeviceLogin(opts?: {
  name?: string;
  openBrowser?: boolean;
  donorUserId?: string | null;
  private?: boolean;
  allowedUserIds?: string[] | null;
  /** Existing pending seat to rebind (manual retry) */
  accountId?: string;
}): Promise<{
  sessionId: string;
  accountId: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  expiresIn: number;
}> {
  const device = await requestDeviceCode();
  const expiresMs = positiveSecondsToMs(device.expires_in, DEFAULT_EXPIRES_MS);
  const intervalMs = Math.max(
    positiveSecondsToMs(device.interval, DEFAULT_INTERVAL_MS),
    MIN_INTERVAL_MS,
  );
  const expiresAt = now() + expiresMs;

  const session: DeviceSession = {
    id: randomId(8),
    name: opts?.name,
    deviceCode: device.device_code,
    userCode: device.user_code,
    verificationUri: device.verification_uri,
    verificationUriComplete: device.verification_uri_complete,
    intervalMs,
    expiresAt,
    status: "pending",
    createdAt: now(),
    donorUserId: opts?.donorUserId ?? null,
    private: opts?.private === true,
    allowedUserIds: opts?.allowedUserIds ?? null,
  };

  const oauthMeta: AccountOAuthMeta = {
    sessionId: session.id,
    phase: "waiting_user",
    userCode: session.userCode,
    verificationUri: session.verificationUri,
    verificationUriComplete: session.verificationUriComplete,
    expiresAt,
    lastMessage: "等待浏览器授权…",
  };

  let account: Account;
  if (opts?.accountId) {
    const existing = await getAccount(opts.accountId);
    if (!existing) throw new Error("account not found");
    if (existing.status !== "pending" && existing.status !== "error") {
      throw new Error("only pending/error seats can restart OAuth");
    }
    const updated = await updateAccount(opts.accountId, {
      status: "pending",
      oauth: oauthMeta,
      lastError: oauthMeta.lastMessage,
      name: opts.name?.trim() || existing.name,
      private: opts.private !== undefined ? opts.private === true : existing.private,
      allowedUserIds:
        opts.allowedUserIds !== undefined
          ? opts.allowedUserIds
          : existing.allowedUserIds,
    });
    if (!updated) throw new Error("account not found");
    account = updated;
  } else {
    account = await addPendingAccount({
      name: opts?.name,
      donorUserId: opts?.donorUserId ?? null,
      private: opts?.private === true,
      allowedUserIds: opts?.allowedUserIds ?? null,
      oauth: oauthMeta,
    });
  }

  session.accountId = account.id;
  sessions.set(session.id, session);
  startPolling(session.id);

  const openUrl = device.verification_uri_complete ?? device.verification_uri;
  if (opts?.openBrowser !== false) {
    try {
      await open(openUrl);
    } catch {
      // browser open is best-effort
    }
  }

  setTimeout(() => sessions.delete(session.id), 30 * 60 * 1000);

  return {
    sessionId: session.id,
    accountId: account.id,
    userCode: session.userCode,
    verificationUri: session.verificationUri,
    verificationUriComplete: session.verificationUriComplete,
    expiresIn: Math.floor(expiresMs / 1000),
  };
}

export function getDeviceSession(sessionId: string): DeviceSession | undefined {
  return sessions.get(sessionId);
}

export async function pollDeviceLogin(sessionId: string): Promise<OAuthResult> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { ok: false, error: "session 不存在或已过期" };
  }
  if (session.status === "success" && session.accountId) {
    const acc = await getAccount(session.accountId);
    return {
      ok: true,
      accountId: session.accountId,
      name: acc?.name ?? session.name ?? "",
    };
  }
  if (session.status === "error") {
    return { ok: false, error: session.error ?? "授权失败" };
  }
  return { ok: false, error: "等待用户授权中", pending: true };
}

export async function refreshTokens(
  refreshToken: string,
): Promise<{ access: string; refresh: string; expires: number }> {
  const ep = await getOAuthEndpoints();
  const res = await outboundFetch(ep.tokenUrl, {
    method: "POST",
    headers: authHeaders(),
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.oauth.clientId,
    }).toString(),
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `refresh failed (${res.status})`);
  }
  return {
    access: data.access_token,
    refresh: data.refresh_token ?? refreshToken,
    expires: now() + (data.expires_in ?? 3600) * 1000,
  };
}
