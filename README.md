<p align="center">
  <img src="docs/screenshots/logo.svg" width="64" height="64" alt="Grok API" />
</p>

<h1 align="center">Grok API</h1>

<p align="center">
  <strong>SuperGrok account pool · credit-aware routing · OpenAI-compatible proxy · Imagine media · remote MCP</strong><br />
  Turn multiple SuperGrok OAuth sessions into one local API for chat, images, videos, and agents.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README_CN.md">简体中文</a> ·
  <a href="MCP.md">MCP</a> ·
  <a href="DESIGN.md">Design</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stack-TypeScript%20%2B%20Hono-0070f3?style=flat-square" alt="stack" />
  <img src="https://img.shields.io/badge/API-OpenAI%20compatible-black?style=flat-square" alt="api" />
  <img src="https://img.shields.io/badge/MCP-remote%20HTTP-111111?style=flat-square" alt="mcp" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
</p>

---

## Features

- **Multi-account SuperGrok OAuth** — Device Code login, expired-account re-auth, CPA/Sub2API JSON import
- **Credit-aware routing** — Auto / Manual modes, sticky seats, failover when exhausted
- **OpenAI-compatible proxy** — `/v1/chat/completions`, `/v1/responses`, live `/v1/models`
- **Imagine media APIs** — image generate/edit, video generate/edit/extend/status, TTS / voices / realtime client secrets
- **Media Studio console** — online image/video generation, streaming AI prompt polish, MCP config panel
- **Remote MCP** — Streamable HTTP at `/mcp` with Bearer API key (no local checkout required)
- **Multi-user console** — accounts, keys, usage, server-side log search, contribute/leaderboard
- **Operational details** — outbound proxy auto-detect, request logging, sticky `request_id → account` for async video jobs

---

## Quick Start

```bash
git clone https://github.com/aaravarr/grok-api.git
cd grok-api
npm install
npm run dev
```

Open **http://127.0.0.1:8787**

1. Complete setup / login
2. Add a SuperGrok account (OAuth or CPA JSON)
3. Create an API key
4. Call the proxy or connect MCP

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H "Authorization: Bearer gk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"model":"grok-4.5","messages":[{"role":"user","content":"hello"}]}'
```

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "gk_your_key",
  baseURL: "http://127.0.0.1:8787/v1",
});
```

---

## Console

| Route | Purpose |
|-------|---------|
| `/overview` | Usage snapshot and shortcuts |
| `/accounts` | SuperGrok seats, OAuth / CPA import, re-auth |
| `/keys` | API keys (view/copy when full secret is stored) |
| `/media` | Media Studio + MCP setup |
| `/usage` | Token / request analytics |
| `/logs` | Server-side searchable request logs |
| `/contribute` | Share seats into the pool |
| `/settings` | Upstream / proxy / log policy |

UI design tokens live in [`DESIGN.md`](DESIGN.md). Contributor notes live in [`AGENTS.md`](AGENTS.md).

---

## Proxy API

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/v1/chat/completions` | Chat |
| `POST` | `/v1/responses` | Responses-compatible entry |
| `GET` | `/v1/models` | Live upstream models |
| `POST` | `/v1/images/generations` | Text → image |
| `POST` | `/v1/images/edits` | Image edit |
| `POST` | `/v1/videos/generations` | Text/image → video (async) |
| `POST` | `/v1/videos/edits` | Video edit (async) |
| `POST` | `/v1/videos/extensions` | Video extend (async) |
| `GET` | `/v1/videos/:requestId` | Video status |
| `ALL` | `/mcp` | Remote MCP |
| `GET` | `/health` | Health check |

Optional header: `x-account-id` to pin a pool account.

### Video notes

- `grok-imagine-video` supports text-to-video and image-to-video
- `grok-imagine-video-1.5` is image-to-video only
- Async video jobs are sticky to the creating account via `request_id → account` mapping
- Media traffic consumes SuperGrok credits

---

## MCP

Preferred remote config:

```json
{
  "mcpServers": {
    "grok-api": {
      "url": "http://127.0.0.1:8787/mcp",
      "headers": {
        "Authorization": "Bearer gk_xxx"
      }
    }
  }
}
```

Tools include image/video generate, edit, extend, and status polling.  
Full details: [`MCP.md`](MCP.md)

---

## Routing

```text
request → API key auth → pick account
  Manual: fixed seat
  Auto:   healthy current, else next
→ credit check for that seat
→ OAuth bearer → api.x.ai
→ exhausted / retryable → mark + rotate (Auto)
```

For async video status polls, the server reuses the account that created the `request_id` when possible.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | Listen port |
| `HOST` | `127.0.0.1` | Bind address |
| `DATA_DIR` | `./data` | Runtime state directory |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | Inference upstream |
| `HTTPS_PROXY` / `HTTP_PROXY` | auto | Optional outbound proxy; otherwise system proxy / Settings UI |
| `ADMIN_TOKEN` | empty | Optional emergency admin token for `/api/admin/*` |

Local state stays under `data/` (`accounts.json`, `users.json`, logs, video job map). Do not commit secrets.

### API keys

| Item | Behavior |
|------|----------|
| New keys | Full secret can be stored for redisplay / Media Studio / MCP config |
| Legacy keys | Hash/prefix only → paste full secret or create a new key |
| Auth header | `Authorization: Bearer gk_...` on `/v1/*` and `/mcp` |

---

## Development

```bash
npm run dev        # hot reload
npm run start      # normal local server
npm run typecheck  # tsc --noEmit
npm run build      # compile
```

After code changes to a non-watch process, restart the local server.

---

## Disclaimer

Unofficial · not affiliated with xAI · respect their ToS · credentials stay local.

## License

[MIT](LICENSE)
