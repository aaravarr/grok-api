import { Hono } from "hono";
import type { Context, Next } from "hono";
import { cors } from "hono/cors";
import { config } from "../config.js";
import {
  createApiKey,
  deleteAccount,
  deleteApiKey,
  getAccount,
  getRouting,
  listAccounts,
  listApiKeys,
  publicAccount,
  publicApiKey,
  setRoutingMode,
  updateAccount,
  updateApiKey,
  verifyApiKey,
} from "../account/store.js";
import { getDeviceSession, pollDeviceLogin, startDeviceLogin } from "../account/oauth.js";
import { fetchAccountCredits } from "../account/billing.js";
import { switchAccount } from "../account/router.js";
import { fetchUpstreamModels, proxyLLM, type ProxyMode } from "../client/xai.js";
import { getProxyInfo, setProxyOverride } from "../proxy.js";
import { loadSettings, saveSettings } from "../settings.js";
import { adminHtml } from "../web/admin.js";
import {
  appendRequestLog,
  cleanupLogs,
  getRequestLog,
  listRequestLogs,
  logsDiskInfo,
} from "../usage/logger.js";
import {
  captureJsonResponse,
  ensureStreamUsage,
  parseBodyMeta,
  safeCloneBody,
  teeAndCapture,
} from "../usage/capture.js";
import { collectRequestHeaders } from "../usage/client-meta.js";
import { computeUsageStats } from "../usage/stats.js";

type Variables = {
  apiKeyId: string | null;
  apiKeyAlias: string | null;
};

