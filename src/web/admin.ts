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
      --ink: #171717;
      --body: #4d4d4d;
      --mute: #888;
      --hairline: #ebebeb;
      --hairline-strong: #a1a1a1;
      --canvas: #fff;
      --canvas-soft: #fafafa;
      --canvas-soft-2: #f5f5f5;
      --link: #0070f3;
      --link-deep: #0761d1;
      --link-bg: #d3e5ff;
      --success: #0a7a3e;
      --success-bg: #e5f6ec;
      --error: #ee0000;
      --error-bg: #f7d4d6;
      --warn: #ab570a;
      --warn-bg: #ffefcf;
      --violet: #7928ca;
      --violet-bg: #f3e8ff;
      --radius: 8px;
      --radius-lg: 12px;
      --shadow: 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --font: "Geist", Inter, system-ui, -apple-system, sans-serif;
      --mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      color: var(--ink);
      background: var(--canvas);
      font-size: 14px;
      line-height: 20px;
      letter-spacing: -0.28px;
      min-height: 100dvh;
    }
    button, input, select, textarea { font: inherit; }
    button { cursor: pointer; }
    a { color: var(--link); text-decoration: none; }
    a:hover { color: var(--link-deep); }

    .shell { min-height: 100dvh; display: flex; flex-direction: column; }
    .topbar {
      height: 64px; border-bottom: 1px solid var(--hairline);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; background: rgba(255,255,255,.85); backdrop-filter: saturate(180%) blur(12px);
      position: sticky; top: 0; z-index: 40;
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.4px; }
    .brand-mark {
      width: 22px; height: 22px; border-radius: 6px; background: var(--ink);
      display: grid; place-items: center;
    }
    .brand-mark svg { display: block; }
    .top-actions { display: flex; align-items: center; gap: 8px; }
    .main { width: min(1120px, 100%); margin: 0 auto; padding: 32px 24px 80px; }

    .hero {
      display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
      margin-bottom: 28px; flex-wrap: wrap;
    }
    .hero h1 {
      margin: 0; font-size: 32px; line-height: 40px; font-weight: 600; letter-spacing: -1.28px;
    }
    .hero p { margin: 8px 0 0; color: var(--body); max-width: 52ch; }

    .stats {
      display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 12px; margin-bottom: 24px;
    }
    .stat {
      border: 1px solid var(--hairline); border-radius: var(--radius-lg);
      padding: 14px 16px; background: var(--canvas);
    }
    .stat .n { font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -0.96px; }
    .stat .l { color: var(--mute); font-size: 12px; margin-top: 2px; }

    .tabs {
      display: flex; gap: 4px; border-bottom: 1px solid var(--hairline); margin-bottom: 20px;
    }
    .tab {
      border: 0; background: transparent; color: var(--mute); padding: 10px 14px;
      border-bottom: 2px solid transparent; font-weight: 500; margin-bottom: -1px;
      transition: color .15s ease, border-color .15s ease;
    }
    .tab:hover { color: var(--ink); }
    .tab.active { color: var(--ink); border-bottom-color: var(--ink); }

    .panel {
      border: 1px solid var(--hairline); border-radius: var(--radius-lg);
      background: var(--canvas); box-shadow: var(--shadow); overflow: hidden;
    }
    .panel-hd {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
      padding: 14px 16px; border-bottom: 1px solid var(--hairline); background: var(--canvas-soft);
    }
    .panel-hd .spacer { flex: 1; }
    .panel-bd { padding: 0; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 32px; padding: 0 12px; border-radius: 6px; border: 1px solid var(--ink);
      background: var(--ink); color: #fff; font-weight: 500; font-size: 14px;
      transition: background .15s ease, border-color .15s ease, opacity .15s ease;
    }
    .btn:hover { background: #000; }
    .btn:disabled { opacity: .45; cursor: not-allowed; }
    .btn:active { transform: translateY(1px); }
    .btn-secondary {
      background: var(--canvas); color: var(--ink); border-color: var(--hairline);
    }
    .btn-secondary:hover { background: var(--canvas-soft-2); border-color: var(--hairline-strong); }
    .btn-danger {
      background: var(--canvas); color: var(--error); border-color: #f3b0b0;
    }
    .btn-danger:hover { background: var(--error-bg); }
    .btn-sm { height: 28px; padding: 0 10px; font-size: 12px; }

    .input {
      height: 32px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--hairline);
      background: var(--canvas); color: var(--ink); min-width: 160px; outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .input:focus { border-color: var(--ink); box-shadow: 0 0 0 2px rgba(23,23,23,.08); }
    .input::placeholder { color: var(--mute); }

    .msg {
      display: none; margin: 12px 16px 0; padding: 10px 12px; border-radius: 8px;
      border: 1px solid var(--hairline); background: var(--canvas-soft); color: var(--body);
      white-space: pre-wrap; word-break: break-word; font-size: 13px;
    }
    .msg.show { display: block; }
    .msg.ok { background: var(--success-bg); border-color: #b7e4c7; color: var(--success); }
    .msg.err { background: var(--error-bg); border-color: #f0b8bb; color: var(--error); }

    .codebox {
      display: none; margin: 12px 16px 0; padding: 16px; border-radius: 8px;
      border: 1px dashed var(--hairline-strong); background: var(--canvas-soft);
    }
    .codebox.show { display: block; }
    .codebox .label { color: var(--mute); font-size: 12px; margin-bottom: 8px; }
    .codebox .code {
      font-family: var(--mono); font-size: 28px; font-weight: 500; letter-spacing: .14em; color: var(--ink);
    }

    table { width: 100%; border-collapse: collapse; }
    th, td {
      text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--hairline);
      vertical-align: top; font-size: 13px;
    }
    th {
      color: var(--mute); font-weight: 500; font-size: 12px;
      background: var(--canvas); letter-spacing: 0;
    }
    tr:last-child td { border-bottom: 0; }
    tr.current {
      background: linear-gradient(90deg, #f0f7ff 0%, #fff 55%);
      box-shadow: inset 3px 0 0 var(--link);
    }
    tr.current td:first-child { position: relative; }

    .badge {
      display: inline-flex; align-items: center; height: 22px; padding: 0 8px;
      border-radius: 999px; font-size: 12px; font-weight: 500; background: var(--canvas-soft-2); color: var(--body);
      border: 1px solid var(--hairline);
    }
    .badge.active { background: var(--success-bg); color: var(--success); border-color: #b7e4c7; }
    .badge.exhausted { background: var(--violet-bg); color: var(--violet); border-color: #d8ccf1; }
    .badge.expired, .badge.error { background: var(--error-bg); color: var(--error); border-color: #f0b8bb; }
    .badge.current {
      background: var(--link-bg); color: var(--link-deep); border-color: #b6d4ff;
    }

    .mono { font-family: var(--mono); font-size: 12px; color: var(--mute); }
    .name { font-weight: 500; color: var(--ink); }
    .actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .meter {
      height: 6px; border-radius: 99px; background: var(--canvas-soft-2); overflow: hidden;
      border: 1px solid var(--hairline); width: 100%; max-width: 120px;
    }
    .meter > i {
      display: block; height: 100%; background: var(--link);
      transition: width .25s ease;
    }
    .meter.warn > i { background: var(--warn); }
    .meter.bad > i { background: var(--error); }
    .credit-txt { font-family: var(--mono); font-size: 12px; color: var(--body); margin-top: 4px; }

    .routing-bar {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid var(--hairline); background: #fff;
    }
    .seg {
      display: inline-flex; border: 1px solid var(--hairline); border-radius: 8px; overflow: hidden;
    }
    .seg button {
      border: 0; background: transparent; height: 30px; padding: 0 12px; color: var(--body); font-weight: 500;
    }
    .seg button.on { background: var(--ink); color: #fff; }

    .empty {
      padding: 48px 16px; text-align: center; color: var(--mute);
    }

    .endpoint {
      margin-top: 20px; padding: 14px 16px; border: 1px solid var(--hairline);
      border-radius: var(--radius-lg); background: var(--canvas-soft); color: var(--body); font-size: 13px;
    }
    .endpoint code {
      font-family: var(--mono); font-size: 12px; background: #fff; border: 1px solid var(--hairline);
      border-radius: 4px; padding: 1px 6px; color: var(--ink);
    }

    .modal-mask {
      display: none; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 50;
      align-items: center; justify-content: center; padding: 20px;
    }
    .modal-mask.show { display: flex; }
    .modal {
      width: min(440px, 100%); background: #fff; border-radius: 12px; border: 1px solid var(--hairline);
      box-shadow: 0 16px 48px rgba(0,0,0,.12); padding: 20px;
    }
    .modal h3 { margin: 0 0 6px; font-size: 18px; letter-spacing: -.4px; }
    .modal p { margin: 0 0 14px; color: var(--body); font-size: 13px; }
    .modal .field { margin-bottom: 12px; }
    .modal label { display: block; font-size: 12px; color: var(--mute); margin-bottom: 6px; }
    .modal .row { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .secret {
      font-family: var(--mono); font-size: 12px; word-break: break-all;
      background: var(--canvas-soft); border: 1px solid var(--hairline); border-radius: 8px; padding: 10px;
    }

    .view { display: none; }
    .view.active { display: block; }

    @media (max-width: 900px) {
      .stats { grid-template-columns: repeat(2, 1fr); }
      .main { padding: 20px 16px 64px; }
      .hero h1 { font-size: 24px; line-height: 32px; }
      table { display: block; overflow-x: auto; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
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
        <input id="adminToken" class="input" type="password" placeholder="Admin token" style="min-width:140px" />
        <button class="btn btn-secondary btn-sm" id="btnRefresh" type="button">Refresh</button>
      </div>
    </header>

    <main class="main">
      <div class="hero">
        <div>
          <h1>Account Pool</h1>
          <p>SuperGrok OAuth 账号池 · 额度感知轮询 · OpenAI 兼容代理。当前账号高亮，余额只查当前号。</p>
        </div>
      </div>

      <div class="stats" id="stats">
        <div class="stat"><div class="n" id="sTotal">–</div><div class="l">Accounts</div></div>
        <div class="stat"><div class="n" id="sActive">–</div><div class="l">Active</div></div>
        <div class="stat"><div class="n" id="sExhausted">–</div><div class="l">Exhausted</div></div>
        <div class="stat"><div class="n" id="sExpired">–</div><div class="l">Expired</div></div>
        <div class="stat"><div class="n" id="sKeys">–</div><div class="l">API Keys</div></div>
      </div>

      <div class="tabs" role="tablist">
        <button class="tab active" data-tab="accounts" type="button">Accounts</button>
        <button class="tab" data-tab="keys" type="button">API Keys</button>
      </div>

      <section class="view active" id="view-accounts">
        <div class="panel">
          <div class="routing-bar">
            <span class="mono">Routing</span>
            <div class="seg" id="modeSeg">
              <button type="button" data-mode="auto" class="on">Auto</button>
              <button type="button" data-mode="manual">Manual</button>
            </div>
            <span class="mono" id="currentLabel">Current: –</span>
            <div class="spacer" style="flex:1"></div>
            <input id="accName" class="input" placeholder="账号备注（可选）" />
            <button class="btn" id="btnAdd" type="button">Add account</button>
          </div>
          <div id="codeBox" class="codebox">
            <div class="label">在浏览器打开验证页，输入以下 Device Code：</div>
            <div class="code" id="userCode">––––</div>
            <div class="label" style="margin-top:12px">验证地址：<a id="verifyLink" href="#" target="_blank" rel="noreferrer">–</a></div>
            <div class="label" style="margin-top:8px" id="pollStatus">等待授权…</div>
          </div>
          <div id="msg" class="msg"></div>
          <div class="panel-bd" style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Credits</th>
                  <th>Uses</th>
                  <th>Last used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tbody"><tr><td colspan="6" class="empty">Loading…</td></tr></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="view" id="view-keys">
        <div class="panel">
          <div class="panel-hd">
            <strong>API Keys</strong>
            <span class="mono">调用 /v1/* 时使用 Bearer</span>
            <div class="spacer"></div>
            <button class="btn" id="btnCreateKey" type="button">Create key</button>
          </div>
          <div id="msgKeys" class="msg"></div>
          <div class="panel-bd" style="overflow-x:auto">
            <table>
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Key</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Uses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="tbodyKeys"><tr><td colspan="6" class="empty">Loading…</td></tr></tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="endpoint">
        Proxy:
        <code>POST /v1/chat/completions</code>
        <code>POST /v1/responses</code>
        · Header <code>Authorization: Bearer &lt;api_key&gt;</code>
        · Optional <code>x-account-id</code>
      </div>
    </main>
  </div>

  <div class="modal-mask" id="keyModal">
    <div class="modal" role="dialog" aria-modal="true">
      <h3 id="keyModalTitle">Create API Key</h3>
      <p id="keyModalDesc">创建后只会显示一次完整密钥，请立即复制保存。</p>
      <div id="keyForm">
        <div class="field">
          <label for="keyAlias">Alias</label>
          <input id="keyAlias" class="input" style="width:100%" placeholder="production" />
        </div>
        <div class="field">
          <label for="keyDays">Valid days (empty = never)</label>
          <input id="keyDays" class="input" style="width:100%" type="number" min="1" placeholder="30" />
        </div>
        <div class="field">
          <label for="keyNote">Note</label>
          <input id="keyNote" class="input" style="width:100%" placeholder="optional" />
        </div>
      </div>
      <div id="keyReveal" style="display:none">
        <div class="secret" id="keySecret"></div>
      </div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="keyCancel">Close</button>
        <button class="btn" type="button" id="keySubmit">Create</button>
      </div>
    </div>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    let pollTimer = null;
    let routing = { mode: "auto", currentAccountId: null };

    function headers() {
      const t = $("adminToken").value.trim();
      return t ? { Authorization: "Bearer " + t } : {};
    }
    function jsonHeaders() {
      return { "Content-Type": "application/json", ...headers() };
    }
    function showMsg(el, text, type) {
      el.textContent = text;
      el.className = "msg show" + (type ? " " + type : "");
    }
    function hideMsg(el) { el.className = "msg"; el.textContent = ""; }
    function esc(s) {
      return String(s ?? "").replace(/[&<>"'\\\`]/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;","\`":"&#96;"
      }[c]));
    }
    function fmtTime(ts) {
      if (!ts) return "–";
      return new Date(ts).toLocaleString();
    }
    function creditCell(a) {
      if (!a.credits) return '<span class="mono">not checked</span>';
      const used = a.credits.creditUsagePercent ?? 0;
      const rem = a.credits.remainingPercent ?? (100 - used);
      const cls = rem < 10 ? "bad" : rem < 30 ? "warn" : "";
      return \`
        <div class="meter \${cls}" title="used \${used}%"><i style="width:\${Math.min(100,used)}%"></i></div>
        <div class="credit-txt">\${used.toFixed(1)}% used · \${rem.toFixed(1)}% left</div>
      \`;
    }

    // tabs
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
        tab.classList.add("active");
        $("view-" + tab.dataset.tab).classList.add("active");
      });
    });

    // mode segment
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
        showMsg($("msg"), "切换模式失败: " + err.message, "err");
      }
    });

    function paintMode() {
      $("modeSeg").querySelectorAll("button").forEach((b) => {
        b.classList.toggle("on", b.dataset.mode === routing.mode);
      });
      $("currentLabel").textContent = "Current: " + (routing.currentAccountId || "–") + " · " + routing.mode;
    }

    async function loadAll() {
      await Promise.all([loadAccounts(), loadKeys()]);
    }

    async function loadAccounts() {
      const res = await fetch("/api/admin/accounts", { headers: headers() });
      if (!res.ok) {
        showMsg($("msg"), "加载失败: " + res.status, "err");
        return;
      }
      const data = await res.json();
      routing = data.routing || routing;
      paintMode();
      $("sTotal").textContent = data.stats.total;
      $("sActive").textContent = data.stats.active;
      $("sExhausted").textContent = data.stats.exhausted;
      $("sExpired").textContent = data.stats.expired;

      const tbody = $("tbody");
      if (!data.accounts.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No accounts yet. Click Add account.</td></tr>';
        return;
      }
      tbody.innerHTML = data.accounts.map((a) => {
        const current = a.isCurrent;
        return \`
        <tr class="\${current ? "current" : ""}" data-id="\${esc(a.id)}">
          <td>
            <div class="name">\${esc(a.name)} \${current ? '<span class="badge current">CURRENT</span>' : ""}</div>
            <div class="mono">\${esc(a.id)}</div>
            \${a.lastError ? '<div style="color:var(--error);font-size:12px;margin-top:4px">' + esc(a.lastError) + '</div>' : ''}
          </td>
          <td><span class="badge \${esc(a.status)}">\${esc(a.status)}</span></td>
          <td>\${creditCell(a)}</td>
          <td class="mono">\${a.useCount}</td>
          <td class="mono">\${fmtTime(a.lastUsedAt)}</td>
          <td class="actions">
            <button class="btn btn-secondary btn-sm" type="button" onclick="useAcc('\${a.id}')">Use</button>
            <button class="btn btn-secondary btn-sm" type="button" onclick="checkCredits('\${a.id}')">Credits</button>
            <button class="btn btn-secondary btn-sm" type="button" onclick="resetAcc('\${a.id}')">Reset</button>
            <button class="btn btn-danger btn-sm" type="button" onclick="delAcc('\${a.id}')">Delete</button>
          </td>
        </tr>\`;
      }).join("");
    }

    async function loadKeys() {
      const res = await fetch("/api/admin/keys", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      $("sKeys").textContent = data.keys.length;
      const tbody = $("tbodyKeys");
      if (!data.keys.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No API keys. Open access until you create one.</td></tr>';
        return;
      }
      tbody.innerHTML = data.keys.map((k) => {
        const st = !k.enabled ? "disabled" : k.expired ? "expired" : "active";
        return \`
        <tr>
          <td><div class="name">\${esc(k.alias)}</div><div class="mono">\${esc(k.note || "")}</div></td>
          <td class="mono">\${esc(k.keyPrefix)}</td>
          <td><span class="badge \${st === "active" ? "active" : "error"}">\${st}</span></td>
          <td class="mono">\${k.expiresAt ? fmtTime(k.expiresAt) : "never"}</td>
          <td class="mono">\${k.useCount}</td>
          <td class="actions">
            <button class="btn btn-secondary btn-sm" type="button" onclick="toggleKey('\${k.id}', \${k.enabled ? "false" : "true"})">\${k.enabled ? "Disable" : "Enable"}</button>
            <button class="btn btn-danger btn-sm" type="button" onclick="delKey('\${k.id}')">Delete</button>
          </td>
        </tr>\`;
      }).join("");
    }

    function stopPoll() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    async function addOAuth() {
      hideMsg($("msg"));
      stopPoll();
      $("btnAdd").disabled = true;
      $("codeBox").classList.remove("show");
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
        $("pollStatus").textContent = "等待授权…（" + data.expiresIn + "s）";
        $("codeBox").classList.add("show");
        showMsg($("msg"), "已打开浏览器。输入短码后自动入库。\\n" + url);

        const sessionId = data.sessionId;
        pollTimer = setInterval(async () => {
          try {
            const pr = await fetch("/api/admin/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
            const result = await pr.json();
            if (result.ok) {
              stopPoll();
              $("codeBox").classList.remove("show");
              showMsg($("msg"), "账号添加成功: " + (result.account?.name || result.account?.id), "ok");
              $("accName").value = "";
              $("btnAdd").disabled = false;
              await loadAccounts();
              return;
            }
            if (result.pending) {
              $("pollStatus").textContent = "等待授权… " + new Date().toLocaleTimeString();
              return;
            }
            stopPoll();
            $("btnAdd").disabled = false;
            showMsg($("msg"), "添加失败: " + (result.error || "unknown"), "err");
          } catch (e) {
            $("pollStatus").textContent = "轮询异常，重试中…";
          }
        }, 2000);
      } catch (e) {
        showMsg($("msg"), "添加失败: " + e.message, "err");
        $("btnAdd").disabled = false;
      }
    }

    async function useAcc(id) {
      try {
        const res = await fetch("/api/admin/routing/current", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ accountId: id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        routing = data.routing;
        showMsg($("msg"), "已切换到 " + (data.account?.name || id) + "（仅检查该账号额度）", "ok");
        await loadAccounts();
      } catch (e) {
        showMsg($("msg"), "切换失败: " + e.message, "err");
      }
    }

    async function checkCredits(id) {
      try {
        showMsg($("msg"), "正在查询额度（仅此账号）…");
        const res = await fetch("/api/admin/accounts/" + id + "/credits", {
          method: "POST", headers: headers(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const c = data.credits;
        showMsg($("msg"),
          "额度: used " + c.creditUsagePercent.toFixed(1) + "% · remaining " + c.remainingPercent.toFixed(1) + "%" +
          (c.periodEnd ? "\\n周期至 " + c.periodEnd : ""), "ok");
        await loadAccounts();
      } catch (e) {
        showMsg($("msg"), "查询失败: " + e.message, "err");
      }
    }

    async function delAcc(id) {
      if (!confirm("删除账号 " + id + " ?")) return;
      const res = await fetch("/api/admin/accounts/" + id, { method: "DELETE", headers: headers() });
      if (!res.ok) { showMsg($("msg"), "删除失败", "err"); return; }
      showMsg($("msg"), "已删除", "ok");
      await loadAccounts();
    }

    async function resetAcc(id) {
      const res = await fetch("/api/admin/accounts/" + id + "/reset", { method: "POST", headers: headers() });
      if (!res.ok) { showMsg($("msg"), "恢复失败", "err"); return; }
      showMsg($("msg"), "已恢复 active", "ok");
      await loadAccounts();
    }

    // keys modal
    function openKeyModal(mode) {
      $("keyModal").classList.add("show");
      $("keyForm").style.display = "block";
      $("keyReveal").style.display = "none";
      $("keyModalTitle").textContent = "Create API Key";
      $("keyModalDesc").textContent = "创建后只会显示一次完整密钥，请立即复制保存。";
      $("keySubmit").style.display = "";
      $("keySubmit").textContent = "Create";
      $("keyAlias").value = "";
      $("keyDays").value = "";
      $("keyNote").value = "";
    }
    function closeKeyModal() { $("keyModal").classList.remove("show"); }

    $("btnCreateKey").onclick = () => openKeyModal();
    $("keyCancel").onclick = closeKeyModal;
    $("keyModal").addEventListener("click", (e) => { if (e.target === $("keyModal")) closeKeyModal(); });

    $("keySubmit").onclick = async () => {
      try {
        const days = $("keyDays").value ? Number($("keyDays").value) : null;
        const res = await fetch("/api/admin/keys", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({
            alias: $("keyAlias").value || undefined,
            expiresInDays: days,
            note: $("keyNote").value || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        $("keyForm").style.display = "none";
        $("keyReveal").style.display = "block";
        $("keySecret").textContent = data.key;
        $("keyModalTitle").textContent = "Copy your key";
        $("keyModalDesc").textContent = "此密钥不会再次显示。";
        $("keySubmit").style.display = "none";
        showMsg($("msgKeys"), "API Key 已创建", "ok");
        await loadKeys();
      } catch (e) {
        showMsg($("msgKeys"), "创建失败: " + e.message, "err");
      }
    };

    async function toggleKey(id, enabled) {
      const res = await fetch("/api/admin/keys/" + id, {
        method: "PATCH", headers: jsonHeaders(),
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) { showMsg($("msgKeys"), "更新失败", "err"); return; }
      await loadKeys();
    }

    async function delKey(id) {
      if (!confirm("删除 API Key " + id + " ?")) return;
      const res = await fetch("/api/admin/keys/" + id, { method: "DELETE", headers: headers() });
      if (!res.ok) { showMsg($("msgKeys"), "删除失败", "err"); return; }
      showMsg($("msgKeys"), "已删除", "ok");
      await loadKeys();
    }

    $("btnAdd").onclick = addOAuth;
    $("btnRefresh").onclick = () => { hideMsg($("msg")); hideMsg($("msgKeys")); loadAll(); };
    $("adminToken").onchange = loadAll;
    loadAll();
  </script>
</body>
</html>`;
}
