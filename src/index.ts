import { serve } from "@hono/node-server";
import { startTokenRefreshScheduler } from "./account/token-refresh.js";
import { config } from "./config.js";
import { dbPath, getDb } from "./db/sqlite.js";
import { applyProxy } from "./proxy.js";
import { createApp } from "./server/app.js";

await applyProxy();
getDb();

const app = createApp();
startTokenRefreshScheduler();

console.log(`[grok-api] http://${config.host}:${config.port}`);
console.log(`[grok-api] admin UI  → /`);
console.log(`[grok-api] api       → POST /v1/chat/completions | /v1/responses | /v1/images/* | /v1/videos/*`);
console.log(`[grok-api] mcp       → /mcp  (remote Streamable HTTP, Bearer gk_...)`);
console.log(`[grok-api] db        → ${dbPath()}`);

serve({
  fetch: app.fetch,
  hostname: config.host,
  port: config.port,
});
