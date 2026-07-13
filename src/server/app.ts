import { Hono } from "hono";
import type { Context, Next } from "hono";
import { cors } from "hono/cors";
import { config } from "../config.js";
import {
  buildLeaderboard,
  canUserUseAccount,
  sanitizeAllowedUserIds,
  createApiKey,
  deleteAccount,
  deleteApiKey,
  getAccount,
  getApiKey,
  getRouting,
  listAccounts,
  listAccountsByDonor,
  listApiKeys,
  publicAccount,
  publicApiKey,
  setRoutingMode,
  updateAccount,
  updateApiKey,
  verifyApiKey,
  renameAccountsToDefault,
} from "../account/store.js";
import {
  fetchXaiUserinfo,
  getDeviceSession,
  pollDeviceLogin,
  startDeviceLogin,
} from "../account/oauth.js";
import { getValidAccessToken } from "../account/token.js";
import { fetchAccountCredits } from "../account/billing.js";
import { switchAccount } from "../account/router.js";
import { fetchUpstreamModels, proxyLLM, type ProxyMode } from "../client/xai.js";
import { normalizeToolsInBody } from "../client/tool-schema.js";
import { getProxyInfo, setProxyOverride } from "../proxy.js";
import {
  loadSettings,
  resolveBillingBaseUrl,
  resolveOauthBaseUrl,
  resolveUpstreamBaseUrl,
  saveSettings,
} from "../settings.js";
import { authPageHtml } from "../web/auth-page.js";
import { appPageHtml } from "../web/app-page.js";
import { homePageHtml } from "../web/home-page.js";
import {
  appendRequestLog,
  cleanupLogs,
  getRequestLog,
  listRequestLogs,
  logsDiskInfo,
  stripLogBodies,
  withLiveDisplayNames,
} from "../usage/logger.js";
import {
  captureJsonResponse,
  ensureStreamUsage,
  extractBodyError,
  isLogOk,
  parseBodyMeta,
  safeCloneBody,
  teeAndCapture,
} from "../usage/capture.js";
import { collectRequestHeaders } from "../usage/client-meta.js";
import { computeUsageStats } from "../usage/stats.js";
import {
  deleteUser,
  getUser,
  incrementUserTokenUsed,
  isUserQuotaExceeded,
  listUsers,
  loginUser,
  logoutSession,
  needsSetup,
  publicUser,
  registerUser,
  resolveSession,
  setUserPassword,
  setUserUsername,
  setupAdmin,
  updateUser,
  getUserByUsername,
  type RouteScope,
  type User,
} from "../auth/users.js";

type Variables = {
  apiKeyId: string | null;
  apiKeyAlias: string | null;
  apiKeyUserId: string | null;
  user: User | null;
};

