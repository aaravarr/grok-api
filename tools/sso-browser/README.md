# SSO 临时浏览器

粘贴 xAI / Grok 的 **SSO JWT**（或整行 `邮箱|密码|sso|时间`），用本机 **Chrome / Edge** 开一个**临时窗口**。

- 真实浏览器内核（channel = chrome / msedge）
- **不持久化**：内存上下文，关掉窗口即结束并清理
- 适合频繁换号，每次重新粘贴 SSO

## 使用

```bash
cd tools/sso-browser
npm install
npm start
```

按提示粘贴 SSO 后回车。也可：

```bash
node open.mjs "eyJ..." 
node open.mjs "email|pass|eyJ...|2026-07-16"
node open.mjs --url https://accounts.x.ai
node open.mjs --browser edge
```

环境变量：

| 变量 | 说明 |
|------|------|
| `SSO_BROWSER` | `chrome`（默认）或 `edge` |
| `SSO_URL` | 打开地址，默认 `https://grok.com` |
| `SSO_COOKIE_NAME` | Cookie 名，默认尝试多个常见名 |

## 说明

SSO 只是**网页登录态**，不能当 grok-api 的 `refresh_token` 用。  
Cookie 名/域若与 xAI 前端变更不一致，页面可能仍显示未登录——用 DevTools Application → Cookies 看实际名，再用 `--cookie=名字` 指定。
