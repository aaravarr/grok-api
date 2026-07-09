import { serve } from "@hono/node-server";
import { config } from "./config.js";
import { applyProxy } from "./proxy.js";
import { createApp } from "./server/app.js";

await applyProxy();

const app = createApp();

console.log(`[grok-api] http://${config.host}:${config.port}`);
console.log(`[grok-api] admin UI  → /`);
console.log(`[grok-api] api       → POST /v1/chat/completions | /v1/responses`);
console.log(`[grok-api] data      → ${config.authFile}`);

serve({
  fetch: app.fetch,
  hostname: config.host,
  port: config.port,
});