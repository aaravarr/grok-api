<p align="center">
  <img src="docs/screenshots/logo.svg" width="64" height="64" alt="Grok API" />
</p>

<h1 align="center">Grok API</h1>

<p align="center">
  <strong>SuperGrok account pool · credit-aware routing · OpenAI-compatible proxy</strong><br />
  Turn multiple SuperGrok OAuth sessions into one local API endpoint.
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README_CN.md">简体中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stack-TypeScript%20%2B%20Hono-0070f3?style=flat-square" alt="stack" />
  <img src="https://img.shields.io/badge/API-OpenAI%20compatible-black?style=flat-square" alt="api" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
</p>

---

## Screenshots

| Accounts & credits | API keys | Device Code login |
|:---:|:---:|:---:|
| <img src="docs/screenshots/accounts.png" alt="Accounts" /> | <img src="docs/screenshots/api-keys.png" alt="API Keys" /> | <img src="docs/screenshots/oauth.png" alt="OAuth" /> |

---

## Features

- **Multi-account SuperGrok OAuth** — Device Code login (no fragile loopback)
- **Credit-aware routing** — live weekly usage %; only the **current** account is probed
- **Auto / Manual modes** — failover when exhausted, or pin an account
- **API keys** — alias, expiry, one-time reveal, SHA-256 at rest
- **OpenAI-compatible proxy** — `/v1/chat/completions`, `/v1/responses`, live `/v1/models`
- **Vercel-style admin UI** — CN/EN switch, copy-ready cURL panel
- **Outbound proxy auto-detect** — `HTTPS_PROXY` / env, or Windows system proxy (never hard-coded)

---

## Quick Start

```bash
git clone https://github.com/aaravarr/grok-api.git
cd grok-api
npm install
npm run dev
```

Open **http://127.0.0.1:8787**

1. **Add account** → complete Device Code in the browser  
2. **Create API key** (optional until you create one, `/v1` is open)  
3. Call the proxy:

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

## How routing works

```text
request → (API key if any) → pick account
  Manual: fixed current
  Auto:   current if healthy, else next
→ credit-check THAT account only (60s cache)
→ Bearer OAuth token → api.x.ai
→ 429/402 → mark exhausted → next (Auto)
```

`/v1/models` is **fetched live** from xAI with the current account token (not a static list).

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8787` | Listen port |
| `HOST` | `127.0.0.1` | Bind address |
| `ADMIN_TOKEN` | _(empty)_ | If set, protects `/api/admin/*` (admin UI field). **Not** the `/v1` API key. |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | Inference upstream |
| `HTTPS_PROXY` / `HTTP_PROXY` | auto | Optional; else Windows system proxy is read |

Data: `data/accounts.json` (gitignored). Do not commit tokens.

### Admin token vs API key

| | Admin token | API key (`gk_…`) |
|--|-------------|------------------|
| Purpose | Protect management UI/API | Call `/v1/*` |
| When needed | Only if `ADMIN_TOKEN` is set | After you create any key |
| Where | Env + optional UI field | `Authorization: Bearer` on proxy |

---

## Proxy API

| Method | Path |
|--------|------|
| `POST` | `/v1/chat/completions` |
| `POST` | `/v1/responses` |
| `GET` | `/v1/models` (live) |
| `GET` | `/health` |

Optional header: `x-account-id` to force an upstream account.

---

## Disclaimer

Unofficial · not affiliated with xAI · respect their ToS · credentials stay local.

## License

[MIT](LICENSE)
