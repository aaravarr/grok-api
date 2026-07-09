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
      --warn:#ab570a;--violet:#7928ca;--violet-bg:#f3e8ff;
      --radius:8px;--radius-lg:12px;--shadow:0 0 0 1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
      --font:"Geist",Inter,system-ui,-apple-system,sans-serif;
      --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
      --ease:cubic-bezier(.16,1,.3,1);--dur:.35s;
    }
    *{box-sizing:border-box} html{scroll-behavior:smooth} html,body{margin:0;padding:0}
    body{font-family:var(--font);color:var(--ink);background:var(--canvas);font-size:14px;line-height:20px;letter-spacing:-.28px;min-height:100dvh}
    button,input,select,textarea{font:inherit} button{cursor:pointer}
    a{color:var(--link);text-decoration:none;transition:color .15s var(--ease)} a:hover{color:var(--link-deep)}
    .shell{min-height:100dvh;display:flex;flex-direction:column}
    .topbar{height:64px;border-bottom:1px solid var(--hairline);display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(255,255,255,.82);backdrop-filter:saturate(180%) blur(14px);position:sticky;top:0;z-index:40;transition:box-shadow .2s var(--ease)}
    .topbar.scrolled{box-shadow:0 1px 0 rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.04)}
    .brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.4px}
    .brand-mark{width:22px;height:22px;border-radius:6px;background:var(--ink);display:grid;place-items:center;transition:transform .25s var(--ease)}
    .brand:hover .brand-mark{transform:rotate(-8deg) scale(1.05)}
    .top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .main{width:min(1120px,100%);margin:0 auto;padding:32px 24px 96px}
    .fade-up{opacity:0;transform:translateY(10px);animation:fadeUp var(--dur) var(--ease) forwards}
    .fade-up.d1{animation-delay:.05s}.fade-up.d2{animation-delay:.1s}.fade-up.d3{animation-delay:.15s}.fade-up.d4{animation-delay:.2s}
    @keyframes fadeUp{to{opacity:1;transform:none}}
    .hero{margin-bottom:28px}
    .hero h1{margin:0;font-size:32px;line-height:40px;font-weight:600;letter-spacing:-1.28px}
    .hero p{margin:8px 0 0;color:var(--body);max-width:58ch}
    .stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:28px}
    .stat{border:1px solid var(--hairline);border-radius:var(--radius-lg);padding:14px 16px;background:var(--canvas);transition:transform .2s var(--ease),box-shadow .2s var(--ease),border-color .2s var(--ease)}
    .stat:hover{transform:translateY(-2px);box-shadow:var(--shadow);border-color:#ddd}
    .stat .n{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.96px;font-variant-numeric:tabular-nums}
    .stat .l{color:var(--mute);font-size:12px;margin-top:2px}
    .section{margin-bottom:28px}
    .section-hd{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}
    .section-hd h2{margin:0;font-size:18px;font-weight:600;letter-spacing:-.4px}
    .section-hd .sub{color:var(--mute);font-size:13px}
    .panel{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:var(--canvas);box-shadow:var(--shadow);overflow:hidden;transition:box-shadow .25s var(--ease)}
    .panel:hover{box-shadow:0 0 0 1px rgba(0,0,0,.06),0 8px 28px rgba(0,0,0,.05)}
    .panel-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft)}
    .panel-hd .spacer{flex:1}
    .panel-bd{padding:16px}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:6px;border:1px solid var(--ink);background:var(--ink);color:#fff;font-weight:500;font-size:14px;transition:background .15s var(--ease),transform .12s var(--ease),opacity .15s,box-shadow .15s var(--ease)}
    .btn:hover{background:#000;box-shadow:0 4px 12px rgba(0,0,0,.12)}
    .btn:active{transform:translateY(1px) scale(.98)}
    .btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none}
    .btn-secondary{background:var(--canvas);color:var(--ink);border-color:var(--hairline)}
    .btn-secondary:hover{background:var(--canvas-soft-2);border-color:var(--hairline-strong);box-shadow:none}
    .btn-danger{background:var(--canvas);color:var(--error);border-color:#f3b0b0}
    .btn-danger:hover{background:var(--error-bg);box-shadow:none}
    .btn-sm{height:28px;padding:0 10px;font-size:12px}
    .input,.select{height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--hairline);background:var(--canvas);color:var(--ink);min-width:140px;outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
    .input:focus,.select:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .input::placeholder{color:var(--mute)}
    .input.grow{flex:1;min-width:180px}
    .msg{display:none;margin:12px 16px 0;padding:10px 12px;border-radius:8px;border:1px solid var(--hairline);background:var(--canvas-soft);color:var(--body);white-space:pre-wrap;word-break:break-word;font-size:13px;animation:fadeUp .25s var(--ease)}
    .msg.show{display:block}.msg.ok{background:var(--success-bg);border-color:#b7e4c7;color:var(--success)}.msg.err{background:var(--error-bg);border-color:#f0b8bb;color:var(--error)}
    .codebox{display:none;margin:12px 16px 0;padding:16px;border-radius:8px;border:1px dashed var(--hairline-strong);background:var(--canvas-soft);animation:fadeUp .3s var(--ease)}
    .codebox.show{display:block}.codebox .label{color:var(--mute);font-size:12px;margin-bottom:8px}
    .codebox .code{font-family:var(--mono);font-size:28px;font-weight:500;letter-spacing:.14em;color:var(--ink)}
    table{width:100%;border-collapse:collapse}
    th,td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--hairline);vertical-align:top;font-size:13px}
    th{color:var(--mute);font-weight:500;font-size:12px;background:var(--canvas)}
    tr{transition:background .18s var(--ease)} tr:last-child td{border-bottom:0}
    tbody tr:hover{background:var(--canvas-soft)}
    tr.current{background:linear-gradient(90deg,#f0f7ff 0%,#fff 55%);box-shadow:inset 3px 0 0 var(--link)}
    .badge{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font-size:12px;font-weight:500;background:var(--canvas-soft-2);color:var(--body);border:1px solid var(--hairline)}
    .badge.active{background:var(--success-bg);color:var(--success);border-color:#b7e4c7}
    .badge.exhausted{background:var(--violet-bg);color:var(--violet);border-color:#d8ccf1}
    .badge.expired,.badge.error{background:var(--error-bg);color:var(--error);border-color:#f0b8bb}
    .badge.current{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .mono{font-family:var(--mono);font-size:12px;color:var(--mute)}.name{font-weight:500;color:var(--ink)}
    .actions{display:flex;flex-wrap:wrap;gap:6px}
    .meter{height:6px;border-radius:99px;background:var(--canvas-soft-2);overflow:hidden;border:1px solid var(--hairline);width:100%;max-width:120px}
    .meter>i{display:block;height:100%;background:var(--link);transition:width .45s var(--ease)}
    .meter.warn>i{background:var(--warn)}.meter.bad>i{background:var(--error)}
    .credit-txt{font-family:var(--mono);font-size:12px;color:var(--body);margin-top:4px}
    .routing-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--hairline);background:#fff}
    .seg{display:inline-flex;border:1px solid var(--hairline);border-radius:8px;overflow:hidden}
    .seg button{border:0;background:transparent;height:30px;padding:0 12px;color:var(--body);font-weight:500;transition:background .15s var(--ease),color .15s var(--ease)}
    .seg button:hover{background:var(--canvas-soft-2)}.seg button.on{background:var(--ink);color:#fff}
    .empty{padding:40px 16px;text-align:center;color:var(--mute)}
    .callout{border:1px solid var(--hairline);border-radius:10px;padding:12px 14px;background:var(--canvas-soft);font-size:13px;color:var(--body);line-height:1.5}
    .callout strong{color:var(--ink);font-weight:500}
    .callout code{font-family:var(--mono);font-size:11px;background:#fff;border:1px solid var(--hairline);border-radius:4px;padding:1px 5px}
    .settings-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .settings-row .hint{width:100%;font-size:12px;color:var(--mute);margin-top:2px}
    .curl-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px}
    .curl-card{border:1px solid var(--hairline);border-radius:10px;overflow:hidden;background:var(--canvas-soft);transition:box-shadow .2s var(--ease)}
    .curl-card:hover{box-shadow:var(--shadow)}
    .curl-card-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--hairline);background:#fff}
    .curl-card-hd strong{font-size:12px;font-weight:500;color:var(--body);font-family:var(--mono)}
    .curl-pre{margin:0;padding:14px;font-family:var(--mono);font-size:12px;line-height:1.65;color:var(--ink);overflow-x:auto;white-space:pre-wrap;word-break:break-all;background:var(--canvas-soft);min-height:88px}
    .pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid var(--hairline);background:#fff;font-size:12px;color:var(--mute)}
    .pager .btns{display:flex;gap:6px;align-items:center}
    .modal-mask{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:50;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .2s var(--ease)}
    .modal-mask.show{display:flex;opacity:1}
    .modal{width:min(440px,100%);background:#fff;border-radius:12px;border:1px solid var(--hairline);box-shadow:0 16px 48px rgba(0,0,0,.12);padding:20px;transform:translateY(8px) scale(.98);animation:modalIn .28s var(--ease) forwards}
    @keyframes modalIn{to{transform:none}}
    .modal h3{margin:0 0 6px;font-size:18px;letter-spacing:-.4px}
    .modal p{margin:0 0 14px;color:var(--body);font-size:13px}
    .modal .field{margin-bottom:12px}
    .modal label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
    .modal .row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
    .secret{font-family:var(--mono);font-size:12px;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:8px;padding:10px}
    .admin-box{display:none;align-items:center;gap:8px;padding:4px 8px 4px 10px;border:1px solid var(--hairline);border-radius:8px;background:var(--canvas-soft);max-width:320px}
    .admin-box.show{display:flex}
    .admin-box .tip{font-size:11px;color:var(--mute);line-height:1.3;max-width:120px}
    #proxyCustomWrap{display:none;flex:1;min-width:200px}
    #proxyCustomWrap.show{display:flex;gap:8px;align-items:center;flex:1}
    @media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}.main{padding:20px 16px 72px}.hero h1{font-size:24px;line-height:32px}table{display:block;overflow-x:auto}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.fade-up,.modal,.msg,.codebox{animation:none!important;opacity:1;transform:none}*{transition:none!important}}
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar" id="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 13H1.5L8 1Z" fill="white"/></svg></div>
        <span>Grok API</span>
      </div>
      <div class="top-actions">
        <div class="seg" id="langSeg">
          <button type="button" data-lang="zh">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <div class="admin-box" id="adminBox">
          <span class="tip" id="adminTip"></span>
          <input id="adminToken" class="input" type="password" style="min-width:120px;height:28px" />
        </div>
        <button class="btn btn-secondary btn-sm" id="btnRefresh" type="button" data-i18n="refresh">Refresh</button>
      </div>
    </header>

    <main class="main">
      <div class="hero fade-up">
        <h1 data-i18n="title">Account Pool</h1>
        <p data-i18n="subtitle">SuperGrok OAuth pool with credit-aware routing and an OpenAI-compatible proxy.</p>
      </div>

      <div class="stats fade-up d1">
        <div class="stat"><div class="n" id="sTotal">–</div><div class="l" data-i18n="statAccounts">Accounts</div></div>
        <div class="stat"><div class="n" id="sActive">–</div><div class="l" data-i18n="statActive">Active</div></div>
        <div class="stat"><div class="n" id="sExhausted">–</div><div class="l" data-i18n="statExhausted">Exhausted</div></div>
        <div class="stat"><div class="n" id="sExpired">–</div><div class="l" data-i18n="statExpired">Expired</div></div>
        <div class="stat"><div class="n" id="sKeys">–</div><div class="l" data-i18n="statKeys">API Keys</div></div>
      </div>

      <section class="section fade-up d2">
        <div class="section-hd">
          <h2 data-i18n="secAccounts">Accounts</h2>
          <span class="sub" data-i18n="secAccountsSub">OAuth pool · current highlighted · credits for current only</span>
        </div>
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
            <div class="label" data-i18n="deviceHint">Enter this Device Code:</div>
            <div class="code" id="userCode">––––</div>
            <div class="label" style="margin-top:12px"><span data-i18n="verifyUrl">URL</span>：<a id="verifyLink" href="#" target="_blank" rel="noreferrer">–</a></div>
            <div class="label" style="margin-top:8px" id="pollStatus"></div>
          </div>
          <div id="msg" class="msg"></div>
          <div style="overflow-x:auto">
            <table>
              <thead><tr>
                <th data-i18n="colAccount">Account</th><th data-i18n="colStatus">Status</th><th data-i18n="colCredits">Credits</th>
                <th data-i18n="colUses">Uses</th><th data-i18n="colLastUsed">Last used</th><th data-i18n="colActions">Actions</th>
              </tr></thead>
              <tbody id="tbody"><tr><td colspan="6" class="empty">…</td></tr></tbody>
            </table>
          </div>
          <div class="pager" id="accPager"></div>
        </div>
      </section>

      <section class="section fade-up d3">
        <div class="section-hd">
          <h2 data-i18n="secKeys">API Keys</h2>
          <span class="sub" data-i18n="secKeysSub">Once created, /v1 requires Authorization</span>
        </div>
        <div class="panel">
          <div class="panel-hd">
            <strong data-i18n="keysTitle">Client keys</strong>
            <span class="mono" data-i18n="keysHint">Bearer gk_…</span>
            <div class="spacer"></div>
            <button class="btn" id="btnCreateKey" type="button" data-i18n="createKey">Create key</button>
          </div>
          <div id="msgKeys" class="msg"></div>
          <div style="overflow-x:auto">
            <table>
              <thead><tr>
                <th data-i18n="colAlias">Alias</th><th data-i18n="colKey">Key</th><th data-i18n="colStatus">Status</th>
                <th data-i18n="colExpires">Expires</th><th data-i18n="colUses">Uses</th><th data-i18n="colActions">Actions</th>
              </tr></thead>
              <tbody id="tbodyKeys"><tr><td colspan="6" class="empty">…</td></tr></tbody>
            </table>
          </div>
          <div class="pager" id="keyPager"></div>
        </div>
      </section>

      <section class="section fade-up d4">
        <div class="section-hd">
          <h2 data-i18n="secCurl">Quick cURL</h2>
          <span class="sub" data-i18n="secCurlSub">Authorization always present · uses $API_KEY</span>
        </div>
        <div class="panel">
          <div class="panel-bd">
            <div class="curl-toolbar">
              <span class="mono" data-i18n="endpoint">Endpoint</span>
              <div class="seg" id="curlSeg">
                <button type="button" data-ep="chat" class="on">chat/completions</button>
                <button type="button" data-ep="responses">responses</button>
                <button type="button" data-ep="models">models</button>
              </div>
              <div class="spacer" style="flex:1"></div>
              <button class="btn btn-secondary btn-sm" type="button" id="btnCopyCurl" data-i18n="copy">Copy</button>
            </div>
            <div class="curl-card">
              <div class="curl-card-hd"><strong id="curlTitle">POST /v1/chat/completions</strong></div>
              <pre class="curl-pre" id="curlBody"></pre>
            </div>
          </div>
        </div>
      </section>

      <section class="section fade-up d4">
        <div class="section-hd">
          <h2 data-i18n="secSettings">Settings</h2>
          <span class="sub" data-i18n="secSettingsSub">Outbound proxy & admin access</span>
        </div>
        <div class="panel">
          <div class="panel-bd" style="display:grid;gap:14px">
            <div class="callout" id="adminExplain"></div>
            <div>
              <div style="font-weight:500;margin-bottom:8px" data-i18n="proxyTitle">Outbound proxy</div>
              <div class="settings-row">
                <div class="seg" id="proxyModeSeg">
                  <button type="button" data-pmode="auto" class="on" data-i18n="proxyAuto">Auto</button>
                  <button type="button" data-pmode="direct" data-i18n="proxyDirect">Direct</button>
                  <button type="button" data-pmode="custom" data-i18n="proxyCustom">Custom</button>
                </div>
                <div id="proxyCustomWrap">
                  <input id="proxyUrl" class="input grow" placeholder="http://127.0.0.1:7890" />
                </div>
                <button class="btn" type="button" id="btnSaveProxy" data-i18n="saveProxy">Save</button>
              </div>
              <div class="hint" id="proxyHint"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div class="modal-mask" id="keyModal">
    <div class="modal" role="dialog">
      <h3 data-i18n="createKey">Create API Key</h3>
      <p data-i18n="keyOnce">The full key is shown only once. Copy it now.</p>
      <div id="keyForm">
        <div class="field"><label data-i18n="colAlias">Alias</label><input id="keyAlias" class="input" style="width:100%" placeholder="production" /></div>
        <div class="field"><label data-i18n="validDays">Valid days (empty = never)</label><input id="keyDays" class="input" style="width:100%" type="number" min="1" placeholder="30" /></div>
        <div class="field"><label data-i18n="note">Note</label><input id="keyNote" class="input" style="width:100%" /></div>
      </div>
      <div id="keyReveal" style="display:none"><div class="secret" id="keySecret"></div></div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="keyCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="keySubmit" data-i18n="create">Create</button>
      </div>
    </div>
  </div>

  <script>
    const PAGE_SIZE = 8;
    const I18N = {
      zh: {
        title:"账号池", subtitle:"SuperGrok OAuth 多账号 · 额度感知轮询 · OpenAI 兼容代理。",
        refresh:"刷新", adminTip:"管理口令",
        adminExplain:"Admin Token 是什么？<br/><strong>只保护管理后台</strong>（添加账号、创建 Key 等 <code>/api/admin/*</code>）。与调用模型的 <code>API_KEY</code> 无关。<br/>仅当设置了环境变量 <code>ADMIN_TOKEN</code> 才需要填写。",
        adminExplainOpen:"当前<strong>未设置</strong> <code>ADMIN_TOKEN</code>，管理接口对本机开放。<br/>公网部署请设置 <code>ADMIN_TOKEN=xxx</code> 后启动。",
        secSettings:"设置", secSettingsSub:"出站代理与管理访问说明",
        proxyTitle:"出站代理", proxyAuto:"自动", proxyDirect:"直连", proxyCustom:"自定义",
        proxyHintAuto:(src,url)=>"当前生效："+(url||"直连")+"（来源："+src+"）",
        saveProxy:"保存", proxySaved:"代理已更新",
        secAccounts:"账号", secAccountsSub:"OAuth 池 · 当前高亮 · 仅查当前号额度",
        secKeys:"API Keys", secKeysSub:"创建后调用 /v1 必须带 Authorization",
        secCurl:"快速调用", secCurlSub:"Header 固定保留 · 使用 $API_KEY",
        endpoint:"接口",
        routing:"路由", modeAuto:"自动", modeManual:"手动",
        accNamePh:"账号备注（可选）", addAccount:"添加账号",
        deviceHint:"在浏览器打开验证页，输入以下 Device Code：",
        verifyUrl:"验证地址", waiting:"等待授权…",
        colAccount:"账号", colStatus:"状态", colCredits:"额度", colUses:"调用", colLastUsed:"上次使用", colActions:"操作",
        colAlias:"别名", colKey:"密钥", colExpires:"过期",
        keysTitle:"客户端密钥", keysHint:"Bearer gk_…",
        createKey:"创建密钥", create:"创建", close:"关闭",
        keyOnce:"完整密钥只会显示一次，请立即复制。",
        validDays:"有效天数（空=永不过期）", note:"备注",
        copy:"复制", copied:"已复制",
        use:"使用", credits:"查额度", reset:"恢复", del:"删除",
        disable:"禁用", enable:"启用",
        noAccounts:"暂无账号，点击「添加账号」",
        noKeys:"暂无 API Key。创建前 /v1 可匿名访问；创建后必须 Bearer。",
        current:"当前", notChecked:"未查询",
        usedLeft:(u,r)=>u.toFixed(1)+"% 已用 · "+r.toFixed(1)+"% 剩余",
        src:{settings:"手动配置",direct:"直连",env:"环境变量",system:"系统代理",none:"无"},
        switchOk:"已切换（仅检查该账号额度）", addOk:"账号添加成功", keyCreated:"API Key 已创建",
        statAccounts:"账号", statActive:"可用", statExhausted:"已耗尽", statExpired:"已过期", statKeys:"API Key",
        pageOf:(c,t,n)=>"第 "+c+" / "+t+" 页 · 共 "+n+" 条", prev:"上一页", next:"下一页",
      },
      en: {
        title:"Account Pool", subtitle:"SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.",
        refresh:"Refresh", adminTip:"Admin password",
        adminExplain:"What is Admin Token?<br/><strong>Protects admin UI only</strong> (<code>/api/admin/*</code>). Unrelated to model <code>API_KEY</code>.<br/>Required only if server started with <code>ADMIN_TOKEN</code>.",
        adminExplainOpen:"<code>ADMIN_TOKEN</code> is <strong>not set</strong>. Admin APIs are open locally.<br/>For public deploy, set <code>ADMIN_TOKEN=xxx</code>.",
        secSettings:"Settings", secSettingsSub:"Outbound proxy & admin access",
        proxyTitle:"Outbound proxy", proxyAuto:"Auto", proxyDirect:"Direct", proxyCustom:"Custom",
        proxyHintAuto:(src,url)=>"Active: "+(url||"direct")+" (source: "+src+")",
        saveProxy:"Save", proxySaved:"Proxy updated",
        secAccounts:"Accounts", secAccountsSub:"OAuth pool · current highlighted · credits for current only",
        secKeys:"API Keys", secKeysSub:"Once created, /v1 requires Authorization",
        secCurl:"Quick cURL", secCurlSub:"Authorization always present · uses $API_KEY",
        endpoint:"Endpoint",
        routing:"Routing", modeAuto:"Auto", modeManual:"Manual",
        accNamePh:"Account note (optional)", addAccount:"Add account",
        deviceHint:"Enter this Device Code on the verification page:",
        verifyUrl:"URL", waiting:"Waiting for auth…",
        colAccount:"Account", colStatus:"Status", colCredits:"Credits", colUses:"Uses", colLastUsed:"Last used", colActions:"Actions",
        colAlias:"Alias", colKey:"Key", colExpires:"Expires",
        keysTitle:"Client keys", keysHint:"Bearer gk_…",
        createKey:"Create key", create:"Create", close:"Close",
        keyOnce:"The full key is shown only once. Copy it now.",
        validDays:"Valid days (empty = never)", note:"Note",
        copy:"Copy", copied:"Copied",
        use:"Use", credits:"Credits", reset:"Reset", del:"Delete",
        disable:"Disable", enable:"Enable",
        noAccounts:"No accounts yet. Click Add account.",
        noKeys:"No API keys. /v1 is open until you create one; then Bearer is required.",
        current:"CURRENT", notChecked:"not checked",
        usedLeft:(u,r)=>u.toFixed(1)+"% used · "+r.toFixed(1)+"% left",
        src:{settings:"manual",direct:"direct",env:"env",system:"system",none:"none"},
        switchOk:"Switched (credits checked for this account only)", addOk:"Account added", keyCreated:"API key created",
        statAccounts:"Accounts", statActive:"Active", statExhausted:"Exhausted", statExpired:"Expired", statKeys:"API Keys",
        pageOf:(c,t,n)=>"Page "+c+" / "+t+" · "+n+" total", prev:"Prev", next:"Next",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let routing = { mode: "auto", currentAccountId: null };
    let meta = { adminTokenRequired: false, proxy: null, proxySource: "none", proxyConfigured: "" };
    let pollTimer = null;
    let curlEp = "chat";
    let proxyMode = "auto"; // auto | direct | custom
    let allAccounts = [];
    let allKeys = [];
    let accPage = 1;
    let keyPage = 1;

    const $ = (id) => document.getElementById(id);
    const t = (k, ...args) => {
      const v = I18N[lang][k];
      return typeof v === "function" ? v(...args) : (v ?? k);
    };

    function applyI18n() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-placeholder")); });
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      $("adminTip").textContent = t("adminTip");
      $("adminToken").placeholder = t("adminTip");
      paintAdminExplain();
      paintProxyUI();
      paintCurl();
      paintMode();
      renderAccounts();
      renderKeys();
    }

    function paintAdminExplain() {
      $("adminExplain").innerHTML = meta.adminTokenRequired ? t("adminExplain") : t("adminExplainOpen");
      $("adminBox").classList.toggle("show", !!meta.adminTokenRequired);
    }

    function detectProxyMode() {
      const cfg = (meta.proxyConfigured || "").trim();
      if (!cfg) return "auto";
      if (/^(direct|none|off|false)$/i.test(cfg)) return "direct";
      return "custom";
    }

    function paintProxyUI() {
      proxyMode = detectProxyMode();
      $("proxyModeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.pmode === proxyMode));
      $("proxyCustomWrap").classList.toggle("show", proxyMode === "custom");
      if (proxyMode === "custom" && !$("proxyUrl").matches(":focus")) {
        $("proxyUrl").value = meta.proxyConfigured || "";
      }
      const srcMap = I18N[lang].src || {};
      const src = srcMap[meta.proxySource] || meta.proxySource;
      $("proxyHint").textContent = t("proxyHintAuto", src, meta.proxy || "");
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
      const map = {
        chat: {
          title: "POST /v1/chat/completions",
          body: [
            "curl " + b + "/v1/chat/completions \\\\",
            '  -H "Authorization: Bearer $API_KEY" \\\\',
            '  -H "Content-Type: application/json" \\\\',
            '  -d \\'{"model":"grok-4.5","messages":[{"role":"user","content":"hello"}]}\\''
          ].join("\\n")
        },
        responses: {
          title: "POST /v1/responses",
          body: [
            "curl " + b + "/v1/responses \\\\",
            '  -H "Authorization: Bearer $API_KEY" \\\\',
            '  -H "Content-Type: application/json" \\\\',
            '  -d \\'{"model":"grok-4.5","input":"hello"}\\''
          ].join("\\n")
        },
        models: {
          title: "GET /v1/models",
          body: [
            "curl " + b + "/v1/models \\\\",
            '  -H "Authorization: Bearer $API_KEY"'
          ].join("\\n")
        }
      };
      const cur = map[curlEp] || map.chat;
      $("curlTitle").textContent = cur.title;
      $("curlBody").textContent = cur.body;
      $("curlSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.ep === curlEp));
    }

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

    function renderPager(el, page, totalItems, onPage) {
      const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      if (page > totalPages) page = totalPages;
      el.innerHTML =
        '<span>' + esc(t("pageOf", page, totalPages, totalItems)) + '</span>' +
        '<div class="btns">' +
        '<button class="btn btn-secondary btn-sm" type="button" data-dir="-1"' + (page <= 1 ? " disabled" : "") + '>' + esc(t("prev")) + '</button>' +
        '<button class="btn btn-secondary btn-sm" type="button" data-dir="1"' + (page >= totalPages ? " disabled" : "") + '>' + esc(t("next")) + '</button>' +
        '</div>';
      el.querySelectorAll("button[data-dir]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = page + Number(btn.getAttribute("data-dir"));
          if (next < 1 || next > totalPages) return;
          onPage(next);
        });
      });
      return page;
    }

    function renderAccounts() {
      const tbody = $("tbody");
      if (!allAccounts.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">' + esc(t("noAccounts")) + "</td></tr>";
        $("accPager").innerHTML = "";
        return;
      }
      accPage = renderPager($("accPager"), accPage, allAccounts.length, (p) => { accPage = p; renderAccounts(); });
      const start = (accPage - 1) * PAGE_SIZE;
      const slice = allAccounts.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((a) => {
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

    function renderKeys() {
      const tbody = $("tbodyKeys");
      if (!allKeys.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">' + esc(t("noKeys")) + "</td></tr>";
        $("keyPager").innerHTML = "";
        return;
      }
      keyPage = renderPager($("keyPager"), keyPage, allKeys.length, (p) => { keyPage = p; renderKeys(); });
      const start = (keyPage - 1) * PAGE_SIZE;
      const slice = allKeys.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((k) => {
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

    async function loadMeta() {
      try {
        const res = await fetch("/api/meta");
        meta = await res.json();
        paintAdminExplain();
        paintProxyUI();
      } catch {}
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
      allAccounts = data.accounts || [];
      const maxPage = Math.max(1, Math.ceil(allAccounts.length / PAGE_SIZE));
      if (accPage > maxPage) accPage = maxPage;
      renderAccounts();
    }

    async function loadKeys() {
      const res = await fetch("/api/admin/keys", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      $("sKeys").textContent = data.keys.length;
      allKeys = data.keys || [];
      const maxPage = Math.max(1, Math.ceil(allKeys.length / PAGE_SIZE));
      if (keyPage > maxPage) keyPage = maxPage;
      renderKeys();
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
      await fetch("/api/admin/accounts/" + id, { method: "DELETE", headers: headers() });
      await loadAccounts();
    }
    async function resetAcc(id) {
      await fetch("/api/admin/accounts/" + id + "/reset", { method: "POST", headers: headers() });
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

    // events
    window.addEventListener("scroll", () => { $("topbar").classList.toggle("scrolled", window.scrollY > 4); }, { passive: true });
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
      } catch (err) { showMsg($("msg"), String(err.message || err), "err"); }
    });
    $("curlSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-ep]");
      if (!b) return;
      curlEp = b.dataset.ep;
      paintCurl();
    });
    $("btnCopyCurl").onclick = async () => {
      const text = $("curlBody").textContent;
      try { await navigator.clipboard.writeText(text); } catch {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      $("btnCopyCurl").textContent = t("copied");
      setTimeout(() => { $("btnCopyCurl").textContent = t("copy"); }, 1200);
    };
    $("proxyModeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-pmode]");
      if (!b) return;
      proxyMode = b.dataset.pmode;
      $("proxyModeSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x.dataset.pmode === proxyMode));
      $("proxyCustomWrap").classList.toggle("show", proxyMode === "custom");
    });
    $("btnSaveProxy").onclick = async () => {
      let value = "";
      if (proxyMode === "direct") value = "direct";
      else if (proxyMode === "custom") value = $("proxyUrl").value.trim();
      else value = ""; // auto
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ proxyUrl: value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.proxy = data.runtime.proxy;
        meta.proxySource = data.runtime.source;
        meta.proxyConfigured = data.settings.proxyUrl;
        paintProxyUI();
        showMsg($("msg"), t("proxySaved"), "ok");
      } catch (e) { showMsg($("msg"), e.message, "err"); }
    };

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
