<p align="center">
  <img src="docs/screenshots/logo.svg" width="64" height="64" alt="Grok API" />
</p>

<h1 align="center">Grok API</h1>

<p align="center">
  <strong>SuperGrok 账号池 · 额度感知路由 · OpenAI 兼容代理 · Imagine 媒体 · 远程 MCP</strong><br />
  把多个 SuperGrok OAuth 会话汇成一个本地入口，统一提供对话、图片、视频与 Agent 接入。
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

## 功能

- **多账号 SuperGrok OAuth** — Device Code 登录、过期账号重新授权、CPA/Sub2API JSON 录入
- **额度感知路由** — 自动 / 手动模式、账号粘滞、用尽后切换
- **OpenAI 兼容代理** — `/v1/chat/completions`、`/v1/responses`、实时 `/v1/models`
- **Imagine 媒体接口** — 图片生成/编辑，视频生成/编辑/续写/状态查询
- **Media Studio 控制台** — 在线生成图片视频、流式 AI 润色提示词、MCP 配置面板
- **远程 MCP** — `/mcp` Streamable HTTP，Bearer API Key 即可接入，无需本地拉代码
- **多用户控制台** — 账号、密钥、用量、服务端日志搜索、贡献/排行榜
- **工程细节** — 出站代理自动探测、请求日志、异步视频任务 `request_id → account` 粘性映射

---

## 快速开始

```bash
git clone https://github.com/aaravarr/grok-api.git
cd grok-api
npm install
npm run dev
```

打开 **http://127.0.0.1:8787**

1. 完成初始化 / 登录
2. 添加 SuperGrok 账号（OAuth 或 CPA JSON）
3. 创建 API Key
4. 调用代理，或接入 MCP

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

## 控制台

| 路由 | 用途 |
|------|------|
| `/overview` | 总览与快捷入口 |
| `/accounts` | SuperGrok 账号、OAuth / CPA 导入、重新授权 |
| `/keys` | API Key（完整明文可回看时支持查看/复制） |
| `/media` | Media Studio + MCP 配置 |
| `/usage` | 用量分析 |
| `/logs` | 服务端可搜索请求日志 |
| `/contribute` | 贡献账号到公共池 |
| `/settings` | 上游 / 代理 / 日志策略 |

设计规范见 [`DESIGN.md`](DESIGN.md)，贡献说明见 [`AGENTS.md`](AGENTS.md)。

---

## 代理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/chat/completions` | 对话 |
| `POST` | `/v1/responses` | Responses 兼容入口 |
| `GET` | `/v1/models` | 实时上游模型 |
| `POST` | `/v1/images/generations` | 文生图 |
| `POST` | `/v1/images/edits` | 图编辑 |
| `POST` | `/v1/videos/generations` | 文/图生视频（异步） |
| `POST` | `/v1/videos/edits` | 视频编辑（异步） |
| `POST` | `/v1/videos/extensions` | 视频续写（异步） |
| `GET` | `/v1/videos/:requestId` | 视频状态 |
| `ALL` | `/mcp` | 远程 MCP |
| `GET` | `/health` | 健康检查 |

可选请求头：`x-account-id` 固定池内账号。

### 视频说明

- `grok-imagine-video` 支持文生视频与图生视频
- `grok-imagine-video-1.5` 仅支持图生视频
- 异步视频任务会尽量粘住创建时的账号（`request_id → account`）
- 媒体流量消耗 SuperGrok 额度

---

## MCP

推荐远程配置：

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

工具覆盖图片/视频生成、编辑、续写与状态轮询。  
完整说明见 [`MCP.md`](MCP.md)

---

## 路由逻辑

```text
请求 → API Key 鉴权 → 选择账号
  手动：固定账号
  自动：当前可用则用，否则下一个
→ 检查该账号额度
→ 注入 OAuth token → api.x.ai
→ exhausted / retryable → 标记并轮转（自动模式）
```

异步视频状态查询时，服务端会尽量复用创建 `request_id` 时的账号。

---

## 配置

| 变量 | 默认 | 说明 |
|------|------|------|
| `PORT` | `8787` | 端口 |
| `HOST` | `127.0.0.1` | 监听地址 |
| `DATA_DIR` | `./data` | 运行时数据目录 |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | 推理上游 |
| `HTTPS_PROXY` / `HTTP_PROXY` | 自动 | 可选出站代理；否则读系统代理 / 设置页 |
| `ADMIN_TOKEN` | 空 | 可选，紧急保护 `/api/admin/*` |

本地状态保存在 `data/`（`accounts.json`、`users.json`、日志、视频任务映射）。勿提交密钥。

### API Key

| 项目 | 行为 |
|------|------|
| 新密钥 | 可保存完整明文，便于回看、Media Studio、MCP 配置 |
| 旧密钥 | 仅 hash/前缀 → 需粘贴完整密钥，或新建密钥 |
| 鉴权方式 | `/v1/*` 与 `/mcp` 使用 `Authorization: Bearer gk_...` |

---

## 开发

```bash
npm run dev        # 热更新
npm run start      # 普通本地启动
npm run typecheck  # tsc --noEmit
npm run build      # 编译
```

如果不是 watch 模式，改完代码后请重启本地服务。

---

## 声明

非官方项目，与 xAI 无关。请遵守服务条款，凭证仅保存在本地。

## 许可证

[MIT](LICENSE)
