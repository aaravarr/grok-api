import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export const config = {
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? "127.0.0.1",
  dataDir: process.env.DATA_DIR ?? path.join(root, "data"),
  authFile: process.env.AUTH_FILE ?? path.join(root, "data", "accounts.json"),
  oauth: {
    clientId: process.env.XAI_CLIENT_ID ?? "b1a00492-073a-47ea-816f-4c329264a828",
    authorizeUrl: "https://auth.x.ai/oauth2/authorize",
    tokenUrl: "https://auth.x.ai/oauth2/token",
    deviceAuthorizationUrl: "https://auth.x.ai/oauth2/device/code",
    scope: "openid profile email offline_access grok-cli:access api:access",
    refreshSkewMs: 120_000,
    /** Proactive refresh if idle for this long (lastUsedAt/createdAt). */
    proactiveIdleMs: 2 * 24 * 60 * 60 * 1000,
    /** Stop proactive refresh once seat is older than this since createdAt. */
    proactiveMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
    /** How often to scan for idle seats needing proactive refresh. */
    proactiveCheckMs: 13 * 60 * 1000,
  },
  xai: {
    baseUrl: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1",
    defaultModel: process.env.XAI_DEFAULT_MODEL ?? "grok-4.5",
  },
  adminToken: process.env.ADMIN_TOKEN ?? "",
};
