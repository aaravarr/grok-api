import { styles } from "./styles.js";

export type AuthMode = "login" | "register" | "setup";

export function authPageHtml(mode: AuthMode): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Grok API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
${styles()}
  </style>
</head>
<body>
  <div class="auth-gate" id="authGate">
    <div class="auth-card" id="authCard">
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div class="seg" id="langSeg">
          <button type="button" data-lang="zh">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
      </div>
      <h1 id="authTitle">Setup</h1>
      <div class="sub" id="authSub"></div>
      <div class="auth-msg" id="authMsg"></div>
      <div class="field"><label data-i18n="authUser">Username</label><input id="authUser" class="input" autocomplete="username" /></div>
      <div class="field"><label data-i18n="authPass">Password</label><input id="authPass" class="input" type="password" autocomplete="current-password" /></div>
      <div class="field" id="authPass2Wrap" style="display:none"><label data-i18n="authPass2">Confirm password</label><input id="authPass2" class="input" type="password" autocomplete="new-password" /></div>
      <div class="actions">
        <button class="btn" type="button" id="authSubmit" data-i18n="authSubmit">Continue</button>
      </div>
      <div class="switch" id="authSwitch"></div>
    </div>
  </div>

  <script>
    const AUTH_MODE = ${JSON.stringify(mode)};
    const I18N = {
      zh: {
        authUser:"用户名", authPass:"密码", authPass2:"确认密码", authSubmit:"继续",
        authSetupTitle:"初始化管理员", authSetupSub:"首次使用，请创建管理员账号。账号池与代理仅管理员可配置。",
        authLoginTitle:"登录", authLoginSub:"使用你的账号登录管理控制台。",
        authRegTitle:"注册", authRegSub:"创建普通用户账号，可管理自己的密钥、日志与用量。",
        authToReg:"没有账号？注册", authToLogin:"已有账号？登录",
        authPassMismatch:"两次密码不一致",
      },
      en: {
        authUser:"Username", authPass:"Password", authPass2:"Confirm password", authSubmit:"Continue",
        authSetupTitle:"Create admin", authSetupSub:"First run: create the admin account. Account pool & proxy are admin-only.",
        authLoginTitle:"Sign in", authLoginSub:"Sign in to the control panel.",
        authRegTitle:"Register", authRegSub:"Create a user account to manage your own API keys, logs and usage.",
        authToReg:"No account? Register", authToLogin:"Have an account? Sign in",
        authPassMismatch:"Passwords do not match",
      }
    };
    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let meta = { needsSetup: false, allowRegister: true };
    const $ = (id) => document.getElementById(id);
    const t = (k) => I18N[lang][k] ?? k;
    function esc(s) {
      return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    function applyI18n() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      paintAuth();
    }
    function paintAuth() {
      const titles = { setup: "authSetupTitle", login: "authLoginTitle", register: "authRegTitle" };
      const subs = { setup: "authSetupSub", login: "authLoginSub", register: "authRegSub" };
      $("authTitle").textContent = t(titles[AUTH_MODE] || "authLoginTitle");
      $("authSub").textContent = t(subs[AUTH_MODE] || "authLoginSub");
      $("authPass2Wrap").style.display = AUTH_MODE === "setup" || AUTH_MODE === "register" ? "block" : "none";
      $("authPass").autocomplete = AUTH_MODE === "login" ? "current-password" : "new-password";
      let sw = "";
      if (AUTH_MODE === "login" && meta.allowRegister) sw = '<a href="/register">' + esc(t("authToReg")) + "</a>";
      if (AUTH_MODE === "register") sw = '<a href="/login">' + esc(t("authToLogin")) + "</a>";
      $("authSwitch").innerHTML = sw;
      $("authMsg").className = "auth-msg";
    }
    function showAuthMsg(text, type) {
      $("authMsg").textContent = text;
      $("authMsg").className = "auth-msg show" + (type ? " " + type : "");
    }
    async function submitAuth() {
      const username = $("authUser").value.trim();
      const password = $("authPass").value;
      if (AUTH_MODE === "setup" || AUTH_MODE === "register") {
        if (password !== $("authPass2").value) return showAuthMsg(t("authPassMismatch"), "err");
      }
      const path = AUTH_MODE === "setup" ? "/api/auth/setup" : AUTH_MODE === "register" ? "/api/auth/register" : "/api/auth/login";
      try {
        const res = await fetch(path, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        localStorage.setItem("grok_api_session", data.token);
        location.href = "/overview";
      } catch (e) {
        showAuthMsg(e.message, "err");
      }
    }
    $("langSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      lang = b.dataset.lang;
      localStorage.setItem("grok_api_lang", lang);
      applyI18n();
    });
    $("authSubmit").onclick = submitAuth;
    $("authPass").addEventListener("keydown", (e) => { if (e.key === "Enter") submitAuth(); });
    $("authPass2").addEventListener("keydown", (e) => { if (e.key === "Enter") submitAuth(); });
    (async function boot() {
      try {
        const res = await fetch("/api/meta");
        meta = await res.json();
      } catch {}
      // route guards
      if (meta.needsSetup && AUTH_MODE !== "setup") { location.href = "/setup"; return; }
      if (!meta.needsSetup && AUTH_MODE === "setup") { location.href = "/login"; return; }
      if (AUTH_MODE === "register" && !meta.allowRegister) { location.href = "/login"; return; }
      // already logged in → console
      const token = localStorage.getItem("grok_api_session") || "";
      if (token && AUTH_MODE !== "setup") {
        try {
          const me = await fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } });
          if (me.ok) { location.href = "/overview"; return; }
        } catch {}
      }
      applyI18n();
    })();
  </script>
</body>
</html>`;
}