function bearer(c: Context): string {
  const auth = c.req.header("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return (c.req.query("token") ?? "").trim();
}

export function createApp() {
  const app = new Hono<{ Variables: Variables }>();
  app.use("*", cors());

  app.use("*", async (c, next) => {
    c.set("apiKeyId", null);
    c.set("apiKeyAlias", null);
    c.set("apiKeyUserId", null);
    c.set("user", null);
    await next();
  });

  app.use("/v1/*", apiKeyMiddleware);

  app.get("/login", (c) => c.html(authPageHtml("login")));
  app.get("/register", (c) => c.html(authPageHtml("register")));
  app.get("/setup", (c) => c.html(authPageHtml("setup")));
  app.get("/", (c) => c.html(homePageHtml()));
  app.get("/overview", (c) => c.html(appPageHtml("overview")));
  for (const p of ["accounts", "keys", "users", "usage", "logs", "settings", "contribute", "leaderboard"] as const) {
    app.get("/" + p, (c) => c.html(appPageHtml(p)));
  }
  app.get("/app", (c) => c.redirect("/overview"));
  app.get("/curl", (c) => c.redirect("/#examples"));
  app.get("/health", async (c) =>
    c.json({
      ok: true,
      ...getProxyInfo(),
      needsSetup: await needsSetup(),
    }),
  );

  // Self-hosted Geist fonts (avoid fonts.googleapis.com in China)
  app.get("/static/fonts/:file", async (c) => {
    const file = c.req.param("file");
    if (!/^[A-Za-z0-9._-]+\.(woff2|woff)$/.test(file)) {
      return c.text("bad request", 400);
    }
    const { readFile } = await import("node:fs/promises");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const here = dirname(fileURLToPath(import.meta.url));
    const path = join(here, "../web/static/fonts", file);
    try {
      const buf = await readFile(path);
      const ct = file.endsWith(".woff2") ? "font/woff2" : "font/woff";
      return new Response(buf, {
        headers: {
          "Content-Type": ct,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return c.text("not found", 404);
    }
  });

  // Brand assets (favicon / logo)
  app.get("/static/:file", async (c) => {
    const file = c.req.param("file");
    if (!/^(logo|logo-light)\.svg$/.test(file)) {
      return c.text("not found", 404);
    }
    const { readFile } = await import("node:fs/promises");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const here = dirname(fileURLToPath(import.meta.url));
    const path = join(here, "../web/static", file);
    try {
      const buf = await readFile(path);
      return new Response(buf, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      return c.text("not found", 404);
    }
  });
  app.get("/favicon.ico", (c) => c.redirect("/static/logo.svg", 302));
  app.get("/favicon.svg", (c) => c.redirect("/static/logo.svg", 302));

  app.get("/api/meta", async (c) => {
    const settings = await loadSettings();
    const proxy = getProxyInfo();
    const setup = await needsSetup();
    return c.json({
      needsSetup: setup,
      allowRegister: !setup && settings.allowRegister,
      proxy: proxy.proxy,
      proxySource: proxy.source,
      proxyConfigured: settings.proxyUrl,
      logRetentionDays: settings.logRetentionDays,
      logEnabled: settings.logEnabled,
      logBodies: settings.logBodies === true,
      logBodiesOnError: settings.logBodiesOnError !== false,
      allowRegisterSetting: settings.allowRegister,
      xaiBaseUrl: resolveUpstreamBaseUrl(settings.upstreamBaseUrl),
      upstreamBaseUrlConfigured: settings.upstreamBaseUrl || "",
      oauthBaseUrl: resolveOauthBaseUrl(settings.oauthBaseUrl),
      oauthBaseUrlConfigured: settings.oauthBaseUrl || "",
      billingBaseUrl: resolveBillingBaseUrl(settings.billingBaseUrl),
      billingBaseUrlConfigured: settings.billingBaseUrl || "",
      legacyAdminToken: Boolean(config.adminToken),
    });
  });

  // ---------- Auth ----------
  app.post("/api/auth/setup", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    try {
      const { user, token } = await setupAdmin({
        username: body.username ?? "",
        password: body.password ?? "",
      });
      return c.json({ user: publicUser(user), token });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.post("/api/auth/register", async (c) => {
    if (await needsSetup()) return c.json({ error: "请先完成管理员初始化" }, 400);
    const settings = await loadSettings();
    if (!settings.allowRegister) return c.json({ error: "未开放注册" }, 403);
    const body = (await c.req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    try {
      const { user, token } = await registerUser({
        username: body.username ?? "",
        password: body.password ?? "",
      });
      return c.json({ user: publicUser(user), token });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.post("/api/auth/login", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    try {
      const { user, token } = await loginUser({
        username: body.username ?? "",
        password: body.password ?? "",
      });
      return c.json({ user: publicUser(user), token });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.post("/api/auth/logout", async (c) => {
    const token = bearer(c);
    if (token) await logoutSession(token);
    return c.json({ ok: true });
  });

  app.get("/api/auth/me", async (c) => {
    const session = await resolveSession(bearer(c));
    if (!session) return c.json({ error: "unauthorized" }, 401);
    return c.json({ user: publicUser(session.user) });
  });

  // ---------- User self-service (/api/me/*) ----------
  app.use("/api/me/*", requireLogin);

  app.get("/api/me/routing", async (c) => {
    const user = c.get("user")!;
    return c.json({
      routeScope: user.routeScope ?? "auto",
      routeAccountId: user.routeAccountId ?? null,
    });
  });

  app.patch("/api/me/routing", async (c) => {
    const user = c.get("user")!;
    const body = (await c.req.json().catch(() => ({}))) as {
      routeScope?: RouteScope;
      routeAccountId?: string | null;
    };
    const scope = body.routeScope;
    if (
      scope !== undefined &&
      scope !== "auto" &&
      scope !== "public" &&
      scope !== "mine" &&
      scope !== "account"
    ) {
      return c.json({ error: "routeScope 须为 auto | public | mine | account" }, 400);
    }
    let routeAccountId =
      body.routeAccountId !== undefined
        ? body.routeAccountId
          ? String(body.routeAccountId)
          : null
        : undefined;
    const nextScope = scope ?? user.routeScope ?? "auto";
    if (nextScope === "account") {
      const pin = routeAccountId !== undefined ? routeAccountId : user.routeAccountId;
      if (!pin) return c.json({ error: "指定账号模式需要 routeAccountId" }, 400);
      const acc = await getAccount(pin);
      if (!acc) return c.json({ error: "账号不存在" }, 404);
      if (!canUserUseAccount(acc, user.id)) {
        return c.json({ error: "无权指定该账号（私有或白名单限制）" }, 403);
      }
      routeAccountId = pin;
    }
    const updated = await updateUser(user.id, {
      routeScope: scope,
      routeAccountId: routeAccountId === undefined ? undefined : routeAccountId,
    });
    if (!updated) return c.json({ error: "not found" }, 404);
    c.set("user", updated);
    return c.json({
      user: publicUser(updated),
      routeScope: updated.routeScope,
      routeAccountId: updated.routeAccountId,
    });
  });

  app.get("/api/me/keys", async (c) => {
    const user = c.get("user")!;
    const keys = await listApiKeys(user.id);
    return c.json({ keys: keys.map(publicApiKey) });
  });

  app.post("/api/me/keys", async (c) => {
    const user = c.get("user")!;
    const body = (await c.req.json()) as {
      alias?: string;
      expiresAt?: number | null;
      expiresInDays?: number | null;
      note?: string;
    };
    let expiresAt: number | null = body.expiresAt ?? null;
    if (body.expiresInDays != null && body.expiresInDays > 0) {
      expiresAt = Date.now() + body.expiresInDays * 86400_000;
    }
    const { record, key } = await createApiKey({
      alias: body.alias ?? "",
      expiresAt,
      note: body.note,
      userId: user.id,
    });
    return c.json({ key, record: publicApiKey(record) });
  });

  app.patch("/api/me/keys/:id", async (c) => {
    const user = c.get("user")!;
    const existing = await getApiKey(c.req.param("id"));
    if (!existing || existing.userId !== user.id) return c.json({ error: "not found" }, 404);
    const body = (await c.req.json()) as {
      alias?: string;
      enabled?: boolean;
      expiresAt?: number | null;
      expiresInDays?: number | null;
      note?: string;
    };
    const patch: {
      alias?: string;
      enabled?: boolean;
      expiresAt?: number | null;
      note?: string;
    } = {};
    if (body.alias !== undefined) patch.alias = body.alias;
    if (body.enabled !== undefined) patch.enabled = body.enabled;
    if (body.note !== undefined) patch.note = body.note;
    if (body.expiresInDays !== undefined) {
      patch.expiresAt =
        body.expiresInDays != null && body.expiresInDays > 0
          ? Date.now() + body.expiresInDays * 86400_000
          : null;
    } else if (body.expiresAt !== undefined) {
      patch.expiresAt = body.expiresAt;
    }
    const updated = await updateApiKey(c.req.param("id"), patch);
    if (!updated) return c.json({ error: "not found" }, 404);
    return c.json({ record: publicApiKey(updated) });
  });

  app.delete("/api/me/keys/:id", async (c) => {
    const user = c.get("user")!;
    const existing = await getApiKey(c.req.param("id"));
    if (!existing || existing.userId !== user.id) return c.json({ error: "not found" }, 404);
    await deleteApiKey(c.req.param("id"));
    return c.json({ ok: true });
  });

  app.get("/api/me/logs", async (c) => {
    const user = c.get("user")!;
    const myKeys = await listApiKeys(user.id);
    const keyIds = myKeys.map((k) => k.id);
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 20);
    const day = c.req.query("day") || undefined;
    const model = c.req.query("model") || undefined;
    const apiKeyId = c.req.query("apiKeyId") || undefined;
    if (apiKeyId && !keyIds.includes(apiKeyId)) return c.json({ error: "forbidden" }, 403);
    const okRaw = c.req.query("ok");
    const ok = okRaw === "true" ? true : okRaw === "false" ? false : undefined;
    const q = (c.req.query("q") || "").trim() || undefined;
    const result = await listRequestLogs({
      page,
      limit,
      day,
      model,
      apiKeyId,
      userId: user.id,
      apiKeyIds: keyIds,
      ok,
      q,
    });
    const named = await withLiveDisplayNames(result.items);
    const items = named.map((item) => ({
      ...item,
      request: undefined,
      response: undefined,
      hasRequest: item.request !== undefined,
      hasResponse: item.response !== undefined,
    }));
    const disk = await logsDiskInfo();
    return c.json({ ...result, items, disk });
  });

  app.get("/api/me/logs/:id", async (c) => {
    const user = c.get("user")!;
    const log = await getRequestLog(c.req.param("id"));
    if (!log) return c.json({ error: "not found" }, 404);
    const myKeys = await listApiKeys(user.id);
    const keyIds = new Set(myKeys.map((k) => k.id));
    if (log.userId !== user.id && !(log.apiKeyId && keyIds.has(log.apiKeyId))) {
      return c.json({ error: "not found" }, 404);
    }
    const [live] = await withLiveDisplayNames([log]);
    return c.json({ log: live || log });
  });

  app.get("/api/me/usage", async (c) => {
    const user = c.get("user")!;
    const days = Number(c.req.query("days") ?? 7);
    const hoursRaw = c.req.query("hours");
    const hours = hoursRaw != null && hoursRaw !== "" ? Number(hoursRaw) : undefined;
    const gran = c.req.query("granularity");
    const granularity =
      gran === "day" || gran === "hour" || gran === "minute" || gran === "5m"
        ? gran
        : undefined;
    const myKeys = await listApiKeys(user.id);
    const stats = await computeUsageStats({
      days,
      hours: Number.isFinite(hours as number) ? hours : undefined,
      granularity,
      userId: user.id,
      apiKeyIds: myKeys.map((k) => k.id),
    });
    return c.json({ stats });
  });

  // ---------- Contribute (user-donated xAI accounts) ----------
  app.get("/api/me/accounts", async (c) => {
    const user = c.get("user")!;
    const accounts = await listAccountsByDonor(user.id);
    const users = await listUsers();
    const enabledById = new Map(
      users.filter((u) => u.enabled !== false).map((u) => [u.id, u] as const),
    );
    return c.json({
      accounts: accounts.map((a) => {
        const pub = publicAccount(a);
        // Donor always has access; list only enabled extra members (+ self as donor)
        const members: Array<{ id: string; username: string; role: string; isDonor: boolean }> =
          [];
        members.push({
          id: user.id,
          username: user.username,
          role: user.role,
          isDonor: true,
        });
        for (const id of a.allowedUserIds || []) {
          if (id === user.id) continue;
          const u = enabledById.get(id);
          if (!u) continue; // only show available (enabled) users
          members.push({
            id: u.id,
            username: u.username,
            role: u.role,
            isDonor: false,
          });
        }
        return {
          ...pub,
          members,
          memberCount: members.length,
        };
      }),
      stats: {
        // list length (includes pending/error placeholders)
        total: accounts.length,
        // completed contributions only (affects "my seats" / rank-related UI)
        contributed: accounts.filter(
          (a) =>
            a.status !== "pending" &&
            a.status !== "error" &&
            Boolean(a.tokens?.refresh),
        ).length,
        active: accounts.filter((a) => a.status === "active").length,
        pending: accounts.filter((a) => a.status === "pending").length,
        exhausted: accounts.filter((a) => a.status === "exhausted").length,
        expired: accounts.filter((a) => a.status === "expired").length,
        error: accounts.filter((a) => a.status === "error").length,
      },
    });
  });

  /**
   * Browser device-code OAuth:
   * - creates pending seat in list
   * - accountId: rebind existing pending/error/expired seat (retry / re-auth)
   */
  app.post("/api/me/accounts/oauth", async (c) => {
    const user = c.get("user")!;
    const body = (await c.req.json().catch(() => ({}))) as {
      name?: string;
      openBrowser?: boolean;
      accountId?: string;
    };
    if (body.accountId) {
      const existing = await getAccount(body.accountId);
      if (!existing || existing.donorUserId !== user.id) {
        return c.json({ error: "not found" }, 404);
      }
    }
    try {
      const session = await startDeviceLogin({
        name: body.name?.trim() || undefined,
        openBrowser: false,
        donorUserId: user.id,
        accountId: body.accountId,
      });
      const acc = await getAccount(session.accountId);
      return c.json({
        sessionId: session.sessionId,
        accountId: session.accountId,
        userCode: session.userCode,
        verificationUri: session.verificationUri,
        verificationUriComplete: session.verificationUriComplete,
        expiresIn: session.expiresIn,
        account: acc ? publicAccount(acc) : null,
        instructions: `打开 ${session.verificationUri}，输入代码 ${session.userCode}`,
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  /** Open browser URL for a pending seat (manual fallback). Does not restart device code. */
  app.post("/api/me/accounts/:id/oauth/open", async (c) => {
    const user = c.get("user")!;
    const acc = await getAccount(c.req.param("id"));
    if (!acc || acc.donorUserId !== user.id) return c.json({ error: "not found" }, 404);
    if (!acc.oauth?.verificationUri) {
      return c.json({ error: "无进行中的 OAuth，请重新发起" }, 400);
    }
    const url = acc.oauth.verificationUriComplete || acc.oauth.verificationUri;
    return c.json({
      ok: true,
      url,
      userCode: acc.oauth.userCode,
      sessionId: acc.oauth.sessionId,
      expiresAt: acc.oauth.expiresAt,
    });
  });

  app.get("/api/me/accounts/oauth/poll", async (c) => {
    const user = c.get("user")!;
    const sessionId = c.req.query("sessionId");
    if (!sessionId) return c.json({ error: "missing sessionId" }, 400);
    const session = getDeviceSession(sessionId);
    if (!session) return c.json({ error: "session 不存在或已过期" }, 404);
    if (session.donorUserId && session.donorUserId !== user.id) {
      return c.json({ error: "forbidden" }, 403);
    }
    const result = await pollDeviceLogin(sessionId);
    if (result.ok) {
      const acc = await getAccount(result.accountId);
      if (acc && acc.donorUserId && acc.donorUserId !== user.id) {
        return c.json({ error: "forbidden" }, 403);
      }
      return c.json({
        ok: true,
        pending: false,
        account: acc ? publicAccount(acc) : { id: result.accountId },
      });
    }
    if (result.pending) {
      const acc = session.accountId ? await getAccount(session.accountId) : null;
      return c.json({
        ok: false,
        pending: true,
        userCode: session.userCode,
        verificationUri: session.verificationUri,
        account: acc ? publicAccount(acc) : null,
      });
    }
    const acc = session.accountId ? await getAccount(session.accountId) : null;
    return c.json({
      ok: false,
      pending: false,
      error: result.error,
      account: acc ? publicAccount(acc) : null,
    }, 400);
  });

  app.post("/api/me/accounts/:id/credits", async (c) => {
    const user = c.get("user")!;
    const acc = await getAccount(c.req.param("id"));
    if (!acc || acc.donorUserId !== user.id) return c.json({ error: "not found" }, 404);
    try {
      const credits = await fetchAccountCredits(acc.id, { force: true });
      const fresh = await getAccount(acc.id);
      return c.json({
        credits,
        account: fresh ? publicAccount(fresh) : null,
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  /**
   * Donor user search for allowlist editing.
   * Exact full username only (case-insensitive) — no prefix/fuzzy match.
   */
  app.get("/api/me/users/search", async (c) => {
    const q = (c.req.query("q") || "").trim();
    if (!q) return c.json({ users: [] });
    const me = c.get("user")!;
    const found = await getUserByUsername(q);
    if (!found || found.enabled === false || found.id === me.id) {
      return c.json({ users: [] });
    }
    return c.json({
      users: [{ id: found.id, username: found.username, role: found.role }],
    });
  });

  app.patch("/api/me/accounts/:id", async (c) => {
    const user = c.get("user")!;
    const acc = await getAccount(c.req.param("id"));
    if (!acc || acc.donorUserId !== user.id) return c.json({ error: "not found" }, 404);
    const body = (await c.req.json().catch(() => ({}))) as {
      name?: string;
      note?: string;
      private?: boolean;
      revokeUserIds?: string[];
      /** Full extras list (add/remove). null/[] clears. */
      allowedUserIds?: string[] | null;
      /** Append by exact usernames (donor can add members). */
      addUsernames?: string[];
      addUserIds?: string[];
    };
    const patch: {
      name?: string;
      note?: string;
      private?: boolean;
      allowedUserIds?: string[] | null;
    } = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.note !== undefined) patch.note = body.note;
    if (body.private !== undefined) patch.private = Boolean(body.private);

    const currentExtras = Array.isArray(acc.allowedUserIds) ? [...acc.allowedUserIds] : [];

    if (Array.isArray(body.revokeUserIds) && body.revokeUserIds.length) {
      const revoke = new Set(
        body.revokeUserIds
          .map((x) => (typeof x === "string" ? x.trim() : ""))
          .filter(Boolean),
      );
      // cannot revoke self/donor
      revoke.delete(user.id);
      const next = currentExtras.filter((id) => !revoke.has(id));
      patch.allowedUserIds = sanitizeAllowedUserIds(next, user.id);
    } else if (body.allowedUserIds !== undefined) {
      if (body.allowedUserIds === null || body.allowedUserIds === ([] as unknown)) {
        patch.allowedUserIds = null;
      } else if (Array.isArray(body.allowedUserIds)) {
        if (body.allowedUserIds.length === 0) {
          patch.allowedUserIds = null;
        } else {
          const requested = [
            ...new Set(
              body.allowedUserIds
                .map((x) => (typeof x === "string" ? x.trim() : ""))
                .filter(Boolean),
            ),
          ];
          for (const id of requested) {
            if (id === user.id) continue;
            const u = await getUser(id);
            if (!u) return c.json({ error: `用户不存在: ${id}` }, 400);
            if (u.enabled === false) return c.json({ error: `用户已禁用: ${u.username}` }, 400);
          }
          patch.allowedUserIds = sanitizeAllowedUserIds(requested, user.id);
          // named members mode
          if (patch.private === undefined) patch.private = false;
        }
      } else {
        return c.json({ error: "allowedUserIds 须为数组或 null" }, 400);
      }
    } else if (
      (Array.isArray(body.addUsernames) && body.addUsernames.length) ||
      (Array.isArray(body.addUserIds) && body.addUserIds.length)
    ) {
      const next = new Set(currentExtras);
      if (Array.isArray(body.addUserIds)) {
        for (const raw of body.addUserIds) {
          const id = typeof raw === "string" ? raw.trim() : "";
          if (!id || id === user.id) continue;
          const u = await getUser(id);
          if (!u) return c.json({ error: `用户不存在: ${id}` }, 400);
          if (u.enabled === false) return c.json({ error: `用户已禁用: ${u.username}` }, 400);
          next.add(u.id);
        }
      }
      if (Array.isArray(body.addUsernames)) {
        for (const raw of body.addUsernames) {
          const name = typeof raw === "string" ? raw.trim() : "";
          if (!name) continue;
          const u = await getUserByUsername(name);
          if (!u || u.enabled === false) {
            return c.json({ error: `未找到用户「${name}」（需完整用户名）` }, 400);
          }
          if (u.id === user.id) continue;
          next.add(u.id);
        }
      }
      const list = sanitizeAllowedUserIds([...next], user.id);
      if (!list || !list.length) {
        return c.json({ error: "没有可添加的成员" }, 400);
      }
      patch.allowedUserIds = list;
      if (patch.private === undefined) patch.private = false;
    }

    const updated = await updateAccount(acc.id, patch);
    if (!updated) return c.json({ error: "not found" }, 404);

    // rebuild members list for donor UI
    const users = await listUsers();
    const enabledById = new Map(
      users.filter((u) => u.enabled !== false).map((u) => [u.id, u] as const),
    );
    const members: Array<{ id: string; username: string; role: string; isDonor: boolean }> = [
      { id: user.id, username: user.username, role: user.role, isDonor: true },
    ];
    for (const id of updated.allowedUserIds || []) {
      if (id === user.id) continue;
      const u = enabledById.get(id);
      if (!u) continue;
      members.push({ id: u.id, username: u.username, role: u.role, isDonor: false });
    }
    return c.json({
      account: { ...publicAccount(updated), members, memberCount: members.length },
    });
  });

  app.delete("/api/me/accounts/:id", async (c) => {
    const user = c.get("user")!;
    const acc = await getAccount(c.req.param("id"));
    if (!acc || acc.donorUserId !== user.id) return c.json({ error: "not found" }, 404);
    await deleteAccount(acc.id);
    return c.json({ ok: true });
  });

  // Leaderboard — login required; excludes admin donors
  app.get("/api/leaderboard", async (c) => {
    const session = await resolveSession(bearer(c));
    if (!session) return c.json({ error: "unauthorized" }, 401);
    const users = await listUsers();
    const adminIds = new Set(users.filter((u) => u.role === "admin").map((u) => u.id));
    const names = new Map(users.map((u) => [u.id, u.username] as const));
    const board = await buildLeaderboard(session.user.id, adminIds, names);
    return c.json(board);
  });

  // ---------- Admin ----------
  app.use("/api/admin/*", requireAdmin);

  app.get("/api/admin/settings", async (c) => {
    const settings = await loadSettings();
    return c.json({ settings, runtime: getProxyInfo() });
  });

  app.patch("/api/admin/settings", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      proxyUrl?: string;
      upstreamBaseUrl?: string;
      oauthBaseUrl?: string;
      billingBaseUrl?: string;
      logRetentionDays?: number;
      logEnabled?: boolean;
      logBodies?: boolean;
      logBodiesOnError?: boolean;
      allowRegister?: boolean;
    };
    const patch: {
      proxyUrl?: string;
      upstreamBaseUrl?: string;
      oauthBaseUrl?: string;
      billingBaseUrl?: string;
      logRetentionDays?: number;
      logEnabled?: boolean;
      logBodies?: boolean;
      logBodiesOnError?: boolean;
      allowRegister?: boolean;
    } = {};
    if (body.proxyUrl !== undefined) patch.proxyUrl = body.proxyUrl;
    if (body.upstreamBaseUrl !== undefined) patch.upstreamBaseUrl = body.upstreamBaseUrl;
    if (body.oauthBaseUrl !== undefined) patch.oauthBaseUrl = body.oauthBaseUrl;
    if (body.billingBaseUrl !== undefined) patch.billingBaseUrl = body.billingBaseUrl;
    if (body.logRetentionDays !== undefined) patch.logRetentionDays = body.logRetentionDays;
    if (body.logEnabled !== undefined) patch.logEnabled = body.logEnabled;
    if (body.logBodies !== undefined) patch.logBodies = body.logBodies;
    if (body.logBodiesOnError !== undefined) patch.logBodiesOnError = body.logBodiesOnError;
    if (body.allowRegister !== undefined) patch.allowRegister = body.allowRegister;
    try {
      const settings = await saveSettings(patch);
      let runtime = getProxyInfo();
      if (body.proxyUrl !== undefined) {
        runtime = await setProxyOverride(settings.proxyUrl);
      }
      if (body.logRetentionDays !== undefined) {
        await cleanupLogs({ retentionDays: settings.logRetentionDays });
      }
      return c.json({
        settings,
        runtime,
        xaiBaseUrl: resolveUpstreamBaseUrl(settings.upstreamBaseUrl),
        oauthBaseUrl: resolveOauthBaseUrl(settings.oauthBaseUrl),
        billingBaseUrl: resolveBillingBaseUrl(settings.billingBaseUrl),
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.get("/api/admin/users", async (c) => {
    const users = await listUsers();
    return c.json({ users: users.map(publicUser) });
  });

  app.patch("/api/admin/users/:id", async (c) => {
    const body = (await c.req.json()) as {
      enabled?: boolean;
      role?: "admin" | "user";
      password?: string;
      username?: string;
      tokenQuota?: number | null;
      resetUsed?: boolean;
      tokenUsed?: number;
    };
    const me = c.get("user")!;
    if (body.password) {
      try {
        const updated = await setUserPassword(c.req.param("id"), body.password);
        if (!updated) return c.json({ error: "not found" }, 404);
        return c.json({ user: publicUser(updated) });
      } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
      }
    }
    if (body.username !== undefined) {
      try {
        const updated = await setUserUsername(c.req.param("id"), body.username);
        if (!updated) return c.json({ error: "not found" }, 404);
        return c.json({ user: publicUser(updated) });
      } catch (e) {
        return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
      }
    }
    if (body.role === "user" && c.req.param("id") === me.id) {
      return c.json({ error: "不能取消自己的管理员身份" }, 400);
    }
    const patch: Parameters<typeof updateUser>[1] = {};
    if (body.enabled !== undefined) patch.enabled = body.enabled;
    if (body.role !== undefined) patch.role = body.role;
    if (body.tokenQuota !== undefined) {
      if (body.tokenQuota === null || body.tokenQuota === ("" as unknown as number)) {
        patch.tokenQuota = null;
      } else {
        const n = Number(body.tokenQuota);
        if (!Number.isFinite(n) || n < 0) {
          return c.json({ error: "tokenQuota 须为非负整数或 null（不限）" }, 400);
        }
        patch.tokenQuota = Math.floor(n);
      }
    }
    if (body.resetUsed === true) patch.tokenUsed = 0;
    else if (body.tokenUsed !== undefined) {
      const n = Number(body.tokenUsed);
      if (!Number.isFinite(n) || n < 0) {
        return c.json({ error: "tokenUsed 须为非负整数" }, 400);
      }
      patch.tokenUsed = Math.floor(n);
    }
    const updated = await updateUser(c.req.param("id"), patch);
    if (!updated) return c.json({ error: "not found" }, 404);
    return c.json({ user: publicUser(updated) });
  });

  app.delete("/api/admin/users/:id", async (c) => {
    try {
      if (c.req.param("id") === c.get("user")!.id) {
        return c.json({ error: "不能删除自己" }, 400);
      }
      const ok = await deleteUser(c.req.param("id"));
      if (!ok) return c.json({ error: "not found" }, 404);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.get("/api/admin/accounts", async (c) => {
    const accounts = await listAccounts();
    const routing = await getRouting();
    const users = await listUsers();
    const nameById = new Map(users.map((u) => [u.id, u.username] as const));
    return c.json({
      accounts: accounts.map((a) => {
        const pub = publicAccount(a, routing.currentAccountId);
        const donorUsername = a.donorUserId
          ? nameById.get(a.donorUserId) || null
          : null;
        const allowedUsernames = (a.allowedUserIds || [])
          .map((id) => nameById.get(id) || id)
          .filter(Boolean);
        // display: donor always first among effective members
        const memberLabels: string[] = [];
        if (donorUsername) memberLabels.push(donorUsername + " (donor)");
        else if (a.donorUserId) memberLabels.push(a.donorUserId.slice(0, 8) + " (donor)");
        for (const name of allowedUsernames) {
          if (donorUsername && name === donorUsername) continue;
          memberLabels.push(name);
        }
        return {
          ...pub,
          donorUsername,
          allowedUsernames,
          memberLabels,
        };
      }),
      users: users.map((u) => ({ id: u.id, username: u.username, role: u.role, enabled: u.enabled })),
      routing,
      stats: {
        total: accounts.length,
        active: accounts.filter((a) => a.status === "active").length,
        exhausted: accounts.filter((a) => a.status === "exhausted").length,
        expired: accounts.filter((a) => a.status === "expired").length,
        error: accounts.filter((a) => a.status === "error").length,
      },
    });
  });

  app.post("/api/admin/accounts/oauth", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      name?: string;
      openBrowser?: boolean;
      donorUserId?: string | null;
      private?: boolean;
      allowedUserIds?: string[] | null;
      /** Rebind existing pending/error/expired seat */
      accountId?: string;
    };
    try {
      if (body.accountId) {
        const existing = await getAccount(body.accountId);
        if (!existing) return c.json({ error: "account not found" }, 404);
        const session = await startDeviceLogin({
          name: body.name?.trim() || existing.name,
          openBrowser: body.openBrowser !== false,
          donorUserId: existing.donorUserId ?? null,
          private: existing.private === true,
          allowedUserIds: existing.allowedUserIds ?? null,
          accountId: existing.id,
        });
        const acc = await getAccount(session.accountId);
        return c.json({
          sessionId: session.sessionId,
          accountId: session.accountId,
          userCode: session.userCode,
          verificationUri: session.verificationUri,
          verificationUriComplete: session.verificationUriComplete,
          expiresIn: session.expiresIn,
          account: acc ? publicAccount(acc) : null,
          instructions: `打开 ${session.verificationUri}，输入代码 ${session.userCode}`,
        });
      }
      let donorUserId: string | null = null;
      if (body.donorUserId) {
        const donor = await getUser(String(body.donorUserId));
        if (!donor) return c.json({ error: "贡献者不存在" }, 400);
        donorUserId = donor.id;
      }
      let allowedUserIds: string[] | null = null;
      if (Array.isArray(body.allowedUserIds)) {
        const ids = [
          ...new Set(
            body.allowedUserIds
              .map((x) => (typeof x === "string" ? x.trim() : ""))
              .filter(Boolean),
          ),
        ];
        for (const id of ids) {
          const u = await getUser(id);
          if (!u) return c.json({ error: `指定用户不存在: ${id}` }, 400);
        }
        allowedUserIds = ids.length ? ids : null;
      }
      const session = await startDeviceLogin({
        name: body.name,
        openBrowser: body.openBrowser !== false,
        donorUserId,
        private: body.private === true,
        allowedUserIds,
      });
      const acc = await getAccount(session.accountId);
      return c.json({
        sessionId: session.sessionId,
        accountId: session.accountId,
        userCode: session.userCode,
        verificationUri: session.verificationUri,
        verificationUriComplete: session.verificationUriComplete,
        expiresIn: session.expiresIn,
        account: acc ? publicAccount(acc) : null,
        instructions: `打开 ${session.verificationUri}，输入代码 ${session.userCode}`,
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.get("/api/admin/accounts/oauth/poll", async (c) => {
    const sessionId = c.req.query("sessionId");
    if (!sessionId) return c.json({ error: "missing sessionId" }, 400);
    const result = await pollDeviceLogin(sessionId);
    if (result.ok) {
      const acc = await getAccount(result.accountId);
      const routing = await getRouting();
      return c.json({
        ok: true,
        pending: false,
        account: acc ? publicAccount(acc, routing.currentAccountId) : { id: result.accountId },
      });
    }
    if (result.pending) {
      const session = getDeviceSession(sessionId);
      return c.json({
        ok: false,
        pending: true,
        userCode: session?.userCode,
        verificationUri: session?.verificationUri,
      });
    }
    return c.json({ ok: false, pending: false, error: result.error }, 400);
  });

  /** Bulk rename selected seats to email/username (or legacy default). */
  app.post("/api/admin/accounts/rename-default", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { ids?: string[] };
    if (!Array.isArray(body.ids) || !body.ids.length) {
      return c.json({ error: "ids 须为非空数组" }, 400);
    }
    const ids = [
      ...new Set(body.ids.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)),
    ];
    if (!ids.length) return c.json({ error: "ids 须为非空数组" }, 400);
    if (ids.length > 200) return c.json({ error: "一次最多 200 个" }, 400);
    const result = await renameAccountsToDefault(ids);
    const routing = await getRouting();
    return c.json({
      updated: result.updated,
      accounts: result.accounts.map((a) => publicAccount(a, routing.currentAccountId)),
    });
  });

  /** Refresh OIDC profile (email/username) and optionally rename to identity. */
  app.post("/api/admin/accounts/:id/profile", async (c) => {
    const id = c.req.param("id");
    const body = (await c.req.json().catch(() => ({}))) as { rename?: boolean };
    const acc = await getAccount(id);
    if (!acc) return c.json({ error: "not found" }, 404);
    if (acc.status === "pending" || !acc.tokens?.refresh) {
      return c.json({ error: "账号尚未完成 OAuth" }, 400);
    }
    try {
      const access = await getValidAccessToken(id);
      const profile = await fetchXaiUserinfo(access);
      const rename = body.rename !== false;
      let name = acc.name;
      if (rename && (profile.email || profile.xaiUsername)) {
        const all = await listAccounts();
        const taken = new Set(
          all
            .filter((a) => a.id !== id)
            .map((a) => a.name.trim().toLowerCase())
            .filter(Boolean),
        );
        const base =
          (profile.email || "").trim() ||
          (profile.xaiUsername || "").trim() ||
          acc.name;
        name = base;
        if (taken.has(name.toLowerCase())) {
          for (let n = 2; n < 1000; n++) {
            const cand = `${base}-${n}`;
            if (!taken.has(cand.toLowerCase())) {
              name = cand;
              break;
            }
          }
        }
      }
      const updated = await updateAccount(id, {
        email: profile.email ?? null,
        xaiUsername: profile.xaiUsername ?? null,
        name,
      });
      const routing = await getRouting();
      return c.json({
        account: updated ? publicAccount(updated, routing.currentAccountId) : null,
        profile,
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.patch("/api/admin/accounts/:id", async (c) => {
    const body = (await c.req.json()) as {
      name?: string;
      status?: "active" | "exhausted" | "expired" | "error";
      note?: string;
      private?: boolean;
      donorUserId?: string | null;
      allowedUserIds?: string[] | null;
    };
    const patch: {
      name?: string;
      status?: "active" | "exhausted" | "expired" | "error";
      note?: string;
      private?: boolean;
      donorUserId?: string | null;
      allowedUserIds?: string[] | null;
    } = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.status !== undefined) patch.status = body.status;
    if (body.note !== undefined) patch.note = body.note;
    if (body.private !== undefined) patch.private = Boolean(body.private);
    if (body.donorUserId !== undefined) {
      if (body.donorUserId === null || body.donorUserId === "") {
        patch.donorUserId = null;
      } else {
        const donor = await getUser(String(body.donorUserId));
        if (!donor) return c.json({ error: "贡献者不存在" }, 400);
        patch.donorUserId = donor.id;
      }
    }
    if (body.allowedUserIds !== undefined) {
      if (body.allowedUserIds === null) {
        patch.allowedUserIds = null;
      } else if (Array.isArray(body.allowedUserIds)) {
        const ids = [
          ...new Set(
            body.allowedUserIds
              .map((x) => (typeof x === "string" ? x.trim() : ""))
              .filter(Boolean),
          ),
        ];
        for (const id of ids) {
          const u = await getUser(id);
          if (!u) return c.json({ error: `指定用户不存在: ${id}` }, 400);
        }
        // donor always allowed; strip from stored extras
        const cur = await getAccount(c.req.param("id"));
        const donorId =
          patch.donorUserId !== undefined
            ? patch.donorUserId
            : cur?.donorUserId ?? null;
        patch.allowedUserIds = sanitizeAllowedUserIds(ids, donorId);
      } else {
        return c.json({ error: "allowedUserIds 须为字符串数组或 null" }, 400);
      }
    }
    const updated = await updateAccount(c.req.param("id"), patch);
    if (!updated) return c.json({ error: "not found" }, 404);
    const routing = await getRouting();
    return c.json({ account: publicAccount(updated, routing.currentAccountId) });
  });

  app.post("/api/admin/accounts/:id/reset", async (c) => {
    const updated = await updateAccount(c.req.param("id"), {
      status: "active",
      lastError: undefined,
    });
    if (!updated) return c.json({ error: "not found" }, 404);
    const routing = await getRouting();
    return c.json({ account: publicAccount(updated, routing.currentAccountId) });
  });

  app.delete("/api/admin/accounts/:id", async (c) => {
    const ok = await deleteAccount(c.req.param("id"));
    if (!ok) return c.json({ error: "not found" }, 404);
    return c.json({ ok: true });
  });

  app.post("/api/admin/accounts/:id/credits", async (c) => {
    try {
      const credits = await fetchAccountCredits(c.req.param("id"), { force: true });
      const acc = await getAccount(c.req.param("id"));
      const routing = await getRouting();
      return c.json({
        credits,
        account: acc ? publicAccount(acc, routing.currentAccountId) : null,
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.post("/api/admin/routing/current", async (c) => {
    const body = (await c.req.json()) as { accountId: string };
    try {
      const acc = await switchAccount(body.accountId);
      const routing = await getRouting();
      return c.json({ routing, account: publicAccount(acc, routing.currentAccountId) });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 400);
    }
  });

  app.post("/api/admin/routing/mode", async (c) => {
    const body = (await c.req.json()) as { mode: "auto" | "manual" };
    if (body.mode !== "auto" && body.mode !== "manual") {
      return c.json({ error: "mode must be auto|manual" }, 400);
    }
    const routing = await setRoutingMode(body.mode);
    return c.json({ routing });
  });

  app.get("/api/admin/routing", async (c) => {
    return c.json({ routing: await getRouting() });
  });

  // Admin can list all keys (all users) + owner username
  app.get("/api/admin/keys", async (c) => {
    const keys = await listApiKeys();
    const users = await listUsers();
    const names = new Map(users.map((u) => [u.id, u.username] as const));
    return c.json({
      keys: keys.map((k) => ({
        ...publicApiKey(k),
        username: k.userId ? names.get(k.userId) ?? k.userId : null,
      })),
    });
  });

  app.post("/api/admin/keys", async (c) => {
    const user = c.get("user");
    const body = (await c.req.json()) as {
      alias?: string;
      expiresAt?: number | null;
      expiresInDays?: number | null;
      note?: string;
      userId?: string | null;
    };
    let expiresAt: number | null = body.expiresAt ?? null;
    if (body.expiresInDays != null && body.expiresInDays > 0) {
      expiresAt = Date.now() + body.expiresInDays * 86400_000;
    }
    const { record, key } = await createApiKey({
      alias: body.alias ?? "",
      expiresAt,
      note: body.note,
      userId: body.userId ?? user?.id ?? null,
    });
    return c.json({ key, record: publicApiKey(record) });
  });

  app.patch("/api/admin/keys/:id", async (c) => {
    const body = (await c.req.json()) as {
      alias?: string;
      enabled?: boolean;
      expiresAt?: number | null;
      expiresInDays?: number | null;
      note?: string;
    };
    const patch: {
      alias?: string;
      enabled?: boolean;
      expiresAt?: number | null;
      note?: string;
    } = {};
    if (body.alias !== undefined) patch.alias = body.alias;
    if (body.enabled !== undefined) patch.enabled = body.enabled;
    if (body.note !== undefined) patch.note = body.note;
    if (body.expiresInDays !== undefined) {
      patch.expiresAt =
        body.expiresInDays != null && body.expiresInDays > 0
          ? Date.now() + body.expiresInDays * 86400_000
          : null;
    } else if (body.expiresAt !== undefined) {
      patch.expiresAt = body.expiresAt;
    }
    const updated = await updateApiKey(c.req.param("id"), patch);
    if (!updated) return c.json({ error: "not found" }, 404);
    return c.json({ record: publicApiKey(updated) });
  });

  app.delete("/api/admin/keys/:id", async (c) => {
    const ok = await deleteApiKey(c.req.param("id"));
    if (!ok) return c.json({ error: "not found" }, 404);
    return c.json({ ok: true });
  });

  app.get("/api/admin/logs", async (c) => {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 20);
    const day = c.req.query("day") || undefined;
    const model = c.req.query("model") || undefined;
    const accountId = c.req.query("accountId") || undefined;
    const apiKeyId = c.req.query("apiKeyId") || undefined;
    const userId = c.req.query("userId") || undefined;
    const okRaw = c.req.query("ok");
    const ok = okRaw === "true" ? true : okRaw === "false" ? false : undefined;
    const q = (c.req.query("q") || "").trim() || undefined;
    const result = await listRequestLogs({ page, limit, day, model, accountId, apiKeyId, userId, ok, q });
    const named = await withLiveDisplayNames(result.items);
    const items = named.map((item) => ({
      ...item,
      request: undefined,
      response: undefined,
      hasRequest: item.request !== undefined,
      hasResponse: item.response !== undefined,
    }));
    const disk = await logsDiskInfo();
    return c.json({ ...result, items, disk });
  });

  app.get("/api/admin/logs/:id", async (c) => {
    const log = await getRequestLog(c.req.param("id"));
    if (!log) return c.json({ error: "not found" }, 404);
    const [live] = await withLiveDisplayNames([log]);
    return c.json({ log: live || log });
  });

  app.delete("/api/admin/logs", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      all?: boolean;
      beforeDay?: string;
      retentionDays?: number;
    };
    const settings = await loadSettings();
    const result = await cleanupLogs({
      all: body.all === true,
      beforeDay: body.beforeDay,
      retentionDays: body.retentionDays ?? settings.logRetentionDays,
    });
    const disk = await logsDiskInfo();
    return c.json({ ...result, disk });
  });

  /** Strip request/response bodies from historical log files (keep metadata + usage). */
  app.post("/api/admin/logs/strip-bodies", async (c) => {
    const result = await stripLogBodies();
    const disk = await logsDiskInfo();
    return c.json({ ...result, disk });
  });

  app.get("/api/admin/usage", async (c) => {
    const days = Number(c.req.query("days") ?? 7);
    const hoursRaw = c.req.query("hours");
    const hours = hoursRaw != null && hoursRaw !== "" ? Number(hoursRaw) : undefined;
    const gran = c.req.query("granularity");
    const granularity =
      gran === "day" || gran === "hour" || gran === "minute" || gran === "5m"
        ? gran
        : undefined;
    const userId = c.req.query("userId") || undefined;
    const stats = await computeUsageStats({
      days,
      hours: Number.isFinite(hours as number) ? hours : undefined,
      granularity,
      userId,
    });
    return c.json({ stats });
  });

  // ---------- Proxy ----------
  app.post("/v1/responses", (c) => handleProxy(c, "responses"));
  app.post("/v1/chat/completions", (c) => handleProxy(c, "chat"));
  app.get("/v1/models", async (c) => {
    try {
      const preferred = c.req.header("x-account-id") ?? undefined;
      const result = await fetchUpstreamModels(preferred, c.get("apiKeyUserId"));
      return c.json(result.body, result.status as 200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return c.json({ error: { message: msg, type: "proxy_error" } }, 503);
    }
  });

  return app;
}

async function requireLogin(c: Context<{ Variables: Variables }>, next: Next) {
  const session = await resolveSession(bearer(c));
  if (!session) return c.json({ error: "unauthorized" }, 401);
  c.set("user", session.user);
  await next();
}

async function requireAdmin(c: Context<{ Variables: Variables }>, next: Next) {
  const token = bearer(c);
  // Legacy env ADMIN_TOKEN still works for emergency admin access
  if (config.adminToken && token === config.adminToken) {
    c.set("user", {
      id: "env-admin",
      username: "env-admin",
      passwordHash: "",
      role: "admin",
      enabled: true,
      tokenQuota: null,
      tokenUsed: 0,
      routeScope: "auto",
      routeAccountId: null,
      createdAt: 0,
      updatedAt: 0,
    });
    await next();
    return;
  }
  const session = await resolveSession(token);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  if (session.user.role !== "admin") return c.json({ error: "forbidden" }, 403);
  c.set("user", session.user);
  await next();
}

async function apiKeyMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const keys = await listApiKeys();
  if (keys.length === 0) {
    await next();
    return;
  }
  const auth = c.req.header("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key) return c.json({ error: { message: "Missing API key", type: "auth_error" } }, 401);
  const result = await verifyApiKey(key);
  if (!result.ok) {
    return c.json({ error: { message: result.reason, type: "auth_error" } }, 401);
  }
  if (result.record) {
    c.set("apiKeyId", result.record.id);
    c.set("apiKeyAlias", result.record.alias || result.record.keyPrefix);
    c.set("apiKeyUserId", result.record.userId ?? null);
    if (result.record.userId) {
      const owner = await getUser(result.record.userId);
      if (owner && isUserQuotaExceeded(owner)) {
        return c.json(
          {
            error: {
              message: "Token quota exceeded",
              type: "quota_exceeded",
              tokenUsed: owner.tokenUsed ?? 0,
              tokenQuota: owner.tokenQuota,
            },
          },
          429,
        );
      }
    }
  }
  await next();
}

function usageTotalTokens(usage: { totalTokens?: number; promptTokens?: number; completionTokens?: number } | undefined): number {
  if (!usage) return 0;
  if (typeof usage.totalTokens === "number" && usage.totalTokens > 0) return Math.floor(usage.totalTokens);
  const p = typeof usage.promptTokens === "number" ? usage.promptTokens : 0;
  const c = typeof usage.completionTokens === "number" ? usage.completionTokens : 0;
  const sum = p + c;
  return sum > 0 ? Math.floor(sum) : 0;
}

function chargeUserTokens(userId: string | null | undefined, usage: { totalTokens?: number; promptTokens?: number; completionTokens?: number } | undefined) {
  if (!userId) return;
  const n = usageTotalTokens(usage);
  if (n > 0) void incrementUserTokenUsed(userId, n);
}

async function handleProxy(c: Context<{ Variables: Variables }>, mode: ProxyMode) {
  const t0 = Date.now();
  const path = mode === "responses" ? "/v1/responses" : "/v1/chat/completions";
  const apiKeyId = c.get("apiKeyId");
  const apiKeyAlias = c.get("apiKeyAlias");
  const apiKeyUserId = c.get("apiKeyUserId");
  let body: unknown = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { message: "Invalid JSON body", type: "invalid_request" } }, 400);
  }

  const meta = parseBodyMeta(body);
  const inbound = collectRequestHeaders((name) => c.req.header(name));
  const settings = await loadSettings();
  const logging = settings.logEnabled !== false;
  const logBodies = settings.logBodies === true;
  const logBodiesOnError = settings.logBodiesOnError !== false;
  const reqClone = logging && logBodies ? safeCloneBody(body) : { value: undefined as unknown, truncated: false };

  const baseLog = {
    mode,
    path,
    model: meta.model,
    stream: meta.stream,
    apiKeyId,
    apiKeyAlias,
    userId: apiKeyUserId,
    request: reqClone.value,
    requestTruncated: reqClone.truncated,
    reasoningEffort: meta.reasoningEffort,
    headers: inbound.headers,
    userAgent: inbound.userAgent,
    client: inbound.client,
  };

  /** Keep response body when full bodies on, or on failure when logBodiesOnError. */
  const pickResponse = (
    status: number,
    captured: { response?: unknown; responseTruncated?: boolean; error?: string },
    bodyError?: string,
  ) => {
    const ok = isLogOk(status, bodyError || captured.error);
    const keep = logBodies || (!ok && logBodiesOnError);
    return {
      ok,
      response: keep ? captured.response : undefined,
      responseTruncated: keep ? captured.responseTruncated : undefined,
      error: bodyError || captured.error,
    };
  };

  try {
    const preferred = c.req.header("x-account-id") ?? undefined;
    const upstreamBody = ensureStreamUsage(mode, normalizeToolsInBody(body));
    const result = await proxyLLM({
      mode,
      body: upstreamBody,
      accountId: preferred,
      callerUserId: apiKeyUserId,
    });
    const contentType = result.headers.get("content-type") ?? "application/json";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "x-account-id": result.accountId,
      "x-account-name": result.accountName,
    };

    if (!result.body) {
      if (logging) {
        void appendRequestLog({
          ...baseLog,
          accountId: result.accountId,
          accountName: result.accountName,
          status: result.status,
          ok: isLogOk(result.status),
          latencyMs: Date.now() - t0,
        });
      }
      return new Response(null, { status: result.status, headers });
    }

    const isSse =
      meta.stream ||
      contentType.includes("text/event-stream") ||
      contentType.includes("event-stream");

    // Charge only on HTTP 2xx; body-level errors still may have used tokens upstream
    const shouldCharge = Boolean(apiKeyUserId) && result.status >= 200 && result.status < 300;
    if (!logging && !shouldCharge) {
      return new Response(result.body, { status: result.status, headers });
    }

    const ttftMs = (firstByteAt?: number) => {
      if (firstByteAt == null || !Number.isFinite(firstByteAt)) return undefined;
      const ms = Math.max(0, Math.round(firstByteAt - t0));
      return Number.isFinite(ms) ? ms : undefined;
    };

    if (isSse) {
      const clientBody = teeAndCapture(result.body, (captured) => {
        if (shouldCharge) chargeUserTokens(apiKeyUserId, captured.usage);
        if (logging) {
          const bodyError = extractBodyError(captured.response) || captured.error;
          const picked = pickResponse(result.status, captured, bodyError);
          const latencyMs = Date.now() - t0;
          const firstTokenMs = ttftMs(captured.firstByteAt);
          void appendRequestLog({
            ...baseLog,
            stream: true,
            accountId: result.accountId,
            accountName: result.accountName,
            status: result.status,
            ok: picked.ok,
            latencyMs,
            firstTokenMs:
              firstTokenMs != null && firstTokenMs <= latencyMs ? firstTokenMs : undefined,
            response: picked.response,
            responseTruncated: picked.responseTruncated,
            usage: captured.usage,
            error: picked.error,
          });
        }
      });
      return new Response(clientBody, { status: result.status, headers });
    }

    const { bytes, result: captured } = await captureJsonResponse(result.body);
    if (shouldCharge) chargeUserTokens(apiKeyUserId, captured.usage);
    if (logging) {
      const bodyError = extractBodyError(captured.response) || captured.error;
      const picked = pickResponse(result.status, captured, bodyError);
      const latencyMs = Date.now() - t0;
      const firstTokenMs = ttftMs(captured.firstByteAt);
      void appendRequestLog({
        ...baseLog,
        stream: false,
        accountId: result.accountId,
        accountName: result.accountName,
        status: result.status,
        ok: picked.ok,
        latencyMs,
        firstTokenMs:
          firstTokenMs != null && firstTokenMs <= latencyMs ? firstTokenMs : undefined,
        response: picked.response,
        responseTruncated: picked.responseTruncated,
        usage: captured.usage,
        error: picked.error,
      });
    }
    return new Response(bytes, { status: result.status, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (logging) {
      void appendRequestLog({
        ...baseLog,
        status: 503,
        ok: false,
        latencyMs: Date.now() - t0,
        error: msg,
      });
    }
    return c.json({ error: { message: msg, type: "proxy_error" } }, 503);
  }
}
