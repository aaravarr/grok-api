export function adminHtml(): string {
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
    :root {
      --ink:#171717;--body:#4d4d4d;--mute:#888;--hairline:#ebebeb;--hairline-strong:#a1a1a1;
      --canvas:#fff;--canvas-soft:#fafafa;--canvas-soft-2:#f5f5f5;--link:#0070f3;--link-deep:#0761d1;
      --link-bg:#d3e5ff;--success:#0a7a3e;--success-bg:#e5f6ec;--error:#ee0000;--error-bg:#f7d4d6;
      --warn:#ab570a;--warn-bg:#ffefcf;--violet:#7928ca;--violet-bg:#f3e8ff;
      --radius:8px;--radius-lg:12px;--shadow:0 0 0 1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
      --font:"Geist",Inter,system-ui,-apple-system,sans-serif;
      --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
    }
    *{box-sizing:border-box} html,body{margin:0;padding:0}
    body{font-family:var(--font);color:var(--ink);background:var(--canvas);font-size:14px;line-height:20px;letter-spacing:-.28px;min-height:100dvh}
    button,input,select,textarea{font:inherit} button{cursor:pointer}
    a{color:var(--link);text-decoration:none} a:hover{color:var(--link-deep)}
    .shell{min-height:100dvh;display:flex;flex-direction:column}
    .topbar{height:64px;border-bottom:1px solid var(--hairline);display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(255,255,255,.85);backdrop-filter:saturate(180%) blur(12px);position:sticky;top:0;z-index:40}
    .brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.4px}
    .brand-mark{width:22px;height:22px;border-radius:6px;background:var(--ink);display:grid;place-items:center}
    .top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .main{width:min(1120px,100%);margin:0 auto;padding:32px 24px 80px}
    .hero{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:28px;flex-wrap:wrap}
    .hero h1{margin:0;font-size:32px;line-height:40px;font-weight:600;letter-spacing:-1.28px}
    .hero p{margin:8px 0 0;color:var(--body);max-width:56ch}
    .stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:24px}
    .stat{border:1px solid var(--hairline);border-radius:var(--radius-lg);padding:14px 16px;background:var(--canvas)}
    .stat .n{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.96px}
    .stat .l{color:var(--mute);font-size:12px;margin-top:2px}
    .tabs{display:flex;gap:4px;border-bottom:1px solid var(--hairline);margin-bottom:20px}
    .tab{border:0;background:transparent;color:var(--mute);padding:10px 14px;border-bottom:2px solid transparent;font-weight:500;margin-bottom:-1px;transition:color .15s,border-color .15s}
    .tab:hover{color:var(--ink)}.tab.active{color:var(--ink);border-bottom-color:var(--ink)}
    .panel{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:var(--canvas);box-shadow:var(--shadow);overflow:hidden}
    .panel-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft)}
    .panel-hd .spacer{flex:1}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:6px;border:1px solid var(--ink);background:var(--ink);color:#fff;font-weight:500;font-size:14px;transition:background .15s,opacity .15s}
    .btn:hover{background:#000}.btn:disabled{opacity:.45;cursor:not-allowed}.btn:active{transform:translateY(1px)}
    .btn-secondary{background:var(--canvas);color:var(--ink);border-color:var(--hairline)}
    .btn-secondary:hover{background:var(--canvas-soft-2);border-color:var(--hairline-strong)}
    .btn-danger{background:var(--canvas);color:var(--error);border-color:#f3b0b0}
    .btn-danger:hover{background:var(--error-bg)}.btn-sm{height:28px;padding:0 10px;font-size:12px}
    .input{height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--hairline);background:var(--canvas);color:var(--ink);min-width:140px;outline:none;transition:border-color .15s,box-shadow .15s}
    .input:focus{border-color:var(--ink);box-shadow:0 0 0 2px rgba(23,23,23,.08)}
    .input::placeholder{color:var(--mute)}
    .msg{display:none;margin:12px 16px 0;padding:10px 12px;border-radius:8px;border:1px solid var(--hairline);background:var(--canvas-soft);color:var(--body);white-space:pre-wrap;word-break:break-word;font-size:13px}
    .msg.show{display:block}.msg.ok{background:var(--success-bg);border-color:#b7e4c7;color:var(--success)}.msg.err{background:var(--error-bg);border-color:#f0b8bb;color:var(--error)}
    .codebox{display:none;margin:12px 16px 0;padding:16px;border-radius:8px;border:1px dashed var(--hairline-strong);background:var(--canvas-soft)}
    .codebox.show{display:block}.codebox .label{color:var(--mute);font-size:12px;margin-bottom:8px}
    .codebox .code{font-family:var(--mono);font-size:28px;font-weight:500;letter-spacing:.14em;color:var(--ink)}
    table{width:100%;border-collapse:collapse}
    th,td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--hairline);vertical-align:top;font-size:13px}
    th{color:var(--mute);font-weight:500;font-size:12px;background:var(--canvas)}
    tr:last-child td{border-bottom:0}
    tr.current{background:linear-gradient(90deg,#f0f7ff 0%,#fff 55%);box-shadow:inset 3px 0 0 var(--link)}
    .badge{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font-size:12px;font-weight:500;background:var(--canvas-soft-2);color:var(--body);border:1px solid var(--hairline)}
    .badge.active{background:var(--success-bg);color:var(--success);border-color:#b7e4c7}
    .badge.exhausted{background:var(--violet-bg);color:var(--violet);border-color:#d8ccf1}
    .badge.expired,.badge.error{background:var(--error-bg);color:var(--error);border-color:#f0b8bb}
    .badge.current{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .mono{font-family:var(--mono);font-size:12px;color:var(--mute)}.name{font-weight:500;color:var(--ink)}
    .actions{display:flex;flex-wrap:wrap;gap:6px}
    .meter{height:6px;border-radius:99px;background:var(--canvas-soft-2);overflow:hidden;border:1px solid var(--hairline);width:100%;max-width:120px}
    .meter>i{display:block;height:100%;background:var(--link);transition:width .25s}
    .meter.warn>i{background:var(--warn)}.meter.bad>i{background:var(--error)}
    .credit-txt{font-family:var(--mono);font-size:12px;color:var(--body);margin-top:4px}
    .routing-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--hairline);background:#fff}
    .seg{display:inline-flex;border:1px solid var(--hairline);border-radius:8px;overflow:hidden}
    .seg button{border:0;background:transparent;height:30px;padding:0 12px;color:var(--body);font-weight:500}
    .seg button.on{background:var(--ink);color:#fff}
    .empty{padding:48px 16px;text-align:center;color:var(--mute)}
    .view{display:none}.view.active{display:block}
    .hint{font-size:12px;color:var(--mute);max-width:280px}
    .admin-wrap{display:none;align-items:center;gap:8px}
    .admin-wrap.show{display:flex}
    .curl-grid{display:grid;gap:12px;padding:16px}
    .curl-card{border:1px solid var(--hairline);border-radius:10px;overflow:hidden;background:var(--canvas-soft)}
    .curl-card-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--hairline);background:#fff}
    .curl-card-hd strong{font-size:13px;font-weight:500}
    .curl-pre{margin:0;padding:14px;font-family:var(--mono);font-size:12px;line-height:1.55;color:var(--ink);overflow-x:auto;white-space:pre-wrap;word-break:break-all}
    .meta-line{margin-top:12px;padding:10px 12px;border:1px solid var(--hairline);border-radius:8px;background:var(--canvas-soft);font-size:12px;color:var(--body)}
    .meta-line code{font-family:var(--mono);font-size:11px;background:#fff;border:1px solid var(--hairline);border-radius:4px;padding:1px 5px}
    .lang-seg .on{background:var(--ink);color:#fff}
    .modal-mask{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:50;align-items:center;justify-content:center;padding:20px}
    .modal-mask.show{display:flex}
    .modal{width:min(440px,100%);background:#fff;border-radius:12px;border:1px solid var(--hairline);box-shadow:0 16px 48px rgba(0,0,0,.12);padding:20px}
    .modal h3{margin:0 0 6px;font-size:18px;letter-spacing:-.4px}
    .modal p{margin:0 0 14px;color:var(--body);font-size:13px}
    .modal .field{margin-bottom:12px}
    .modal label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
    .modal .row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
    .secret{font-family:var(--mono);font-size:12px;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:8px;padding:10px}
    @media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}.main{padding:20px 16px 64px}.hero h1{font-size:24px;line-height:32px}table{display:block;overflow-x:auto}}
    @media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 13H1.5L8 1Z" fill="white"/></svg>
        </div>
        <span>Grok API</span>
      </div>
      <div class="top-actions">
        <div class="seg lang-seg" id="langSeg">
          <button type="button" data-lang="zh">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <div class="admin-wrap" id="adminWrap" title="">
          <input id="adminToken" class="input" type="password" data-i18n-placeholder="adminPh" style="min-width:130px" />
        </div>
        <button class="btn btn-secondary btn-sm" id="btnRefresh" type="button" data-i18n="refresh">Refresh</button>
      </div>
    </header>

    <main class="main">
      <div class="hero">
        <div>
          <h1 data-i18n="title">Account Pool</h1>
          <p data-i18n="subtitle">SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.</p>
        </div>
      </div>

      <div class="stats" id="stats">
        <div class="stat"><div class="n" id="sTotal">–</div><div class="l" data-i18n="statAccounts">Accounts</div></div>
        <div class="stat"><div class="n" id="sActive">–</div><div class="l" data-i18n="statActive">Active</div></div>
        <div class="stat"><div class="n" id="sExhausted">–</div><div class="l" data-i18n="statExhausted">Exhausted</div></div>
        <div class="stat"><div class="n" id="sExpired">–</div><div class="l" data-i18n="statExpired">Expired</div></div>
        <div class="stat"><div class="n" id="sKeys">–</div><div class="l" data-i18n="statKeys">API Keys</div></div>
      </div>

      <div class="tabs" role="tablist">
        <button class="tab active" data-tab="accounts" type="button" data-i18n="tabAccounts">Accounts</button>
        <button class="tab" data-tab="keys" type="button" data-i18n="tabKeys">API Keys</button>
        <button class="tab" data-tab="quickstart" type="button" data-i18n="tabQuick">Quick start</button>
      </div>

      <section class="view active" id="view-accounts">
        <div class="panel">
          <div class="routing-bar">
            <span class="mono" data-i18n="routing">Routing</span>
            <div class="seg" id="modeSeg">
              <button type="button" data-mode="auto" class="on" data-i18n="modeAuto">Auto</button>
              <button type="button" data-mode="manual" data-i18n="modeManual">Manual</button>
            </div>
            <span class="mono" id="currentLabel">Current: –</span>
            <div class="spacer" style="flex:1"></div>
            <input id="accName" class="input" data-i18n-placeholder="accNamePh" />
            <button class="btn" id="btnAdd" type="button" data-i18n="addAccount">Add account</button>
          </div>
          <div id="codeBox" class="codebox">
            <div class="label" data-i18n="deviceHint">Open the verification page and enter this Device Code:</div>
            <div class="code" id="userCode">––––</div>
            <div class="label" style="margin-top:12px"><span data-i18n="verifyUrl">URL</span>：<a id="verifyLink" href="#" target="_blank" rel="noreferrer">–</a></div>
            <div class="label" style="margin-top:8px" id="pollStatus"></div>
          </div>
          <div id="msg" class="msg"></div>
          <div style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th data-i18n="colAccount">Account</th>
                  <th data-i18n="colStatus">Status</th>
                  <th data-i18n="colCredits">Credits</th>
                  <th data-i18n="colUses">Uses</th>
                  <th data-i18n="colLastUsed">Last used</th>
                  <th data-i18n="colActions">Actions</th>
                </tr>
              </thead>
              <tbody id="tbody"><tr><td colspan="6" class="empty">…</td></tr></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="view" id="view-keys">
        <div class="panel">
          <div class="panel-hd">
            <strong data-i18n="keysTitle">API Keys</strong>
            <span class="mono" data-i18n="keysHint">Bearer for /v1/*</span>
            <div class="spacer"></div>
            <button class="btn" id="btnCreateKey" type="button" data-i18n="createKey">Create key</button>
          </div>
          <div id="msgKeys" class="msg"></div>
          <div style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th data-i18n="colAlias">Alias</th>
                  <th data-i18n="colKey">Key</th>
                  <th data-i18n="colStatus">Status</th>
                  <th data-i18n="colExpires">Expires</th>
                  <th data-i18n="colUses">Uses</th>
                  <th data-i18n="colActions">Actions</th>
                </tr>
              </thead>
              <tbody id="tbodyKeys"><tr><td colspan="6" class="empty">…</td></tr></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="view" id="view-quickstart">
        <div class="panel">
          <div class="panel-hd">
            <strong data-i18n="quickTitle">Quick cURL</strong>
            <span class="mono" data-i18n="quickHint">Copy-ready examples for your local proxy</span>
            <div class="spacer"></div>
            <input id="curlKey" class="input" data-i18n-placeholder="curlKeyPh" style="min-width:200px" />
          </div>
          <div class="curl-grid">
            <div class="curl-card">
              <div class="curl-card-hd">
                <strong>POST /v1/chat/completions</strong>
                <button class="btn btn-secondary btn-sm" type="button" data-copy="curlChat" data-i18n="copy">Copy</button>
              </div>
              <pre class="curl-pre" id="curlChat"></pre>
            </div>
            <div class="curl-card">
              <div class="curl-card-hd">
                <strong>POST /v1/responses</strong>
                <button class="btn btn-secondary btn-sm" type="button" data-copy="curlResp" data-i18n="copy">Copy</button>
              </div>
              <pre class="curl-pre" id="curlResp"></pre>
            </div>
            <div class="curl-card">
              <div class="curl-card-hd">
                <strong>GET /v1/models</strong>
                <button class="btn btn-secondary btn-sm" type="button" data-copy="curlModels" data-i18n="copy">Copy</button>
              </div>
              <pre class="curl-pre" id="curlModels"></pre>
            </div>
            <div class="meta-line" id="metaLine"></div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div class="modal-mask" id="keyModal">
    <div class="modal" role="dialog" aria-modal="true">
      <h3 id="keyModalTitle" data-i18n="createKey">Create API Key</h3>
      <p id="keyModalDesc" data-i18n="keyOnce">The full key is shown only once. Copy it now.</p>
      <div id="keyForm">
        <div class="field"><label for="keyAlias" data-i18n="colAlias">Alias</label><input id="keyAlias" class="input" style="width:100%" placeholder="production" /></div>
        <div class="field"><label for="keyDays" data-i18n="validDays">Valid days (empty = never)</label><input id="keyDays" class="input" style="width:100%" type="number" min="1" placeholder="30" /></div>
        <div class="field"><label for="keyNote" data-i18n="note">Note</label><input id="keyNote" class="input" style="width:100%" /></div>
      </div>
      <div id="keyReveal" style="display:none"><div class="secret" id="keySecret"></div></div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="keyCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="keySubmit" data-i18n="create">Create</button>
      </div>
    </div>
  </div>

  <script>
    const I18N = {
      zh: {
        title: "账号池",
        subtitle: "SuperGrok OAuth 多账号 · 额度感知轮询 · OpenAI 兼容代理。当前账号高亮，余额只查当前号。",
        refresh: "刷新",
        adminPh: "管理口令 ADMIN_TOKEN",
        adminTip: "仅当服务端设置了 ADMIN_TOKEN 时需要填写，用于保护 /api/admin/* 管理接口，与调用 /v1 的 API Key 无关。",
        statAccounts: "账号", statActive: "可用", statExhausted: "已耗尽", statExpired: "已过期", statKeys: "API Key",
        tabAccounts: "账号", tabKeys: "API Keys", tabQuick: "快速调用",
        routing: "路由", modeAuto: "自动", modeManual: "手动",
        accNamePh: "账号备注（可选）", addAccount: "添加账号",
        deviceHint: "在浏览器打开验证页，输入以下 Device Code：",
        verifyUrl: "验证地址", waiting: "等待授权…",
        colAccount: "账号", colStatus: "状态", colCredits: "额度", colUses: "调用", colLastUsed: "上次使用", colActions: "操作",
        colAlias: "别名", colKey: "密钥", colExpires: "过期",
        keysTitle: "API Keys", keysHint: "调用 /v1/* 时使用 Bearer",
        createKey: "创建密钥", create: "创建", close: "关闭",
        keyOnce: "完整密钥只会显示一次，请立即复制保存。",
        validDays: "有效天数（空=永不过期）", note: "备注",
        quickTitle: "快速 cURL", quickHint: "本地代理的一键复制示例",
        curlKeyPh: "可选：粘贴 gk_ API Key",
        copy: "复制", copied: "已复制",
        use: "使用", credits: "查额度", reset: "恢复", del: "删除",
        disable: "禁用", enable: "启用",
        noAccounts: "暂无账号，点击「添加账号」",
        noKeys: "暂无 API Key。未创建时 /v1 开放访问；创建后需 Bearer。",
        current: "当前",
        notChecked: "未查询",
        usedLeft: (u,r) => u.toFixed(1) + "% 已用 · " + r.toFixed(1) + "% 剩余",
        metaProxy: "出站代理（自动读取环境变量 / 系统代理，非写死）",
        metaNone: "无",
        metaModels: "/v1/models 实时从 xAI 拉取",
        switchOk: "已切换并仅检查该账号额度",
        addOk: "账号添加成功",
        keyCreated: "API Key 已创建",
      },
      en: {
        title: "Account Pool",
        subtitle: "SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy. Current account highlighted; credits checked for current only.",
        refresh: "Refresh",
        adminPh: "Admin token (ADMIN_TOKEN)",
        adminTip: "Only required if the server set ADMIN_TOKEN. Protects /api/admin/* management APIs — unrelated to /v1 API keys.",
        statAccounts: "Accounts", statActive: "Active", statExhausted: "Exhausted", statExpired: "Expired", statKeys: "API Keys",
        tabAccounts: "Accounts", tabKeys: "API Keys", tabQuick: "Quick start",
        routing: "Routing", modeAuto: "Auto", modeManual: "Manual",
        accNamePh: "Account note (optional)", addAccount: "Add account",
        deviceHint: "Open the verification page and enter this Device Code:",
        verifyUrl: "URL", waiting: "Waiting for auth…",
        colAccount: "Account", colStatus: "Status", colCredits: "Credits", colUses: "Uses", colLastUsed: "Last used", colActions: "Actions",
        colAlias: "Alias", colKey: "Key", colExpires: "Expires",
        keysTitle: "API Keys", keysHint: "Bearer for /v1/*",
        createKey: "Create key", create: "Create", close: "Close",
        keyOnce: "The full key is shown only once. Copy it now.",
        validDays: "Valid days (empty = never)", note: "Note",
        quickTitle: "Quick cURL", quickHint: "Copy-ready examples for your local proxy",
        curlKeyPh: "Optional: paste gk_ API key",
        copy: "Copy", copied: "Copied",
        use: "Use", credits: "Credits", reset: "Reset", del: "Delete",
        disable: "Disable", enable: "Enable",
        noAccounts: "No accounts yet. Click Add account.",
        noKeys: "No API keys. /v1 is open until you create one; then Bearer is required.",
        current: "CURRENT",
        notChecked: "not checked",
        usedLeft: (u,r) => u.toFixed(1) + "% used · " + r.toFixed(1) + "% left",
        metaProxy: "Outbound proxy (auto from env / OS system proxy, never hard-coded)",
        metaNone: "none",
        metaModels: "/v1/models is fetched live from xAI",
        switchOk: "Switched; credits checked for this account only",
        addOk: "Account added",
        keyCreated: "API key created",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let routing = { mode: "auto", currentAccountId: null };
    let meta = { adminTokenRequired: false, proxy: null };
    let pollTimer = null;
    const $ = (id) => document.getElementById(id);
    const t = (k, ...args) => {
      const v = I18N[lang][k];
      return typeof v === "function" ? v(...args) : (v ?? k);
    };

    function applyI18n() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
      });
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      $("adminWrap").title = t("adminTip");
      paintCurl();
      paintMeta();
      paintMode();
    }

    function headers() {
      const tok = $("adminToken").value.trim();
      return tok ? { Authorization: "Bearer " + tok } : {};
    }
    function jsonHeaders() { return { "Content-Type": "application/json", ...headers() }; }
    function showMsg(el, text, type) { el.textContent = text; el.className = "msg show" + (type ? " " + type : ""); }
    function hideMsg(el) { el.className = "msg"; el.textContent = ""; }
    function esc(s) {
      return String(s ?? "").replace(/[&<>"'\\\`]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;","\`":"&#96;"}[c]));
    }
    function fmtTime(ts) { return ts ? new Date(ts).toLocaleString() : "–"; }

    function baseUrl() { return location.origin; }
    function paintCurl() {
      const b = baseUrl();
      const key = $("curlKey").value.trim();
      const auth = key ? '  -H "Authorization: Bearer ' + key + '" \\\\' : null;
      $("curlChat").textContent = [
        "curl " + b + "/v1/chat/completions \\\\",
        auth,
        '  -H "Content-Type: application/json" \\\\',
        '  -d \\'{"model":"grok-4.5","messages":[{"role":"user","content":"hello"}]}\\''
      ].filter(Boolean).join("\\n");
      $("curlResp").textContent = [
        "curl " + b + "/v1/responses \\\\",
        auth,
        '  -H "Content-Type: application/json" \\\\',
        '  -d \\'{"model":"grok-4.5","input":"hello"}\\''
      ].filter(Boolean).join("\\n");
      $("curlModels").textContent = [
        "curl " + b + "/v1/models" + (key ? " \\\\" : ""),
        key ? '  -H "Authorization: Bearer ' + key + '"' : null
      ].filter(Boolean).join("\\n");
    }
    function paintMeta() {
      const p = meta.proxy || t("metaNone");
      $("metaLine").innerHTML =
        t("metaProxy") + ": <code>" + esc(p) + "</code> · " + t("metaModels");
    }

    async function loadMeta() {
      try {
        const res = await fetch("/api/meta");
        meta = await res.json();
        $("adminWrap").classList.toggle("show", !!meta.adminTokenRequired);
        paintMeta();
      } catch {}
    }

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
        document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
        tab.classList.add("active");
        $("view-" + tab.dataset.tab).classList.add("active");
        if (tab.dataset.tab === "quickstart") paintCurl();
      });
    });

    $("langSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      lang = b.dataset.lang;
      localStorage.setItem("grok_api_lang", lang);
      applyI18n();
      loadAll();
    });

    $("modeSeg").addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-mode]");
      if (!btn) return;
      try {
        const res = await fetch("/api/admin/routing/mode", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ mode: btn.dataset.mode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        routing = data.routing;
        paintMode();
        await loadAccounts();
      } catch (err) {
        showMsg($("msg"), String(err.message || err), "err");
      }
    });

    function paintMode() {
      $("modeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.mode === routing.mode));
      $("currentLabel").textContent = "Current: " + (routing.currentAccountId || "–") + " · " + routing.mode;
    }

    function creditCell(a) {
      if (!a.credits) return '<span class="mono">' + esc(t("notChecked")) + "</span>";
      const used = a.credits.creditUsagePercent ?? 0;
      const rem = a.credits.remainingPercent ?? (100 - used);
      const cls = rem < 10 ? "bad" : rem < 30 ? "warn" : "";
      return '<div class="meter ' + cls + '"><i style="width:' + Math.min(100, used) + '%"></i></div>' +
        '<div class="credit-txt">' + esc(t("usedLeft", used, rem)) + "</div>";
    }

    async function loadAccounts() {
      const res = await fetch("/api/admin/accounts", { headers: headers() });
      if (!res.ok) { showMsg($("msg"), "HTTP " + res.status, "err"); return; }
      const data = await res.json();
      routing = data.routing || routing;
      paintMode();
      $("sTotal").textContent = data.stats.total;
      $("sActive").textContent = data.stats.active;
      $("sExhausted").textContent = data.stats.exhausted;
      $("sExpired").textContent = data.stats.expired;
      const tbody = $("tbody");
      if (!data.accounts.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">' + esc(t("noAccounts")) + "</td></tr>";
        return;
      }
      tbody.innerHTML = data.accounts.map((a) => {
        const cur = a.isCurrent;
        return '<tr class="' + (cur ? "current" : "") + '">' +
          '<td><div class="name">' + esc(a.name) + (cur ? ' <span class="badge current">' + esc(t("current")) + "</span>" : "") +
          '</div><div class="mono">' + esc(a.id) + "</div>" +
          (a.lastError ? '<div style="color:var(--error);font-size:12px;margin-top:4px">' + esc(a.lastError) + "</div>" : "") +
          "</td>" +
          '<td><span class="badge ' + esc(a.status) + '">' + esc(a.status) + "</span></td>" +
          "<td>" + creditCell(a) + "</td>" +
          '<td class="mono">' + a.useCount + "</td>" +
          '<td class="mono">' + fmtTime(a.lastUsedAt) + "</td>" +
          '<td class="actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="use" data-id="' + esc(a.id) + '">' + esc(t("use")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="credits" data-id="' + esc(a.id) + '">' + esc(t("credits")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="reset" data-id="' + esc(a.id) + '">' + esc(t("reset")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-id="' + esc(a.id) + '">' + esc(t("del")) + "</button>" +
          "</td></tr>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "use") useAcc(id);
          if (act === "credits") checkCredits(id);
          if (act === "reset") resetAcc(id);
          if (act === "del") delAcc(id);
        });
      });
    }

    async function loadKeys() {
      const res = await fetch("/api/admin/keys", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      $("sKeys").textContent = data.keys.length;
      const tbody = $("tbodyKeys");
      if (!data.keys.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">' + esc(t("noKeys")) + "</td></tr>";
        return;
      }
      tbody.innerHTML = data.keys.map((k) => {
        const st = !k.enabled ? "disabled" : k.expired ? "expired" : "active";
        return "<tr><td><div class=\\"name\\">" + esc(k.alias) + '</div><div class="mono">' + esc(k.note || "") + "</div></td>" +
          '<td class="mono">' + esc(k.keyPrefix) + "</td>" +
          '<td><span class="badge ' + (st === "active" ? "active" : "error") + '">' + st + "</span></td>" +
          '<td class="mono">' + (k.expiresAt ? fmtTime(k.expiresAt) : "never") + "</td>" +
          '<td class="mono">' + k.useCount + "</td>" +
          '<td class="actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="toggle" data-id="' + esc(k.id) + '" data-en="' + (k.enabled ? "0" : "1") + '">' +
          esc(k.enabled ? t("disable") : t("enable")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="delkey" data-id="' + esc(k.id) + '">' + esc(t("del")) + "</button>" +
          "</td></tr>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "toggle") toggleKey(id, btn.getAttribute("data-en") === "1");
          if (act === "delkey") delKey(id);
        });
      });
    }

    function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    async function addOAuth() {
      hideMsg($("msg")); stopPoll(); $("btnAdd").disabled = true; $("codeBox").classList.remove("show");
      try {
        const res = await fetch("/api/admin/accounts/oauth", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ name: $("accName").value || undefined, openBrowser: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const url = data.verificationUriComplete || data.verificationUri;
        $("userCode").textContent = data.userCode;
        $("verifyLink").textContent = data.verificationUri;
        $("verifyLink").href = url;
        $("pollStatus").textContent = t("waiting");
        $("codeBox").classList.add("show");
        const sessionId = data.sessionId;
        pollTimer = setInterval(async () => {
          try {
            const pr = await fetch("/api/admin/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
            const result = await pr.json();
            if (result.ok) {
              stopPoll(); $("codeBox").classList.remove("show");
              showMsg($("msg"), t("addOk") + ": " + (result.account?.name || result.account?.id), "ok");
              $("accName").value = ""; $("btnAdd").disabled = false; await loadAccounts(); return;
            }
            if (result.pending) { $("pollStatus").textContent = t("waiting") + " " + new Date().toLocaleTimeString(); return; }
            stopPoll(); $("btnAdd").disabled = false; showMsg($("msg"), result.error || "failed", "err");
          } catch { $("pollStatus").textContent = t("waiting"); }
        }, 2000);
      } catch (e) {
        showMsg($("msg"), e.message, "err"); $("btnAdd").disabled = false;
      }
    }

    async function useAcc(id) {
      try {
        const res = await fetch("/api/admin/routing/current", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ accountId: id }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        routing = data.routing;
        showMsg($("msg"), t("switchOk") + ": " + (data.account?.name || id), "ok");
        await loadAccounts();
      } catch (e) { showMsg($("msg"), e.message, "err"); }
    }
    async function checkCredits(id) {
      try {
        const res = await fetch("/api/admin/accounts/" + id + "/credits", { method: "POST", headers: headers() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const c = data.credits;
        showMsg($("msg"), t("usedLeft", c.creditUsagePercent, c.remainingPercent), "ok");
        await loadAccounts();
      } catch (e) { showMsg($("msg"), e.message, "err"); }
    }
    async function delAcc(id) {
      if (!confirm(id + " ?")) return;
      const res = await fetch("/api/admin/accounts/" + id, { method: "DELETE", headers: headers() });
      if (!res.ok) return showMsg($("msg"), "fail", "err");
      await loadAccounts();
    }
    async function resetAcc(id) {
      const res = await fetch("/api/admin/accounts/" + id + "/reset", { method: "POST", headers: headers() });
      if (!res.ok) return showMsg($("msg"), "fail", "err");
      await loadAccounts();
    }

    function openKeyModal() {
      $("keyModal").classList.add("show");
      $("keyForm").style.display = "block"; $("keyReveal").style.display = "none";
      $("keySubmit").style.display = ""; $("keyAlias").value = ""; $("keyDays").value = ""; $("keyNote").value = "";
      applyI18n();
    }
    function closeKeyModal() { $("keyModal").classList.remove("show"); }
    $("btnCreateKey").onclick = openKeyModal;
    $("keyCancel").onclick = closeKeyModal;
    $("keyModal").addEventListener("click", (e) => { if (e.target === $("keyModal")) closeKeyModal(); });
    $("keySubmit").onclick = async () => {
      try {
        const days = $("keyDays").value ? Number($("keyDays").value) : null;
        const res = await fetch("/api/admin/keys", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ alias: $("keyAlias").value || undefined, expiresInDays: days, note: $("keyNote").value || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        $("keyForm").style.display = "none"; $("keyReveal").style.display = "block";
        $("keySecret").textContent = data.key; $("keySubmit").style.display = "none";
        showMsg($("msgKeys"), t("keyCreated"), "ok");
        if (!$("curlKey").value) $("curlKey").value = data.key;
        paintCurl();
        await loadKeys();
      } catch (e) { showMsg($("msgKeys"), e.message, "err"); }
    };
    async function toggleKey(id, enabled) {
      await fetch("/api/admin/keys/" + id, { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ enabled }) });
      await loadKeys();
    }
    async function delKey(id) {
      if (!confirm(id + " ?")) return;
      await fetch("/api/admin/keys/" + id, { method: "DELETE", headers: headers() });
      await loadKeys();
    }

    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-copy");
        const text = $(id).textContent;
        try {
          await navigator.clipboard.writeText(text);
          const old = btn.textContent;
          btn.textContent = t("copied");
          setTimeout(() => { btn.textContent = t("copy"); }, 1200);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
          btn.textContent = t("copied");
          setTimeout(() => { btn.textContent = t("copy"); }, 1200);
        }
      });
    });

    $("curlKey").addEventListener("input", paintCurl);
    $("btnAdd").onclick = addOAuth;
    $("btnRefresh").onclick = () => { hideMsg($("msg")); hideMsg($("msgKeys")); loadAll(); };
    $("adminToken").onchange = loadAll;

    async function loadAll() {
      await loadMeta();
      applyI18n();
      await Promise.all([loadAccounts(), loadKeys()]);
      paintCurl();
    }
    loadAll();
  </script>
</body>
</html>`;
}
