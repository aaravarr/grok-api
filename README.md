<p align="center">
  <img src="docs/screenshots/logo.svg" width="64" height="64" alt="Grok API" />
</p>

<h1 align="center">Grok API</h1>

<p align="center">
  <strong>SuperGrok account pool · credit-aware routing · OpenAI-compatible proxy</strong><br />
  Turn multiple SuperGrok OAuth sessions into a single, production-ready API endpoint.
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/features-account%20pool%20%7C%20credits%20%7C%20api%20keys-000?style=flat-square" alt="features" /></a>
  <a href="#quick-start"><img src="https://img.shields.io/badge/stack-TypeScript%20%2B%20Hono-0070f3?style=flat-square" alt="stack" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" /></a>
  <a href="#proxy-api"><img src="https://img.shields.io/badge/API-OpenAI%20compatible-black?style=flat-square" alt="openai" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#proxy-api">API</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#configuration">Config</a>
</p>

---

## Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/accounts.png" alt="Accounts dashboard" />
      <p align="center"><sub>Account pool · live credits · Auto / Manual routing</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/api-keys.png" alt="API Keys management" />
      <p align="center"><sub>API keys with alias, expiry, and one-time reveal</sub></p>
    </td>
  </tr>
</table>

> Vercel-inspired admin UI — Geist typography, hairline borders, high-contrast controls.

---

## Why this exists

SuperGrok subscriptions are great for coding agents — until you hit the weekly cap, burn a single session, or need to share access safely with tools like Claude Code / Cursor / OpenCode.

**Grok API** sits in front of xAI and gives you:

| Pain | Fix |
|------|-----|
| One account, one quota wall | Multi-account pool with smart failover |
| “Is this account dead?” | Live credit % from official billing endpoint |
| Sharing raw OAuth tokens | Issue scoped `gk_…` API keys (alias + expiry) |
| OpenAI-only clients | Drop-in `/v1/chat/completions` & `/v1/responses` |
| Batch-scanning every account | **Only the current account** is credit-checked |

---

## Features

### Account pool
- **Device Code OAuth** — no loopback hacks; works when xAI shows short codes
- **Auto / Manual routing** — round-robin with failover, or pin a specific account
- **Current account highlight** — always know which session is live
- Status machine: `active` · `exhausted` · `expired` · `error`

### Credit awareness
- Reads SuperGrok weekly usage via  
  `GET https://cli-chat-proxy.grok.com/v1/billing?format=credits`
- Progress bar in the UI (`26% used · 74% left`)
- **Single-account probes only** (60s cache) — avoids multi-account rate risk
- Exhausted sessions are skipped automatically in Auto mode

### API key gateway
- Create keys with **alias**, **TTL (days)**, and notes
- Full secret shown **once**; stored as SHA-256
- Zero keys ⇒ open local access; any key ⇒ Bearer required
- Disable / delete without rotating the whole pool

### Proxy
- Transparent body passthrough to xAI (no re-schema)
- Optional `x-account-id` to force an upstream session
- Response headers: `x-account-id`, `x-account-name`
- System / env HTTP proxy support (Windows registry aware)

---

## Quick Start

### Requirements
- Node.js 20+
- A SuperGrok (or eligible) xAI account
- Outbound access to `auth.x.ai`, `api.x.ai`, `cli-chat-proxy.grok.com`  
  (HTTP proxy supported)

### Install & run

```bash
git clone https://github.com/<you>/grok-api.git
cd grok-api
npm install
npm run dev
```

Open **http://127.0.0.1:8787**

```bash
# production-style
npm start
# or
npm run build && node dist/index.js
```

### Add an account
1. Click **Add account**
2. Complete Device Code login in the browser
3. Watch the account appear with live credit meter

### Create an API key
1. Tab **API Keys** → **Create key**
2. Set alias / optional expiry
3. Copy `gk_…` immediately (shown once)

### Call the proxy

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H "Authorization: Bearer gk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "messages": [{"role": "user", "content": "hello"}]
  }'
```

```bash
curl http://127.0.0.1:8787/v1/responses \
  -H "Authorization: Bearer gk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"model":"grok-4.5","input":"hello"}'
```

Pin an upstream account:

```bash
curl ... -H "x-account-id: 5316c64c8c80668c"
```

### Point any OpenAI client at it

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "gk_your_key",
  baseURL: "http://127.0.0.1:8787/v1",
});

const res = await client.chat.completions.create({
  model: "grok-4.5",
  messages: [{ role: "user", content: "Ship it." }],
});
```

---

## Architecture

