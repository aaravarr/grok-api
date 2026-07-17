# Grok-API SSO Contribute 扩展 (v2)

右上角粘贴 SSO JWT → 写入 `sso` / `sso-rw` →（可选）向 **grok-api** 申请 OAuth device code、打开授权页并轮询，直到席位绑定到你的账号。

## 下载（GitHub Release）

发版后可从仓库 Releases 下载：

`grok-api-sso-extension-vX.Y.Z.zip`

解压后按下方步骤「加载已解压的扩展程序」。

本地打包：

```bash
npm run pack:sso-extension
```

CI：推送标签 `sso-extension-v*` 或发布 GitHub Release 时，workflow `release-sso-extension` 会自动打 zip 并挂到 Release 产物。

## 安装 / 更新

1. `chrome://extensions` / `edge://extensions`
2. 开发者模式 → **加载已解压的扩展程序** → 选 `tools/sso-extension`
3. 改代码后点扩展卡片 **重新加载**（版本应为 **2.1.0**）

## 首次配置

1. 点扩展图标，在弹窗内直接配置 grok-api 连接与白名单
2. 填写：
   - **Base URL**：`http://127.0.0.1:8787`
   - **推荐**：绑定了用户的 API Key（`gk_...`）
     或控制台登录后的 session token
     或用户名+密码（会登录换 token）
3. **测试连接** → 保存

> API Key 必须绑定到用户，才能调用 `/api/me/accounts/oauth`。

默认白名单含 `x.ai` / `grok.com` / `pay.ldxp.cn`（支付/门户页也会显示 SSO）。

## 使用（贡献闭环）

1. 打开 grok.com / accounts.x.ai，点右上角 **SSO**（或 `Ctrl+Shift+L`）
2. 粘贴 SSO JWT
3. 勾选 **写入 Cookie 并贡献到 grok-api**
4. 点 **开始**
5. 扩展会：
   - 写 Cookie
   - `POST /api/me/accounts/oauth`
   - 打开 `verificationUriComplete`
   - 轮询 `/api/me/accounts/oauth/poll` 直到完成或超时

仅想登录官网时：取消勾选贡献，走「仅 Cookie」模式。

## 权限

- `cookies`：写 `.x.ai` / `.grok.com` 会话 Cookie
- `storage`：保存 grok-api 配置
- `tabs`：打开授权页
- 主机：面板注入 + 访问你的 grok-api 与 xAI 域

## 安全说明

- SSO JWT / 密码仅存本机扩展存储，默认不上传除 grok-api 外的服务器
- 贡献请求只打你配置的 Base URL
- 不要在不可信电脑上保存密码；优先用绑定用户的 API Key

