# xAI SSO 浏览器扩展

右上角粘贴 SSO JWT → 写入 `sso` + `sso-rw`（HttpOnly domain cookie）→ 打开 grok.com。

## 为什么之前「没效果」

1. 旧版确认后跳到 `accounts.x.ai/sign-in`，登录页会一直显示表单，看起来像没登录。
2. 同时写了 host-only（`accounts.x.ai`）和域名 cookie（`.x.ai`），可能互相覆盖。
3. 改代码后必须在 `chrome://extensions` **重新加载** 扩展，否则仍跑旧逻辑。

## 显示范围

扩展弹窗可配置：

| 模式 | 行为 |
|------|------|
| **仅白名单**（默认） | 只在白名单域名显示右上角 SSO（默认含 x.ai / grok.com） |
| **任意网站** | 所有网页右上角都显示 |

白名单支持子域：`x.ai` 会匹配 `accounts.x.ai`。

> Cookie **始终**写入 `.x.ai` / `.grok.com`，与面板出现在哪个站无关。

## 安装 / 更新

1. `chrome://extensions` / `edge://extensions`
2. 开发者模式 → **加载已解压的扩展程序** → 选 `tools/sso-extension`
3. 以后改代码：点扩展卡片上的 **重新加载**（版本应变为 1.3.0）

## 使用

1. 打开 grok.com 或 accounts.x.ai，点右上角 **SSO**（或 `Ctrl+Shift+L`）
2. 粘贴完整 JWT / 整行 `邮箱|密码|eyJ...|时间`
3. **确认写入** → 默认跳转 `https://grok.com/`
4. 若仍像未登录：勾选「仅写入不跳转」，点确认，再点 **诊断**，F12 → Application → Cookies 看 `sso` / `sso-rw` 是否存在且值等于 JWT

## 权限

- `cookies`：写入会话 Cookie  
- 主机访问：面板注入；Cookie 仅写 x.ai / grok 域
