import type { Context } from "hono";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { listApiKeys, verifyApiKey } from "../account/store.js";
import { createGrokMcpServer } from "./tools.js";

async function resolveMcpAuth(c: Context): Promise<
  | { ok: true; callerUserId: string | null; accountId?: string }
  | { ok: false; status: 401; message: string }
> {
  const keys = await listApiKeys();
  // No keys configured → open local access (same as /v1)
  if (keys.length === 0) {
    const pin = c.req.header("x-account-id") ?? undefined;
    return { ok: true, callerUserId: null, accountId: pin };
  }
  const auth = c.req.header("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key) {
    return { ok: false, status: 401, message: "Missing API key (Authorization: Bearer gk_...)" };
  }
  const result = await verifyApiKey(key);
  if (!result.ok) {
    return { ok: false, status: 401, message: result.reason };
  }
  return {
    ok: true,
    callerUserId: result.record?.userId ?? null,
    accountId: c.req.header("x-account-id") ?? undefined,
  };
}

/**
 * Remote MCP endpoint handler (Streamable HTTP, stateless).
 * Mount on: app.all("/mcp", handleMcpHttp)
 */
export async function handleMcpHttp(c: Context): Promise<Response> {
  // Preflight handled by global cors, but keep safe response
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  const auth = await resolveMcpAuth(c);
  if (!auth.ok) {
    return c.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: auth.message },
        id: null,
      },
      auth.status,
    );
  }

  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      // stateless: no session affinity required
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    const server = createGrokMcpServer({
      callerUserId: auth.callerUserId,
      accountId: auth.accountId,
    });
    await server.connect(transport);
    const res = await transport.handleRequest(c.req.raw);
    // Best-effort cleanup after response finishes
    void res
      .clone()
      .arrayBuffer()
      .catch(() => undefined)
      .finally(() => {
        try {
          transport.close();
          server.close();
        } catch {
          /* ignore */
        }
      });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return c.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: msg },
        id: null,
      },
      500,
    );
  }
}