export function createApp() {
  const app = new Hono<{ Variables: Variables }>();
  app.use("*", cors());

  // Admin auth — only when ADMIN_TOKEN is configured
  app.use("/api/admin/*", async (c, next) => {
    if (!config.adminToken) {
      await next();
      return;
    }
    const auth = c.req.header("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : (c.req.query("token") ?? "");
    if (token !== config.adminToken) return c.json({ error: "unauthorized" }, 401);
    await next();
  });

  // Proxy API key auth for /v1/*
  app.use("/v1/*", apiKeyMiddleware);

  app.get("/", (c) => c.html(adminHtml()));
  app.get("/health", (c) =>
    c.json({
      ok: true,
      ...getProxyInfo(),
      adminTokenRequired: Boolean(config.adminToken),
    }),
  );

  /** Public meta for admin UI (no secrets) */
  app.get("/api/meta", async (c) => {
    const settings = await loadSettings();
    const proxy = getProxyInfo();
    return c.json({
      adminTokenRequired: Boolean(config.adminToken),
      adminTokenHint: config.adminToken ? "server_has_admin_token" : "admin_open",
      proxy: proxy.proxy,
      proxySource: proxy.source,
      proxyConfigured: settings.proxyUrl,
      logRetentionDays: settings.logRetentionDays,
      logEnabled: settings.logEnabled,
      xaiBaseUrl: config.xai.baseUrl,
    });
  });

  app.get("/api/admin/settings", async (c) => {
    const settings = await loadSettings();
    return c.json({ settings, runtime: getProxyInfo() });
  });

  app.patch("/api/admin/settings", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      proxyUrl?: string;
      logRetentionDays?: number;
      logEnabled?: boolean;
    };
    const patch: {
      proxyUrl?: string;
      logRetentionDays?: number;
      logEnabled?: boolean;
    } = {};
    if (body.proxyUrl !== undefined) patch.proxyUrl = body.proxyUrl;
    if (body.logRetentionDays !== undefined) patch.logRetentionDays = body.logRetentionDays;
    if (body.logEnabled !== undefined) patch.logEnabled = body.logEnabled;
    const settings = await saveSettings(patch);
    let runtime = getProxyInfo();
    if (body.proxyUrl !== undefined) {
      runtime = await setProxyOverride(settings.proxyUrl);
    }
    if (body.logRetentionDays !== undefined) {
      await cleanupLogs({ retentionDays: settings.logRetentionDays });
    }
    return c.json({ settings, runtime });
  });

  // ---- Accounts ----
  app.get("/api/admin/accounts", async (c) => {
    const accounts = await listAccounts();
    const routing = await getRouting();
    return c.json({
      accounts: accounts.map((a) => publicAccount(a, routing.currentAccountId)),
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
    };
    try {
      const session = await startDeviceLogin({
        name: body.name,
        openBrowser: body.openBrowser !== false,
      });
      return c.json({
        mode: "device_code",
        sessionId: session.sessionId,
        userCode: session.userCode,
        verificationUri: session.verificationUri,
        verificationUriComplete: session.verificationUriComplete,
        expiresIn: session.expiresIn,
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

  app.patch("/api/admin/accounts/:id", async (c) => {
    const body = (await c.req.json()) as {
      name?: string;
      status?: "active" | "exhausted" | "expired" | "error";
      note?: string;
    };
    const updated = await updateAccount(c.req.param("id"), body);
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

  /** Check credits ONLY for this account */
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

  /** Switch current account (manual) + check only that one */
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

  // ---- API Keys ----
  app.get("/api/admin/keys", async (c) => {
    const keys = await listApiKeys();
    return c.json({ keys: keys.map(publicApiKey) });
  });

  app.post("/api/admin/keys", async (c) => {
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
    });
    return c.json({ key, record: publicApiKey(record) });
  });

  app.patch("/api/admin/keys/:id", async (c) => {
    const body = (await c.req.json()) as {
      alias?: string;
      enabled?: boolean;
      expiresAt?: number | null;
      note?: string;
    };
    const updated = await updateApiKey(c.req.param("id"), body);
    if (!updated) return c.json({ error: "not found" }, 404);
    return c.json({ record: publicApiKey(updated) });
  });

  app.delete("/api/admin/keys/:id", async (c) => {
    const ok = await deleteApiKey(c.req.param("id"));
    if (!ok) return c.json({ error: "not found" }, 404);
    return c.json({ ok: true });
  });

  // ---- Logs & Usage ----
  app.get("/api/admin/logs", async (c) => {
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 20);
    const day = c.req.query("day") || undefined;
    const model = c.req.query("model") || undefined;
    const accountId = c.req.query("accountId") || undefined;
    const apiKeyId = c.req.query("apiKeyId") || undefined;
    const okRaw = c.req.query("ok");
    const ok = okRaw === "true" ? true : okRaw === "false" ? false : undefined;
    const result = await listRequestLogs({ page, limit, day, model, accountId, apiKeyId, ok });
    // list without huge response bodies
    const items = result.items.map((item) => ({
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
    return c.json({ log });
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

  app.get("/api/admin/usage", async (c) => {
    const days = Number(c.req.query("days") ?? 7);
    const stats = await computeUsageStats(days);
    return c.json({ stats });
  });

  // ---- Proxy ----
  app.post("/v1/responses", (c) => handleProxy(c, "responses"));
  app.post("/v1/chat/completions", (c) => handleProxy(c, "chat"));
  app.get("/v1/models", async (c) => {
    try {
      const preferred = c.req.header("x-account-id") ?? undefined;
      const result = await fetchUpstreamModels(preferred);
      return c.json(result.body, result.status as 200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return c.json({ error: { message: msg, type: "proxy_error" } }, 503);
    }
  });

  return app;
}

async function apiKeyMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  c.set("apiKeyId", null);
  c.set("apiKeyAlias", null);
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
  }
  await next();
}

async function handleProxy(c: Context<{ Variables: Variables }>, mode: ProxyMode) {
  const t0 = Date.now();
  const path = mode === "responses" ? "/v1/responses" : "/v1/chat/completions";
  const apiKeyId = c.get("apiKeyId");
  const apiKeyAlias = c.get("apiKeyAlias");
  let body: unknown = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { message: "Invalid JSON body", type: "invalid_request" } }, 400);
  }

  const meta = parseBodyMeta(body);
  const reqClone = safeCloneBody(body);
  const inbound = collectRequestHeaders((name) => c.req.header(name));
  const settings = await loadSettings();
  const logging = settings.logEnabled !== false;

  const baseLog = {
    mode,
    path,
    model: meta.model,
    stream: meta.stream,
    apiKeyId,
    apiKeyAlias,
    request: reqClone.value,
    requestTruncated: reqClone.truncated,
    reasoningEffort: meta.reasoningEffort,
    headers: inbound.headers,
    userAgent: inbound.userAgent,
    client: inbound.client,
  };

  try {
    const preferred = c.req.header("x-account-id") ?? undefined;
    // Inject stream_options.include_usage so SSE includes token usage (Apifox etc.)
    const upstreamBody = ensureStreamUsage(mode, body);
    const result = await proxyLLM({ mode, body: upstreamBody, accountId: preferred });
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
          ok: result.status >= 200 && result.status < 300,
          latencyMs: Date.now() - t0,
        });
      }
      return new Response(null, { status: result.status, headers });
    }

    const isSse =
      meta.stream ||
      contentType.includes("text/event-stream") ||
      contentType.includes("event-stream");

    if (!logging) {
      return new Response(result.body, { status: result.status, headers });
    }

    if (isSse) {
      const clientBody = teeAndCapture(result.body, (captured) => {
        void appendRequestLog({
          ...baseLog,
          stream: true,
          accountId: result.accountId,
          accountName: result.accountName,
          status: result.status,
          ok: result.status >= 200 && result.status < 300,
          latencyMs: Date.now() - t0,
          response: captured.response,
          responseTruncated: captured.responseTruncated,
          usage: captured.usage,
          error: captured.error,
        });
      });
      return new Response(clientBody, { status: result.status, headers });
    }

    // Non-stream: buffer to extract usage, then return same bytes
    const { bytes, result: captured } = await captureJsonResponse(result.body);
    void appendRequestLog({
      ...baseLog,
      stream: false,
      accountId: result.accountId,
      accountName: result.accountName,
      status: result.status,
      ok: result.status >= 200 && result.status < 300,
      latencyMs: Date.now() - t0,
      response: captured.response,
      responseTruncated: captured.responseTruncated,
      usage: captured.usage,
      error: captured.error,
    });
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
