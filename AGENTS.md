# Repository Guidelines

## Project Structure & Module Organization

TypeScript monorepo for a SuperGrok OAuth account pool and OpenAI-compatible proxy.

- `src/server/` — Hono app, `/v1` and admin/console APIs
- `src/account/` — OAuth seats, routing, billing, video job stickiness
- `src/client/` — Upstream xAI proxy helpers
- `src/mcp/` — Remote Streamable HTTP MCP (`/mcp`) and optional stdio bridge
- `src/web/` — Native JS console UI (HTML/CSS/JS string modules)
- `src/usage/` — Request logs, token capture, analytics
- `src/auth/` — Users/sessions/API keys
- `data/` — Local runtime state (`accounts.json`, `users.json`, `logs/`, `video-jobs.json`); do not commit secrets
- `docs/`, `MCP.md`, `README.md` — Product and MCP docs
- `DESIGN.md` — Console UI design system (Vercel-inspired tokens, type, components)
- `vercel/` — Experimental deploy assets; omit unless explicitly requested

## Build, Test, and Development Commands

```bash
npm install
npm run dev          # hot reload on http://127.0.0.1:8787
npm run start        # production-style local server
npm run typecheck    # tsc --noEmit
npm run build        # compile TypeScript
npm run mcp          # optional local stdio MCP bridge
```

After local code changes that affect the running server, restart `npm run start` (or keep `npm run dev` watching). Prefer verifying against `/health`, `/media`, and `/mcp`.

## Coding Style & Naming Conventions

- TypeScript ESM (`"type": "module"`), 2-space indent, ASCII by default
- Prefer existing helpers over new abstractions (`proxyUpstream`, account store, usage logger)
- Files: kebab-ish module names (`video-jobs.ts`, `media-assets.ts`); exported functions camelCase
- Frontend is large string-built HTML/JS in `src/web/*`; keep patches small to avoid Windows command-length issues
- UI work should follow `DESIGN.md` tokens and patterns (ink/body/mute, hairline borders, restrained radius, product-console density)
- No dedicated linter config; run `npm run typecheck` before shipping

## Testing Guidelines

No formal unit/e2e suite yet. Validate with:

1. `npm run typecheck`
2. Manual smoke: chat/completions, media generate/status, MCP tools, logs page
3. Multi-account video flows must keep sticky `request_id -> account` mapping

If adding tests later, colocate near the module and name `*.test.ts`.

## Commit & Pull Request Guidelines

History uses short Conventional Commits:

- `feat: ...` / `fix: ...` / `docs: ...`

PRs should include:

- What changed and why
- Manual verification steps / screenshots for UI
- Note any data-format or MCP contract changes
- Exclude `node_modules/`, `data/*` secrets, and unsolicited `vercel/`

## Security & Configuration Tips

- Runtime config lives under `data/` and env (`PORT`, `HOST`, `XAI_BASE_URL`, `DATA_DIR`)
- Never log full API key secrets; media keys may store plaintext for redisplay by design
- MCP remote config is preferred: URL `http://127.0.0.1:8787/mcp` + `Authorization: Bearer gk_...`

## Agent-Specific Instructions

- Reply to users in Chinese unless they ask otherwise
- Keep product console UX polished; avoid demo-looking layouts
- For visual/UI changes, read `DESIGN.md` first and match existing `src/web/styles.ts` tokens
- Prefer remote MCP over cwd/npx-required client flows in UI/docs