```text
┌─────────────┐     Bearer gk_…      ┌──────────────────┐
│  Claude Code│ ───────────────────► │                  │
│  Cursor     │                      │   Grok API       │
│  OpenCode   │   OpenAI-compatible  │   (Hono)         │
│  curl       │ ◄─────────────────── │                  │
└─────────────┘                      │  ┌────────────┐  │
                                     │  │  API Keys  │  │
                                     │  └────────────┘  │
                                     │  ┌────────────┐  │
                                     │  │  Router    │──┼── only current
                                     │  │  Auto/Man  │  │   account
                                     │  └─────┬──────┘  │   credit check
                                     │        │         │
                                     │  ┌─────▼──────┐  │
                                     │  │ Account #1 │──┼──► api.x.ai
                                     │  │ Account #2 │  │    /v1/chat/...
                                     │  │ Account #N │  │    /v1/responses
                                     │  └────────────┘  │
                                     └──────────────────┘
                                              │
                                              ▼
                               cli-chat-proxy.grok.com
                               /v1/billing?format=credits
```

| Layer | Role |
|-------|------|
| `account/oauth` | Device Code login + token refresh |
| `account/billing` | Per-account credit snapshot (no bulk scan) |
| `account/router` | Current selection, Auto failover, Manual pin |
| `account/store` | Atomic JSON store (`accounts` + `apiKeys` + `routing`) |
| `client/xai` | Upstream proxy + exhausted retry |
| `web/admin` | Vercel-style control plane |

---

## Proxy API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat (passthrough body) |
| `POST` | `/v1/responses` | xAI Responses API |
| `GET` | `/v1/models` | Model list helper |
| `GET` | `/health` | Liveness |

**Auth**
- No API keys created → open (local default)
- Any key exists → `Authorization: Bearer gk_…` required

**Headers**
| Header | Direction | Meaning |
|--------|-----------|---------|
| `Authorization` | in | API key |
| `x-account-id` | in | Force upstream account |
| `x-account-id` | out | Which account served the call |
| `x-account-name` | out | Human label |

---

## Admin API

Protected by `ADMIN_TOKEN` when set (`Authorization: Bearer <token>`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/accounts` | List + stats + routing |
| `POST` | `/api/admin/accounts/oauth` | Start Device Code login |
| `GET` | `/api/admin/accounts/oauth/poll` | Poll login result |
| `POST` | `/api/admin/accounts/:id/credits` | Refresh **one** account’s credits |
| `POST` | `/api/admin/routing/current` | Manual switch + single credit check |
| `POST` | `/api/admin/routing/mode` | `auto` \| `manual` |
| `GET/POST/PATCH/DELETE` | `/api/admin/keys` | API key CRUD |

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | Listen port |
| `HOST` | `127.0.0.1` | Bind address |
| `DATA_DIR` | `./data` | Persistent data |
| `ADMIN_TOKEN` | _(empty)_ | Admin UI / API secret |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | Inference upstream |
| `HTTPS_PROXY` / `HTTP_PROXY` | system | Outbound proxy (Windows registry auto-detect) |

Data file: `data/accounts.json` (version 2)

```json
{
  "version": 2,
  "accounts": [],
  "apiKeys": [],
  "routing": {
    "mode": "auto",
    "currentAccountId": null,
    "cursor": 0
  }
}
```

> Tokens and key hashes live on disk. Never commit `data/`.

---

## Routing rules

```text
request
  → verify API key (if any exist)
  → pick account
       Manual: fixed currentAccountId
       Auto:   current if healthy, else next active
  → credit-check THAT account only
       remaining ≈ 0  → mark exhausted → next (Auto)
  → inject OAuth access_token → xAI
  → on 429/402 → mark exhausted → retry next
```

---

## Security notes

- OAuth secrets stay local; clients only see `gk_` API keys
- API keys are hashed at rest (SHA-256); plaintext shown once
- Bind `HOST=127.0.0.1` unless you put a reverse proxy + TLS in front
- Set `ADMIN_TOKEN` before exposing the admin UI
- This project reuses the public Grok CLI OAuth client id (same approach as OpenCode / Grok Build)

---

## Project layout

```text
src/
  account/     # store · oauth · token · billing · router
  client/      # xAI proxy
  server/      # Hono routes
  web/         # admin UI
  proxy.ts     # outbound HTTP proxy bootstrap
docs/
  screenshots/ # dashboard captures
data/          # runtime state (gitignored)
```

---

## Scripts

```bash
npm run dev        # tsx watch
npm start          # production entry
npm run typecheck  # tsc --noEmit
npm run build      # emit dist/
```

---

## Disclaimer

- Unofficial. Not affiliated with xAI.
- Relies on SuperGrok / xAI OAuth surfaces that may change.
- Respect xAI Terms of Service and rate limits.
- Use at your own risk; keep credentials private.

---

## License

[MIT](LICENSE)

---

<p align="center">
  <sub>Built for people who run too many agents on too few weekly credits.</sub>
</p>
