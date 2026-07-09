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

export function createApp() {
  const app = new Hono();
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
      adminTokenHint: config.adminToken
        ? "server_has_admin_token"
        : "admin_open",
      proxy: proxy.proxy,
      proxySource: proxy.source,
      proxyConfigured: settings.proxyUrl,
      xaiBaseUrl: config.xai.baseUrl,
    });
  });

  app.get("/api/admin/settings", async (c) => {
    const settings = await loadSettings();
    return c.json({ settings, runtime: getProxyInfo() });
  });

  app.patch("/api/admin/settings", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { proxyUrl?: string };
    const settings = await saveSettings({
      proxyUrl: body.proxyUrl ?? "",
    });
    const runtime = await setProxyOverride(settings.proxyUrl);
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

async function apiKeyMiddleware(c: Context, next: Next) {
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
  await next();
}

async function handleProxy(c: Context, mode: ProxyMode) {
  try {
    const body = await c.req.json();
    const preferred = c.req.header("x-account-id") ?? undefined;
    const result = await proxyLLM({ mode, body, accountId: preferred });
    const contentType = result.headers.get("content-type") ?? "application/json";
    const headers = {
      "Content-Type": contentType,
      "x-account-id": result.accountId,
      "x-account-name": result.accountName,
    };
    if (!result.body) return new Response(null, { status: result.status, headers });
    return new Response(result.body, { status: result.status, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return c.json({ error: { message: msg, type: "proxy_error" } }, 503);
  }
}
