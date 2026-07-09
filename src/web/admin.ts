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
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --ink:#171717;--body:#4d4d4d;--mute:#888;--hairline:#ebebeb;--hairline-strong:#a1a1a1;
      --canvas:#fff;--canvas-soft:#fafafa;--canvas-soft-2:#f5f5f5;--link:#0070f3;--link-deep:#0761d1;
      --link-bg:#d3e5ff;--success:#0a7a3e;--success-bg:#e5f6ec;--error:#ee0000;--error-bg:#f7d4d6;
      --warn:#ab570a;--violet:#7928ca;--violet-bg:#f3e8ff;
      --radius:8px;--radius-lg:12px;--shadow:0 0 0 1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
      --font:"Geist",Inter,system-ui,-apple-system,sans-serif;
      --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
      --ease:cubic-bezier(.16,1,.3,1);--dur:.3s;
      --side:248px;--top:56px;
    }
    *{box-sizing:border-box} html,body{margin:0;padding:0}
    body{font-family:var(--font);color:var(--ink);background:var(--canvas-soft);font-size:14px;line-height:20px;letter-spacing:-.28px;min-height:100dvh;-webkit-font-smoothing:antialiased}
    button,input,select,textarea{font:inherit} button{cursor:pointer}
    a{color:var(--link);text-decoration:none} a:hover{color:var(--link-deep)}

    .app{display:grid;grid-template-columns:var(--side) minmax(0,1fr);min-height:100dvh;width:100%}
    .side{position:sticky;top:0;height:100dvh;background:#fff;border-right:1px solid var(--hairline);display:flex;flex-direction:column;padding:14px 10px;z-index:30}
    .brand{display:flex;align-items:center;gap:10px;padding:6px 10px 16px;font-weight:600;letter-spacing:-.4px}
    .brand-mark{width:24px;height:24px;border-radius:7px;background:var(--ink);display:grid;place-items:center;flex-shrink:0}
    .nav-group{margin-bottom:12px}
    .nav-label{font-size:11px;font-weight:500;color:var(--mute);padding:8px 12px 6px;letter-spacing:.02em}
    .nav-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;text-align:left;padding:9px 12px;border-radius:8px;color:var(--body);font-weight:500;font-size:13.5px;transition:background .15s var(--ease),color .15s var(--ease),box-shadow .15s var(--ease)}
    .nav-item:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .nav-item.on{background:var(--ink);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12)}
    .nav-item .ic{width:18px;height:18px;flex-shrink:0;display:grid;place-items:center;opacity:.72}
    .nav-item .ic svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
    .nav-item:hover .ic,.nav-item.on .ic{opacity:1}
    .side-foot{margin-top:auto;padding:12px 10px 6px;border-top:1px solid var(--hairline);font-size:11px;color:var(--mute);line-height:1.45}

    .main-wrap{min-width:0;width:100%;display:flex;flex-direction:column;min-height:100dvh}
    .topbar{height:var(--top);border-bottom:1px solid var(--hairline);background:rgba(255,255,255,.92);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:20;gap:12px}
    .page-title{font-weight:600;font-size:15px;letter-spacing:-.3px}
    .page-sub{color:var(--mute);font-size:12px;margin-left:10px;font-weight:400}
    .top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .content{padding:24px 28px 72px;width:100%;max-width:none;flex:1}

    .view{display:none}.view.on{display:block;animation:fadeIn .2s var(--ease)}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

    .hero{margin-bottom:20px}
    .hero h1{margin:0;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-1px}
    .hero p{margin:6px 0 0;color:var(--body);max-width:56ch}

    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}
    .stat{border:1px solid var(--hairline);border-radius:var(--radius-lg);padding:16px 18px;background:#fff;transition:box-shadow .2s var(--ease),transform .2s var(--ease),border-color .2s var(--ease)}
    .stat:hover{box-shadow:0 8px 24px rgba(0,0,0,.05);transform:translateY(-1px);border-color:#e2e2e2}
    .stat .n{font-size:26px;line-height:32px;font-weight:600;letter-spacing:-1px;font-variant-numeric:tabular-nums}
    .stat .l{color:var(--mute);font-size:12px;margin-top:4px}
    .stat.clickable{cursor:pointer}

    .grid-2{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.75fr);gap:14px;align-items:stretch}
    .grid-2b{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .card{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;box-shadow:var(--shadow);overflow:hidden;height:100%}
    .card-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft)}
    .card-hd strong{font-size:13px;font-weight:500}
    .card-hd .spacer{flex:1}
    .card-bd{padding:16px}
    .card-ft{padding:10px 16px;border-top:1px solid var(--hairline);background:#fff}

    .panel{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;box-shadow:var(--shadow);overflow:hidden;width:100%}
    .panel-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 18px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft)}
    .panel-hd .spacer{flex:1}
    .panel-bd{padding:18px}
    .routing-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--hairline);background:#fff}

    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:6px;border:1px solid var(--ink);background:var(--ink);color:#fff;font-weight:500;font-size:13px;transition:background .15s var(--ease),transform .12s var(--ease),opacity .15s}
    .btn:hover{background:#000}.btn:active{transform:translateY(1px) scale(.98)}
    .btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .btn-secondary{background:#fff;color:var(--ink);border-color:var(--hairline)}
    .btn-secondary:hover{background:var(--canvas-soft-2);border-color:var(--hairline-strong)}
    .btn-danger{background:#fff;color:var(--error);border-color:#f3b0b0}
    .btn-danger:hover{background:var(--error-bg)}
    .btn-sm{height:28px;padding:0 10px;font-size:12px}
    .btn-ghost{background:transparent;border-color:transparent;color:var(--body)}
    .btn-ghost:hover{background:var(--canvas-soft-2);color:var(--ink)}

    .input,.select{height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--hairline);background:#fff;color:var(--ink);min-width:120px;outline:none}
    .input:focus,.select:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .input.grow{flex:1;min-width:160px}
    .input::placeholder{color:var(--mute)}

    .seg{display:inline-flex;border:1px solid var(--hairline);border-radius:8px;overflow:hidden;background:#fff}
    .seg button{border:0;background:transparent;height:30px;padding:0 12px;color:var(--body);font-weight:500;font-size:13px}
    .seg button:hover{background:var(--canvas-soft-2)}.seg button.on{background:var(--ink);color:#fff}

    .msg{display:none;margin:12px 16px 0;padding:10px 12px;border-radius:8px;border:1px solid var(--hairline);background:var(--canvas-soft);color:var(--body);white-space:pre-wrap;word-break:break-word;font-size:13px}
    .msg.show{display:block}.msg.ok{background:var(--success-bg);border-color:#b7e4c7;color:var(--success)}.msg.err{background:var(--error-bg);border-color:#f0b8bb;color:var(--error)}
    .codebox{display:none;margin:12px 16px 0;padding:16px;border-radius:8px;border:1px dashed var(--hairline-strong);background:var(--canvas-soft)}
    .codebox.show{display:block}.codebox .label{color:var(--mute);font-size:12px;margin-bottom:8px}
    .codebox .code{font-family:var(--mono);font-size:28px;font-weight:500;letter-spacing:.14em}

    table{width:100%;border-collapse:collapse}
    th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--hairline);vertical-align:top;font-size:13px}
    th{color:var(--mute);font-weight:500;font-size:12px;background:#fff}
    tr:last-child td{border-bottom:0} tbody tr:hover{background:var(--canvas-soft)}
    tr.current{background:linear-gradient(90deg,#f0f7ff 0%,#fff 55%);box-shadow:inset 3px 0 0 var(--link)}
    tr.clickable{cursor:pointer}
    .badge{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font-size:12px;font-weight:500;background:var(--canvas-soft-2);color:var(--body);border:1px solid var(--hairline)}
    .badge.active{background:var(--success-bg);color:var(--success);border-color:#b7e4c7}
    .badge.exhausted{background:var(--violet-bg);color:var(--violet);border-color:#d8ccf1}
    .badge.expired,.badge.error{background:var(--error-bg);color:var(--error);border-color:#f0b8bb}
    .badge.current{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .mono{font-family:var(--mono);font-size:12px;color:var(--mute)}.name{font-weight:500;color:var(--ink)}
    .actions{display:flex;flex-wrap:wrap;gap:6px}
    .meter{height:6px;border-radius:99px;background:var(--canvas-soft-2);overflow:hidden;border:1px solid var(--hairline);width:100%;max-width:120px}
    .meter>i{display:block;height:100%;background:var(--link)}
    .meter.warn>i{background:var(--warn)}.meter.bad>i{background:var(--error)}
    .credit-txt{font-family:var(--mono);font-size:12px;color:var(--body);margin-top:4px}
    .empty{padding:40px 16px;text-align:center;color:var(--mute)}
    .callout{border:1px solid var(--hairline);border-radius:10px;padding:12px 14px;background:var(--canvas-soft);font-size:13px;color:var(--body);line-height:1.5}
    .callout strong{color:var(--ink);font-weight:500}
    .callout code{font-family:var(--mono);font-size:11px;background:#fff;border:1px solid var(--hairline);border-radius:4px;padding:1px 5px}
    .settings-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .settings-row .hint{width:100%;font-size:12px;color:var(--mute);margin-top:2px}
    .curl-pre{margin:0;padding:14px;font-family:var(--mono);font-size:12px;line-height:1.65;color:var(--ink);overflow-x:auto;white-space:pre-wrap;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:10px;min-height:88px}
    .pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid var(--hairline);background:#fff;font-size:12px;color:var(--mute)}
    .pager .btns{display:flex;gap:6px;align-items:center}

    .charts{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px}
    .chart-card{border:1px solid var(--hairline);border-radius:10px;padding:14px 16px;background:#fff;min-height:240px}
    .chart-card h4{margin:0 0 10px;font-size:13px;font-weight:500;color:var(--body)}
    .chart-wrap{position:relative;height:200px}
    .chart-overview{height:280px;min-height:280px}
    @media(min-width:1100px){.chart-overview{height:320px;min-height:320px}}
    .usage-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-bottom:14px}
    .usage-kpis.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
    .kpi{border:1px solid var(--hairline);border-radius:10px;padding:12px 14px;background:var(--canvas-soft)}
    .kpi .n{font-size:20px;font-weight:600;letter-spacing:-.7px;font-variant-numeric:tabular-nums}
    .kpi .l{font-size:12px;color:var(--mute);margin-top:2px}
    .kpi .sub{font-size:11px;color:var(--mute);margin-top:2px;font-family:var(--mono)}

    .quick-list{display:flex;flex-direction:column;gap:0}
    .quick-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 4px;border-bottom:1px solid var(--hairline);font-size:13px;border-radius:6px;transition:background .12s}
    .quick-row:hover{background:var(--canvas-soft)}
    .quick-row:last-child{border-bottom:0}
    .quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .qa{display:flex;flex-direction:column;gap:4px;padding:14px;border:1px solid var(--hairline);border-radius:10px;background:var(--canvas-soft);cursor:pointer;text-align:left;transition:border-color .15s,background .15s,transform .15s,box-shadow .15s}
    .qa:hover{border-color:#d4d4d4;background:#fff;transform:translateY(-1px);box-shadow:var(--shadow)}
    .qa strong{font-size:13px;font-weight:500;color:var(--ink)}
    .qa span{font-size:12px;color:var(--mute)}

    .modal-mask{display:none;position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:50;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
    .modal-mask.show{display:flex;animation:fadeIn .15s var(--ease)}
    .modal{width:min(440px,100%);background:#fff;border-radius:12px;border:1px solid var(--hairline);box-shadow:0 16px 48px rgba(0,0,0,.12);padding:20px}
    .modal.wide{width:min(820px,100%);max-height:min(86dvh,900px);display:flex;flex-direction:column}
    .modal h3{margin:0 0 6px;font-size:18px;letter-spacing:-.4px}
    .modal p{margin:0 0 14px;color:var(--body);font-size:13px}
    .modal .field{margin-bottom:12px}
    .modal label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
    .modal .row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
    .secret{font-family:var(--mono);font-size:12px;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:8px;padding:10px}
    .admin-box{display:none;align-items:center;gap:8px;padding:4px 8px 4px 10px;border:1px solid var(--hairline);border-radius:8px;background:var(--canvas-soft);max-width:300px}
    .admin-box.show{display:flex}
    .admin-box .tip{font-size:11px;color:var(--mute);line-height:1.3;max-width:100px}
    #proxyCustomWrap{display:none;flex:1;min-width:200px}
    #proxyCustomWrap.show{display:flex;gap:8px;align-items:center;flex:1}
    .log-detail{flex:1;overflow:auto;display:grid;gap:12px}
    .log-detail pre{margin:0;padding:12px;border-radius:8px;border:1px solid var(--hairline);background:var(--canvas-soft);font-family:var(--mono);font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:280px;overflow:auto}
    .log-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;font-size:12px}
    .log-meta .k{color:var(--mute)}.log-meta .v{font-family:var(--mono);color:var(--ink);word-break:break-all}
    .mb{margin-bottom:12px}
    .side-toggle{display:none}

    @media(max-width:1100px){
      .stats{grid-template-columns:repeat(2,1fr)}
      .usage-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
      .usage-kpis.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
      .grid-2,.charts{grid-template-columns:1fr}
    }
    @media(max-width:960px){
      .app{grid-template-columns:1fr}
      .side{position:fixed;left:0;top:0;transform:translateX(-100%);transition:transform .22s var(--ease);width:min(280px,86vw);box-shadow:8px 0 32px rgba(0,0,0,.1)}
      .side.open{transform:none}
      .side-toggle{display:inline-flex}
      .content{padding:16px}
      .topbar{padding:0 14px}
      .log-meta{grid-template-columns:1fr}
      table{display:block;overflow-x:auto}
    }
    @media(min-width:1400px){
      .content{padding:28px 36px 80px}
      .chart-wrap{height:220px}
    }
    @media(prefers-reduced-motion:reduce){.view.on,.modal-mask.show{animation:none}*{transition:none!important}}
  </style>
</head>
<body>
  <div class="app">
    <aside class="side" id="side">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 13H1.5L8 1Z" fill="white"/></svg></div>
        <span>Grok API</span>
      </div>
      <nav>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navOps">Operate</div>
          <button type="button" class="nav-item on" data-view="overview"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></span><span data-i18n="navOverview">Overview</span></button>
          <button type="button" class="nav-item" data-view="accounts"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><span data-i18n="navAccounts">Accounts</span></button>
          <button type="button" class="nav-item" data-view="keys"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg></span><span data-i18n="navKeys">API Keys</span></button>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navAnalyze">Analyze</div>
          <button type="button" class="nav-item" data-view="usage"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-9"/></svg></span><span data-i18n="navUsage">Usage</span></button>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navOps2">Ops</div>
          <button type="button" class="nav-item" data-view="logs"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg></span><span data-i18n="navLogs">Logs</span></button>
          <button type="button" class="nav-item" data-view="curl"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 17 6-5-6-5"/><path d="M12 19h8"/></svg></span><span data-i18n="navCurl">cURL</span></button>
          <button type="button" class="nav-item" data-view="settings"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span><span data-i18n="navSettings">Settings</span></button>
        </div>
      </nav>
      <div class="side-foot" id="sideFoot">–</div>
    </aside>

    <div class="main-wrap">
      <header class="topbar">
        <div style="display:flex;align-items:center;gap:8px;min-width:0">
          <button class="btn btn-secondary btn-sm side-toggle" type="button" id="btnSide">☰</button>
          <div>
            <span class="page-title" id="pageTitle">Overview</span>
            <span class="page-sub" id="pageSub"></span>
          </div>
        </div>
        <div class="top-actions">
          <div class="seg" id="langSeg">
            <button type="button" data-lang="zh">中文</button>
            <button type="button" data-lang="en">EN</button>
          </div>
          <div class="admin-box" id="adminBox">
            <span class="tip" id="adminTip"></span>
            <input id="adminToken" class="input" type="password" style="min-width:110px;height:28px" />
          </div>
          <button class="btn btn-secondary btn-sm" id="btnRefresh" type="button" data-i18n="refresh">Refresh</button>
        </div>
      </header>

      <main class="content">
        <!-- OVERVIEW -->
        <section class="view on" id="view-overview">
          <div class="hero">
            <h1 data-i18n="title">Account Pool</h1>
            <p data-i18n="subtitle">SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.</p>
          </div>
          <div class="stats">
            <div class="stat clickable" data-goto="accounts"><div class="n" id="sTotal">–</div><div class="l" data-i18n="statAccounts">Accounts</div></div>
            <div class="stat clickable" data-goto="accounts"><div class="n" id="sActive">–</div><div class="l" data-i18n="statActive">Active</div></div>
            <div class="stat clickable" data-goto="usage"><div class="n" id="sReq">–</div><div class="l" data-i18n="statReqs">Requests</div></div>
            <div class="stat clickable" data-goto="keys"><div class="n" id="sKeys">–</div><div class="l" data-i18n="statKeys">API Keys</div></div>
          </div>
          <div class="grid-2 mb">
            <div class="card">
              <div class="card-hd">
                <strong data-i18n="ovUsage">Usage (7d)</strong>
                <div class="spacer"></div>
                <button class="btn btn-ghost btn-sm" type="button" data-goto="usage" data-i18n="viewMore">Details →</button>
              </div>
              <div class="card-bd">
                <div class="usage-kpis compact" style="margin-bottom:10px">
                  <div class="kpi"><div class="n" id="ovReq">–</div><div class="l" data-i18n="kpiReq">Requests</div></div>
                  <div class="kpi"><div class="n" id="ovIn">–</div><div class="l" data-i18n="kpiIn">Input</div><div class="sub" id="ovCache">–</div></div>
                  <div class="kpi"><div class="n" id="ovOut">–</div><div class="l" data-i18n="kpiOut">Output</div><div class="sub" id="ovReason">–</div></div>
                </div>
                <div class="chart-wrap chart-overview"><canvas id="chartOverview"></canvas></div>
              </div>
            </div>
            <div class="card">
              <div class="card-hd"><strong data-i18n="ovQuick">Quick actions</strong></div>
              <div class="card-bd">
                <div class="quick-actions">
                  <button type="button" class="qa" data-goto="accounts"><strong data-i18n="navAccounts">Accounts</strong><span data-i18n="qaAcc">Add / switch / credits</span></button>
                  <button type="button" class="qa" data-goto="keys"><strong data-i18n="navKeys">API Keys</strong><span data-i18n="qaKey">Issue client keys</span></button>
                  <button type="button" class="qa" data-goto="usage"><strong data-i18n="navUsage">Usage</strong><span data-i18n="qaUsage">Charts & distribution</span></button>
                  <button type="button" class="qa" data-goto="logs"><strong data-i18n="navLogs">Logs</strong><span data-i18n="qaLogs">Debug full requests</span></button>
                </div>
                <div style="margin-top:14px">
                  <div class="mono" style="margin-bottom:6px" data-i18n="ovRecent">Recent requests</div>
                  <div class="quick-list" id="ovRecent"></div>
                </div>
              </div>
              <div class="card-ft">
                <button class="btn btn-secondary btn-sm" type="button" data-goto="logs" data-i18n="viewAllLogs">All logs →</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ACCOUNTS -->
        <section class="view" id="view-accounts">
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

        <!-- KEYS -->
        <section class="view" id="view-keys">
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

        <!-- USAGE -->
        <section class="view" id="view-usage">
          <div class="panel mb">
            <div class="panel-hd">
              <strong data-i18n="usageTitle">Analytics</strong>
              <div class="spacer"></div>
              <div class="seg" id="rangeSeg">
                <button type="button" data-days="1">1d</button>
                <button type="button" data-days="7" class="on">7d</button>
                <button type="button" data-days="30">30d</button>
              </div>
            </div>
            <div class="panel-bd">
              <div class="usage-kpis">
                <div class="kpi"><div class="n" id="uReq">–</div><div class="l" data-i18n="kpiReq">Requests</div></div>
                <div class="kpi"><div class="n" id="uIn">–</div><div class="l" data-i18n="kpiIn">Input tokens</div></div>
                <div class="kpi"><div class="n" id="uCache">–</div><div class="l" data-i18n="kpiCache">Cached input</div></div>
                <div class="kpi"><div class="n" id="uOut">–</div><div class="l" data-i18n="kpiOut">Output tokens</div></div>
                <div class="kpi"><div class="n" id="uReason">–</div><div class="l" data-i18n="kpiReason">Reasoning</div></div>
                <div class="kpi"><div class="n" id="uTok">–</div><div class="l" data-i18n="kpiTok">Total tokens</div></div>
              </div>
              <div class="usage-kpis compact" style="margin-top:-4px;margin-bottom:14px">
                <div class="kpi"><div class="n" id="uOk">–</div><div class="l" data-i18n="kpiOk">Success rate</div></div>
                <div class="kpi"><div class="n" id="uLat">–</div><div class="l" data-i18n="kpiLat">Avg latency</div></div>
                <div class="kpi"><div class="n" id="uImg">–</div><div class="l" data-i18n="kpiImg">Image tokens</div></div>
              </div>
              <div class="charts">
                <div class="chart-card"><h4 data-i18n="chartDay">Daily token breakdown</h4><div class="chart-wrap"><canvas id="chartDay"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartTokMix">Token mix</h4><div class="chart-wrap"><canvas id="chartTokMix"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartModel">Model distribution</h4><div class="chart-wrap"><canvas id="chartModel"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartAccount">By account</h4><div class="chart-wrap"><canvas id="chartAccount"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartKey">By API key (tokens)</h4><div class="chart-wrap"><canvas id="chartKey"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartKeyInOut">By key · in / out</h4><div class="chart-wrap"><canvas id="chartKeyInOut"></canvas></div></div>
              </div>
            </div>
          </div>
        </section>

        <!-- LOGS -->
        <section class="view" id="view-logs">
          <div class="panel">
            <div class="panel-hd">
              <select id="logDay" class="select" style="min-width:130px"></select>
              <select id="logOk" class="select" style="min-width:100px">
                <option value="">All</option>
                <option value="true">OK</option>
                <option value="false">Fail</option>
              </select>
              <span class="mono" id="logDisk">–</span>
              <div class="spacer"></div>
              <button class="btn btn-secondary btn-sm" type="button" id="btnLogRefresh" data-i18n="refresh">Refresh</button>
              <button class="btn btn-danger btn-sm" type="button" id="btnLogClear" data-i18n="clearLogs">Clear logs</button>
            </div>
            <div id="msgLogs" class="msg"></div>
            <div style="overflow-x:auto">
              <table>
                <thead><tr>
                  <th data-i18n="colTime">Time</th>
                  <th data-i18n="colClient">Client</th>
                  <th data-i18n="colModel">Model</th>
                  <th data-i18n="colStatus">Status</th>
                  <th data-i18n="colTokens">Tokens</th>
                  <th data-i18n="colLatency">Latency</th>
                  <th data-i18n="colAccount">Account</th>
                  <th data-i18n="colKey">Key</th>
                </tr></thead>
                <tbody id="tbodyLogs"><tr><td colspan="8" class="empty">…</td></tr></tbody>
              </table>
            </div>
            <div class="pager" id="logPager"></div>
          </div>
        </section>

        <!-- CURL -->
        <section class="view" id="view-curl">
          <div class="panel">
            <div class="panel-bd">
              <div class="settings-row mb">
                <span class="mono" data-i18n="endpoint">Endpoint</span>
                <div class="seg" id="curlSeg">
                  <button type="button" data-ep="chat" class="on">chat/completions</button>
                  <button type="button" data-ep="responses">responses</button>
                  <button type="button" data-ep="models">models</button>
                </div>
                <div class="spacer" style="flex:1"></div>
                <button class="btn btn-secondary btn-sm" type="button" id="btnCopyCurl" data-i18n="copy">Copy</button>
              </div>
              <div class="mono" style="margin-bottom:8px" id="curlTitle">POST /v1/chat/completions</div>
              <pre class="curl-pre" id="curlBody"></pre>
            </div>
          </div>
        </section>

        <!-- SETTINGS -->
        <section class="view" id="view-settings">
          <div class="panel">
            <div class="panel-bd" style="display:grid;gap:18px">
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
              <div>
                <div style="font-weight:500;margin-bottom:8px" data-i18n="logSettings">Request log settings</div>
                <div class="settings-row">
                  <label class="mono" style="display:flex;align-items:center;gap:6px">
                    <input type="checkbox" id="logEnabled" /> <span data-i18n="logEnabled">Enable logging</span>
                  </label>
                  <label class="mono" style="display:flex;align-items:center;gap:6px">
                    <span data-i18n="logRetention">Retention (days)</span>
                    <input id="logRetention" class="input" type="number" min="1" max="365" style="min-width:80px;width:80px" />
                  </label>
                  <button class="btn" type="button" id="btnSaveLog" data-i18n="saveLog">Save</button>
                </div>
                <div class="hint" data-i18n="logHint">Logs stored as daily JSONL under data/logs · bodies capped at 1MB</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
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

  <div class="modal-mask" id="logModal">
    <div class="modal wide" role="dialog">
      <h3 data-i18n="logDetail">Request detail</h3>
      <div class="log-detail" id="logDetail"></div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="logClose" data-i18n="close">Close</button>
      </div>
    </div>
  </div>

  <script>
    const PAGE_SIZE = 8;
    const LOG_PAGE = 15;
    const PALETTE = ["#0070f3","#7928ca","#0a7a3e","#ab570a","#ee0000","#00a0a0","#333","#888"];
    const VIEW_META = {
      overview: { titleKey: "navOverview", subKey: "subOverview" },
      accounts: { titleKey: "navAccounts", subKey: "subAccounts" },
      keys: { titleKey: "navKeys", subKey: "subKeys" },
      usage: { titleKey: "navUsage", subKey: "subUsage" },
      logs: { titleKey: "navLogs", subKey: "subLogs" },
      curl: { titleKey: "navCurl", subKey: "subCurl" },
      settings: { titleKey: "navSettings", subKey: "subSettings" },
    };
    const I18N = {
      zh: {
        title:"账号池", subtitle:"SuperGrok OAuth 多账号 · 额度感知轮询 · OpenAI 兼容代理。",
        refresh:"刷新", adminTip:"管理口令",
        navOps:"运营", navAnalyze:"分析", navOps2:"运维",
        navOverview:"总览", navAccounts:"账号", navKeys:"API Keys", navUsage:"用量", navLogs:"日志", navCurl:"cURL", navSettings:"设置",
        subOverview:"状态一览与快捷入口", subAccounts:"OAuth 池 · 路由与额度", subKeys:"客户端鉴权密钥",
        subUsage:"Token / 次数 / 模型分布", subLogs:"完整请求排查（低频）", subCurl:"调用示例", subSettings:"代理与日志策略",
        viewMore:"查看详情 →", viewAllLogs:"全部日志 →",
        ovUsage:"近 7 日用量", ovQuick:"快捷操作", ovRecent:"最近请求",
        qaAcc:"添加 / 切换 / 查额度", qaKey:"签发客户端密钥", qaUsage:"图表与分布", qaLogs:"完整请求排查",
        adminExplain:"Admin Token 是什么？<br/><strong>只保护管理后台</strong>（添加账号、创建 Key 等 <code>/api/admin/*</code>）。与调用模型的 <code>API_KEY</code> 无关。<br/>仅当设置了环境变量 <code>ADMIN_TOKEN</code> 才需要填写。",
        adminExplainOpen:"当前<strong>未设置</strong> <code>ADMIN_TOKEN</code>，管理接口对本机开放。<br/>公网部署请设置 <code>ADMIN_TOKEN=xxx</code> 后启动。",
        proxyTitle:"出站代理", proxyAuto:"自动", proxyDirect:"直连", proxyCustom:"自定义",
        proxyHintAuto:(src,url)=>"当前生效："+(url||"直连")+"（来源："+src+"）",
        saveProxy:"保存", proxySaved:"代理已更新",
        logSettings:"请求日志", logEnabled:"启用日志", logRetention:"保留天数", saveLog:"保存日志设置",
        logHint:"按日 JSONL 存于 data/logs · 单条 body 上限 1MB · 超期自动清理",
        logSaved:"日志设置已保存",
        usageTitle:"分析", kpiReq:"请求数", kpiTok:"总 Token", kpiOk:"成功率", kpiLat:"平均延迟",
        kpiIn:"输入(未缓存)", kpiOut:"输出 Token", kpiCache:"缓存输入", kpiReason:"推理 Token", kpiImg:"图片 Token",
        chartDay:"每日 Token 构成", chartTokMix:"Token 构成", chartModel:"模型分布", chartAccount:"按账号", chartKey:"按 API Key（总 Token）",
        chartKeyInOut:"按 Key · 输入/输出",
        chartReq:"请求数", chartTok:"总 Token", chartIn:"输入(未缓存)", chartOut:"输出", chartCache:"缓存输入", chartReason:"推理",
        unrouted:"未路由(失败)", noKeyLabel:"无 Key", noModel:"无模型",
        clearLogs:"清理日志", clearLogsConfirm:"确定清理全部请求日志？", logsCleared:"日志已清理",
        logDetail:"请求详情", allDays:"全部日期", noLogs:"暂无请求日志",
        colTime:"时间", colClient:"客户端", colModel:"模型", colTokens:"Token", colLatency:"延迟",
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
        copy:"复制", copied:"已复制", endpoint:"接口",
        use:"使用", credits:"查额度", reset:"恢复", del:"删除",
        disable:"禁用", enable:"启用",
        noAccounts:"暂无账号，点击「添加账号」",
        noKeys:"暂无 API Key。创建前 /v1 可匿名访问；创建后必须 Bearer。",
        current:"当前", notChecked:"未查询",
        usedLeft:(u,r)=>u.toFixed(1)+"% 已用 · "+r.toFixed(1)+"% 剩余",
        src:{settings:"手动配置",direct:"直连",env:"环境变量",system:"系统代理",none:"无"},
        switchOk:"已切换（仅检查该账号额度）", addOk:"账号添加成功", keyCreated:"API Key 已创建",
        statAccounts:"账号", statActive:"可用", statReqs:"请求(7d)", statKeys:"API Key",
        pageOf:(c,t,n)=>"第 "+c+" / "+t+" 页 · 共 "+n+" 条", prev:"上一页", next:"下一页",
        diskInfo:(d,b)=>d+" 天 · "+b,
        sideHint:"日志在运维区 · 日常优先用总览/账号",
      },
      en: {
        title:"Account Pool", subtitle:"SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.",
        refresh:"Refresh", adminTip:"Admin password",
        navOps:"Operate", navAnalyze:"Analyze", navOps2:"Ops",
        navOverview:"Overview", navAccounts:"Accounts", navKeys:"API Keys", navUsage:"Usage", navLogs:"Logs", navCurl:"cURL", navSettings:"Settings",
        subOverview:"Status & shortcuts", subAccounts:"OAuth pool · routing & credits", subKeys:"Client auth keys",
        subUsage:"Tokens / calls / models", subLogs:"Full request debug (rare)", subCurl:"Call samples", subSettings:"Proxy & log policy",
        viewMore:"Details →", viewAllLogs:"All logs →",
        ovUsage:"Usage (7d)", ovQuick:"Quick actions", ovRecent:"Recent requests",
        qaAcc:"Add / switch / credits", qaKey:"Issue client keys", qaUsage:"Charts & mix", qaLogs:"Full request debug",
        adminExplain:"What is Admin Token?<br/><strong>Protects admin UI only</strong> (<code>/api/admin/*</code>). Unrelated to model <code>API_KEY</code>.<br/>Required only if server started with <code>ADMIN_TOKEN</code>.",
        adminExplainOpen:"<code>ADMIN_TOKEN</code> is <strong>not set</strong>. Admin APIs are open locally.<br/>For public deploy, set <code>ADMIN_TOKEN=xxx</code>.",
        proxyTitle:"Outbound proxy", proxyAuto:"Auto", proxyDirect:"Direct", proxyCustom:"Custom",
        proxyHintAuto:(src,url)=>"Active: "+(url||"direct")+" (source: "+src+")",
        saveProxy:"Save", proxySaved:"Proxy updated",
        logSettings:"Request logs", logEnabled:"Enable logging", logRetention:"Retention (days)", saveLog:"Save log settings",
        logHint:"Daily JSONL under data/logs · body capped at 1MB · auto cleanup by retention",
        logSaved:"Log settings saved",
        usageTitle:"Analytics", kpiReq:"Requests", kpiTok:"Total tokens", kpiOk:"Success rate", kpiLat:"Avg latency",
        kpiIn:"Input (uncached)", kpiOut:"Output tokens", kpiCache:"Cached input", kpiReason:"Reasoning", kpiImg:"Image tokens",
        chartDay:"Daily token breakdown", chartTokMix:"Token mix", chartModel:"Model distribution", chartAccount:"By account", chartKey:"By API key (total)",
        chartKeyInOut:"By key · in / out",
        chartReq:"Requests", chartTok:"Total", chartIn:"Input (uncached)", chartOut:"Output", chartCache:"Cached input", chartReason:"Reasoning",
        unrouted:"Unrouted (failed)", noKeyLabel:"No key", noModel:"No model",
        clearLogs:"Clear logs", clearLogsConfirm:"Clear ALL request logs?", logsCleared:"Logs cleared",
        logDetail:"Request detail", allDays:"All days", noLogs:"No request logs yet",
        colTime:"Time", colClient:"Client", colModel:"Model", colTokens:"Tokens", colLatency:"Latency",
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
        copy:"Copy", copied:"Copied", endpoint:"Endpoint",
        use:"Use", credits:"Credits", reset:"Reset", del:"Delete",
        disable:"Disable", enable:"Enable",
        noAccounts:"No accounts yet. Click Add account.",
        noKeys:"No API keys. /v1 is open until you create one; then Bearer is required.",
        current:"CURRENT", notChecked:"not checked",
        usedLeft:(u,r)=>u.toFixed(1)+"% used · "+r.toFixed(1)+"% left",
        src:{settings:"manual",direct:"direct",env:"env",system:"system",none:"none"},
        switchOk:"Switched (credits checked for this account only)", addOk:"Account added", keyCreated:"API key created",
        statAccounts:"Accounts", statActive:"Active", statReqs:"Requests (7d)", statKeys:"API Keys",
        pageOf:(c,t,n)=>"Page "+c+" / "+t+" · "+n+" total", prev:"Prev", next:"Next",
        diskInfo:(d,b)=>d+" days · "+b,
        sideHint:"Logs under Ops · daily work: Overview / Accounts",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let view = localStorage.getItem("grok_api_view") || "overview";
    let routing = { mode: "auto", currentAccountId: null };
    let meta = { adminTokenRequired: false, proxy: null, proxySource: "none", proxyConfigured: "", logRetentionDays: 7, logEnabled: true };
    let pollTimer = null;
    let curlEp = "chat";
    let proxyMode = "auto";
    let allAccounts = [];
    let allKeys = [];
    let accPage = 1;
    let keyPage = 1;
    let logPage = 1;
    let logTotal = 0;
    let logDays = [];
    let usageDays = 7;
    let charts = { day: null, model: null, account: null, key: null, overview: null, tokMix: null, keyInOut: null };
    let lastStats = null;

    const $ = (id) => document.getElementById(id);
    const t = (k, ...args) => {
      const v = I18N[lang][k];
      return typeof v === "function" ? v(...args) : (v ?? k);
    };

    function setView(name) {
      if (!VIEW_META[name]) name = "overview";
      view = name;
      localStorage.setItem("grok_api_view", name);
      document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("on", el.dataset.view === name));
      document.querySelectorAll(".view").forEach((el) => el.classList.toggle("on", el.id === "view-" + name));
      const m = VIEW_META[name];
      $("pageTitle").textContent = t(m.titleKey);
      $("pageSub").textContent = t(m.subKey);
      $("side").classList.remove("open");
      if (name === "usage" || name === "overview") {
        // redraw charts when becoming visible
        if (lastStats) {
          if (name === "usage") paintCharts(lastStats);
          if (name === "overview") paintOverviewChart(lastStats);
        }
      }
    }

    function applyI18n() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-placeholder")); });
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      $("adminTip").textContent = t("adminTip");
      $("adminToken").placeholder = t("adminTip");
      $("sideFoot").textContent = t("sideHint");
      paintAdminExplain();
      paintProxyUI();
      paintCurl();
      paintMode();
      paintLogDaySelect();
      setView(view);
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
      if (proxyMode === "custom" && !$("proxyUrl").matches(":focus")) $("proxyUrl").value = meta.proxyConfigured || "";
      const srcMap = I18N[lang].src || {};
      const src = srcMap[meta.proxySource] || meta.proxySource;
      $("proxyHint").textContent = t("proxyHintAuto", src, meta.proxy || "");
      $("logEnabled").checked = meta.logEnabled !== false;
      if (!$("logRetention").matches(":focus")) $("logRetention").value = meta.logRetentionDays || 7;
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
    function fmtNum(n) {
      if (n == null || !Number.isFinite(n)) return "–";
      if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
      return String(Math.round(n));
    }
    function fmtBytes(b) {
      if (b < 1024) return b + " B";
      if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
      return (b / 1048576).toFixed(1) + " MB";
    }

    function paintCurl() {
      const b = baseUrl();
      const map = {
        chat: {
          title: "POST /v1/chat/completions",
          body: ["curl " + b + "/v1/chat/completions \\\\",'  -H "Authorization: Bearer $API_KEY" \\\\','  -H "Content-Type: application/json" \\\\','  -d \\'{"model":"grok-4.5","messages":[{"role":"user","content":"hello"}]}\\''].join("\\n")
        },
        responses: {
          title: "POST /v1/responses",
          body: ["curl " + b + "/v1/responses \\\\",'  -H "Authorization: Bearer $API_KEY" \\\\','  -H "Content-Type: application/json" \\\\','  -d \\'{"model":"grok-4.5","input":"hello"}\\''].join("\\n")
        },
        models: {
          title: "GET /v1/models",
          body: ["curl " + b + "/v1/models \\\\",'  -H "Authorization: Bearer $API_KEY"'].join("\\n")
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

    function renderPager(el, page, totalItems, pageSize, onPage) {
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
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
      accPage = renderPager($("accPager"), accPage, allAccounts.length, PAGE_SIZE, (p) => { accPage = p; renderAccounts(); });
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
      keyPage = renderPager($("keyPager"), keyPage, allKeys.length, PAGE_SIZE, (p) => { keyPage = p; renderKeys(); });
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

    function paintLogDaySelect() {
      const sel = $("logDay");
      const cur = sel.value;
      sel.innerHTML = '<option value="">' + esc(t("allDays")) + "</option>" +
        logDays.map((d) => '<option value="' + esc(d) + '">' + esc(d) + "</option>").join("");
      if (cur && logDays.includes(cur)) sel.value = cur;
    }

    function clientLabel(r) {
      return r.client || r.userAgent || "–";
    }
    function fmtUsageShort(u) {
      if (!u || (u.totalTokens == null && u.promptTokens == null)) return "–";
      const parts = [];
      if (u.promptTokens != null) parts.push("in " + fmtNum(u.promptTokens));
      if (u.cachedTokens) parts.push("cache " + fmtNum(u.cachedTokens));
      if (u.completionTokens != null) parts.push("out " + fmtNum(u.completionTokens));
      if (u.reasoningTokens) parts.push("r " + fmtNum(u.reasoningTokens));
      if (!parts.length && u.totalTokens != null) return fmtNum(u.totalTokens);
      return parts.join(" · ") || "–";
    }
    function fmtUsageDetail(u) {
      if (!u) return "–";
      const rows = [
        ["input", u.promptTokens],
        ["cached", u.cachedTokens],
        ["text", u.textTokens],
        ["image", u.imageTokens],
        ["audio(in)", u.audioTokens],
        ["output", u.completionTokens],
        ["reasoning", u.reasoningTokens],
        ["audio(out)", u.completionAudioTokens],
        ["pred.accept", u.acceptedPredictionTokens],
        ["pred.reject", u.rejectedPredictionTokens],
        ["total", u.totalTokens],
        ["sources", u.numSourcesUsed],
        ["cost_ticks", u.costInUsdTicks],
      ];
      return rows.filter(([, v]) => v != null && v !== 0).map(([k, v]) => k + "=" + v).join(" · ") ||
        rows.filter(([, v]) => v != null).map(([k, v]) => k + "=" + v).join(" · ") || "–";
    }

    function renderLogs(items) {
      const tbody = $("tbodyLogs");
      if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">' + esc(t("noLogs")) + "</td></tr>";
        $("logPager").innerHTML = "";
        return;
      }
      logPage = renderPager($("logPager"), logPage, logTotal, LOG_PAGE, (p) => { logPage = p; loadLogs(); });
      tbody.innerHTML = items.map((r) => {
        const tok = fmtUsageShort(r.usage);
        const stCls = r.ok ? "active" : "error";
        const client = clientLabel(r);
        const uaTip = r.userAgent ? ' title="' + esc(r.userAgent) + '"' : "";
        return '<tr class="clickable" data-id="' + esc(r.id) + '">' +
          '<td class="mono">' + esc(fmtTime(r.ts)) + (r.stream ? ' <span class="badge">stream</span>' : "") + "</td>" +
          '<td' + uaTip + '><div class="name">' + esc(client) + '</div>' +
          (r.userAgent && r.client && r.userAgent !== r.client ? '<div class="mono" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.userAgent) + "</div>" : "") +
          "</td>" +
          '<td><div class="name">' + esc(r.model || "–") + '</div><div class="mono">' + esc(r.mode) + "</div></td>" +
          '<td><span class="badge ' + stCls + '">' + esc(r.status) + "</span></td>" +
          '<td class="mono" style="white-space:nowrap">' + tok + "</td>" +
          '<td class="mono">' + (r.latencyMs != null ? r.latencyMs + "ms" : "–") + "</td>" +
          '<td class="mono">' + esc(r.accountName || r.accountId || "–") + "</td>" +
          '<td class="mono">' + esc(r.apiKeyAlias || r.apiKeyId || "–") + "</td>" +
          "</tr>";
      }).join("");
      tbody.querySelectorAll("tr[data-id]").forEach((tr) => {
        tr.addEventListener("click", () => openLogDetail(tr.getAttribute("data-id")));
      });
    }

    function renderOverviewRecent(items) {
      const el = $("ovRecent");
      if (!items || !items.length) {
        el.innerHTML = '<div class="mono" style="padding:8px 0">' + esc(t("noLogs")) + "</div>";
        return;
      }
      el.innerHTML = items.slice(0, 5).map((r) => {
        const st = r.ok ? "active" : "error";
        const client = clientLabel(r);
        return '<div class="quick-row clickable" data-id="' + esc(r.id) + '">' +
          '<div><div class="name">' + esc(r.model || "–") + ' · ' + esc(client) + '</div><div class="mono">' + esc(fmtTime(r.ts)) + "</div></div>" +
          '<div style="text-align:right"><span class="badge ' + st + '">' + esc(r.status) + '</span>' +
          '<div class="mono">' + (r.usage ? fmtUsageShort(r.usage) : ((r.latencyMs || 0) + "ms")) + "</div></div></div>";
      }).join("");
      el.querySelectorAll("[data-id]").forEach((row) => {
        row.addEventListener("click", () => openLogDetail(row.getAttribute("data-id")));
      });
    }

    function destroyChart(key) {
      if (charts[key]) { charts[key].destroy(); charts[key] = null; }
    }

    function localBucketLabel(label) {
      if (label === "(unrouted)") return t("unrouted");
      if (label === "(no key)") return t("noKeyLabel");
      if (label === "(no model)") return t("noModel");
      return label;
    }

    const legendOpts = {
      position: "top",
      align: "end",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        boxWidth: 7,
        boxHeight: 7,
        padding: 14,
        color: "#4d4d4d",
        font: { size: 12, family: "Geist, Inter, system-ui, sans-serif", weight: "500" }
      }
    };

    const TOK_COLORS = {
      in: "#0070f3",
      cache: "#00a0a0",
      out: "#7928ca",
      reason: "#ab570a",
      req: "#171717",
    };

    /**
     * Split bucket totals into non-overlapping chart segments.
     * prompt_tokens already includes cached_tokens — never chart both as full input.
     * reasoning may be inside completion_tokens OR additive (xAI varies).
     */
    function tokenSegments(b) {
      const prompt = b.promptTokens || 0;
      const cached = Math.min(b.cachedTokens || 0, prompt);
      const completion = b.completionTokens || 0;
      const reasoning = b.reasoningTokens || 0;
      const total = b.totalTokens || 0;
      const uncachedIn = Math.max(0, prompt - cached);

      const sumPC = prompt + completion;
      const sumPCR = prompt + completion + reasoning;
      // Prefer decomposition that best matches total_tokens
      const reasoningOutside =
        reasoning > 0 &&
        total > 0 &&
        Math.abs(sumPCR - total) + 1 < Math.abs(sumPC - total);

      let outNonReason, reasonSeg;
      if (reasoningOutside) {
        outNonReason = completion;
        reasonSeg = reasoning;
      } else {
        reasonSeg = Math.min(reasoning, completion);
        outNonReason = Math.max(0, completion - reasonSeg);
      }
      return { uncachedIn, cached, outNonReason, reasonSeg, prompt, completion };
    }

    function stackedTokDatasets(rows, withReqLine) {
      const segs = rows.map(tokenSegments);
      const ds = [
        {
          type: "bar",
          label: t("chartIn"),
          data: segs.map((s) => s.uncachedIn),
          backgroundColor: "rgba(0,112,243,.75)",
          borderWidth: 0,
          stack: "tok",
          yAxisID: "y",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        },
        {
          type: "bar",
          label: t("chartCache"),
          data: segs.map((s) => s.cached),
          backgroundColor: "rgba(0,160,160,.75)",
          borderWidth: 0,
          stack: "tok",
          yAxisID: "y",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        },
        {
          type: "bar",
          label: t("chartOut"),
          data: segs.map((s) => s.outNonReason),
          backgroundColor: "rgba(121,40,202,.75)",
          borderWidth: 0,
          stack: "tok",
          yAxisID: "y",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        },
        {
          type: "bar",
          label: t("chartReason"),
          data: segs.map((s) => s.reasonSeg),
          backgroundColor: "rgba(171,87,10,.8)",
          borderWidth: 0,
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
          stack: "tok",
          yAxisID: "y",
          order: 2,
          barPercentage: 0.7,
          categoryPercentage: 0.75
        }
      ];
      if (withReqLine) {
        ds.push({
          type: "line",
          label: t("chartReq"),
          data: rows.map((d) => d.requests),
          borderColor: TOK_COLORS.req,
          backgroundColor: TOK_COLORS.req,
          tension: .35,
          yAxisID: "y1",
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderColor: TOK_COLORS.req,
          pointBorderWidth: 2,
          borderWidth: 2,
          order: 1
        });
      }
      return ds;
    }

    function paintOverviewChart(stats) {
      if (typeof Chart === "undefined") return;
      const dayLabels = stats.byDay.map((d) => d.label.slice(5));
      destroyChart("overview");
      charts.overview = new Chart($("chartOverview"), {
        type: "bar",
        data: { labels: dayLabels, datasets: stackedTokDatasets(stats.byDay, false) },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: true, ...legendOpts },
            tooltip: { backgroundColor: "#171717", cornerRadius: 8, padding: 10, usePointStyle: true, boxWidth: 8, boxHeight: 8 }
          },
          scales: {
            y: { stacked: true, display: true, grid: { color: "rgba(0,0,0,.04)", drawBorder: false }, ticks: { font: { size: 10 }, color: "#888" } },
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, color: "#888" } }
          }
        }
      });
    }

    function paintCharts(stats) {
      if (typeof Chart === "undefined") return;
      const dayLabels = stats.byDay.map((d) => d.label.slice(5));
      const s = stats.summary;
      const tip = { backgroundColor: "#171717", cornerRadius: 8, padding: 10, usePointStyle: true, boxWidth: 8, boxHeight: 8 };
      const hBar = {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, ...legendOpts }, tooltip: tip },
        scales: {
          x: { stacked: true, grid: { color: "rgba(0,0,0,.04)", drawBorder: false }, ticks: { font: { size: 10 }, color: "#888" } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, color: "#4d4d4d" } }
        }
      };

      destroyChart("day");
      charts.day = new Chart($("chartDay"), {
        type: "bar",
        data: { labels: dayLabels, datasets: stackedTokDatasets(stats.byDay, true) },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: true, ...legendOpts }, tooltip: tip },
          scales: {
            y: {
              stacked: true, position: "left",
              grid: { color: "rgba(0,0,0,.04)", drawBorder: false },
              ticks: { font: { size: 10 }, color: "#888", padding: 6 },
              title: { display: true, text: t("chartTok"), color: "#888", font: { size: 11, weight: "500" } }
            },
            y1: {
              position: "right", grid: { drawOnChartArea: false },
              ticks: { font: { size: 10 }, color: "#888", padding: 6 },
              title: { display: true, text: t("chartReq"), color: "#888", font: { size: 11, weight: "500" } }
            },
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: "#888" } }
          }
        }
      });

      // Token mix — non-overlapping segments
      destroyChart("tokMix");
      const mix = tokenSegments(s);
      charts.tokMix = new Chart($("chartTokMix"), {
        type: "doughnut",
        data: {
          labels: [t("chartIn"), t("chartCache"), t("chartOut"), t("chartReason")],
          datasets: [{
            data: [mix.uncachedIn, mix.cached, mix.outNonReason, mix.reasonSeg],
            backgroundColor: [TOK_COLORS.in, TOK_COLORS.cache, TOK_COLORS.out, TOK_COLORS.reason],
            borderWidth: 2, borderColor: "#fff", hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "58%",
          plugins: {
            legend: {
              position: "right",
              labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 12, color: "#4d4d4d", font: { size: 11 } }
            },
            tooltip: tip
          }
        }
      });

      destroyChart("model");
      const models = stats.byModel.slice(0, 8);
      charts.model = new Chart($("chartModel"), {
        type: "doughnut",
        data: {
          labels: models.map((m) => localBucketLabel(m.label)),
          datasets: [{
            data: models.map((m) => m.requests),
            backgroundColor: models.map((_, i) => PALETTE[i % PALETTE.length]),
            borderWidth: 2, borderColor: "#fff", hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "62%",
          plugins: {
            legend: {
              position: "right",
              labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 12, color: "#4d4d4d", font: { size: 11 } }
            }
          }
        }
      });

      destroyChart("account");
      const accs = [...stats.byAccount].sort((a, b) => {
        if (a.key === "__unrouted__") return 1;
        if (b.key === "__unrouted__") return -1;
        return b.totalTokens - a.totalTokens || b.requests - a.requests;
      }).slice(0, 8);
      const accSeg = accs.map(tokenSegments);
      charts.account = new Chart($("chartAccount"), {
        type: "bar",
        data: {
          labels: accs.map((a) => localBucketLabel(a.label)),
          datasets: [
            { label: t("chartIn"), data: accSeg.map((s) => s.uncachedIn), backgroundColor: "rgba(0,112,243,.75)", stack: "t", borderWidth: 0 },
            { label: t("chartCache"), data: accSeg.map((s) => s.cached), backgroundColor: "rgba(0,160,160,.75)", stack: "t", borderWidth: 0 },
            { label: t("chartOut"), data: accSeg.map((s) => s.outNonReason), backgroundColor: "rgba(121,40,202,.75)", stack: "t", borderWidth: 0 },
            { label: t("chartReason"), data: accSeg.map((s) => s.reasonSeg), backgroundColor: "rgba(171,87,10,.8)", stack: "t", borderWidth: 0, borderRadius: 4 }
          ]
        },
        options: hBar
      });

      destroyChart("key");
      const keys = [...stats.byKey].sort((a, b) => {
        if (a.key === "__no_key__") return 1;
        if (b.key === "__no_key__") return -1;
        return b.totalTokens - a.totalTokens;
      }).slice(0, 8);
      charts.key = new Chart($("chartKey"), {
        type: "bar",
        data: {
          labels: keys.map((k) => localBucketLabel(k.label)),
          datasets: [{
            data: keys.map((k) => k.totalTokens),
            backgroundColor: keys.map((k) => k.key === "__no_key__" ? "rgba(136,136,136,.25)" : "rgba(171,87,10,.35)"),
            borderWidth: 0, borderRadius: 5, barPercentage: 0.7
          }]
        },
        options: {
          indexAxis: "y", responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tip },
          scales: {
            x: { grid: { color: "rgba(0,0,0,.04)", drawBorder: false }, ticks: { font: { size: 10 }, color: "#888" } },
            y: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#4d4d4d" } }
          }
        }
      });

      // Stacked composition — 输入 = 非缓存部分，不再把 prompt_tokens 整段当「输入」
      destroyChart("keyInOut");
      const keySeg = keys.map(tokenSegments);
      charts.keyInOut = new Chart($("chartKeyInOut"), {
        type: "bar",
        data: {
          labels: keys.map((k) => localBucketLabel(k.label)),
          datasets: [
            { label: t("chartIn"), data: keySeg.map((s) => s.uncachedIn), backgroundColor: "rgba(0,112,243,.75)", stack: "tok", borderWidth: 0 },
            { label: t("chartCache"), data: keySeg.map((s) => s.cached), backgroundColor: "rgba(0,160,160,.75)", stack: "tok", borderWidth: 0 },
            { label: t("chartOut"), data: keySeg.map((s) => s.outNonReason), backgroundColor: "rgba(121,40,202,.75)", stack: "tok", borderWidth: 0 },
            { label: t("chartReason"), data: keySeg.map((s) => s.reasonSeg), backgroundColor: "rgba(171,87,10,.8)", stack: "tok", borderWidth: 0, borderRadius: 4 }
          ]
        },
        options: hBar
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

    async function loadUsage() {
      try {
        const res = await fetch("/api/admin/usage?days=" + usageDays, { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        lastStats = data.stats;
        const s = data.stats.summary;
        const seg = tokenSegments(s);
        $("uReq").textContent = fmtNum(s.requests);
        // 输入 KPI = 未缓存；缓存单独一格（prompt 含 cache，不能两边都当「全量输入」）
        $("uIn").textContent = fmtNum(seg.uncachedIn);
        $("uCache").textContent = fmtNum(seg.cached);
        $("uOut").textContent = fmtNum(s.completionTokens);
        $("uReason").textContent = fmtNum(s.reasoningTokens);
        $("uTok").textContent = fmtNum(s.totalTokens);
        $("uOk").textContent = s.requests ? Math.round((s.ok / s.requests) * 100) + "%" : "–";
        $("uLat").textContent = s.avgLatencyMs != null ? s.avgLatencyMs + "ms" : "–";
        $("uImg").textContent = fmtNum(s.imageTokens);
        $("rangeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", Number(b.dataset.days) === usageDays));

        $("sReq").textContent = fmtNum(s.requests);
        $("ovReq").textContent = fmtNum(s.requests);
        $("ovIn").textContent = fmtNum(seg.uncachedIn);
        $("ovOut").textContent = fmtNum(s.completionTokens);
        $("ovCache").textContent = t("kpiCache") + " " + fmtNum(seg.cached);
        $("ovReason").textContent = t("kpiReason") + " " + fmtNum(s.reasoningTokens);

        if (view === "usage") paintCharts(data.stats);
        if (view === "overview") paintOverviewChart(data.stats);
      } catch {}
    }

    async function loadLogs() {
      try {
        const day = $("logDay").value;
        const ok = $("logOk").value;
        const qs = new URLSearchParams({ page: String(logPage), limit: String(LOG_PAGE) });
        if (day) qs.set("day", day);
        if (ok) qs.set("ok", ok);
        const res = await fetch("/api/admin/logs?" + qs.toString(), { headers: headers() });
        if (!res.ok) { showMsg($("msgLogs"), "HTTP " + res.status, "err"); return; }
        const data = await res.json();
        logTotal = data.total || 0;
        logDays = data.days || [];
        paintLogDaySelect();
        if (data.disk) $("logDisk").textContent = t("diskInfo", data.disk.days, fmtBytes(data.disk.bytes));
        renderLogs(data.items || []);
        if (view === "overview" || !day) renderOverviewRecent(data.items || []);
      } catch (e) {
        showMsg($("msgLogs"), String(e.message || e), "err");
      }
    }

    async function openLogDetail(id) {
      try {
        const res = await fetch("/api/admin/logs/" + encodeURIComponent(id), { headers: headers() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const log = data.log;
        const u = log.usage || {};
        $("logDetail").innerHTML =
          '<div class="log-meta">' +
          '<div><div class="k">id</div><div class="v">' + esc(log.id) + "</div></div>" +
          '<div><div class="k">time</div><div class="v">' + esc(fmtTime(log.ts)) + "</div></div>" +
          '<div><div class="k">client</div><div class="v">' + esc(log.client || "–") + "</div></div>" +
          '<div><div class="k">user-agent</div><div class="v">' + esc(log.userAgent || "–") + "</div></div>" +
          '<div><div class="k">model</div><div class="v">' + esc(log.model || "–") + (log.reasoningEffort ? " · effort=" + esc(log.reasoningEffort) : "") + "</div></div>" +
          '<div><div class="k">status</div><div class="v">' + esc(log.status) + " · " + (log.ok ? "ok" : "fail") + " · " + esc(log.latencyMs) + "ms" + (log.stream ? " · stream" : "") + "</div></div>" +
          '<div><div class="k">account</div><div class="v">' + esc(log.accountName || "–") + " / " + esc(log.accountId || "–") + "</div></div>" +
          '<div><div class="k">api key</div><div class="v">' + esc(log.apiKeyAlias || "–") + " / " + esc(log.apiKeyId || "–") + "</div></div>" +
          '<div style="grid-column:1/-1"><div class="k">tokens</div><div class="v">' + esc(fmtUsageDetail(u)) + "</div></div>" +
          (log.error ? '<div style="grid-column:1/-1"><div class="k">error</div><div class="v" style="color:var(--error)">' + esc(log.error) + "</div></div>" : "") +
          "</div>" +
          "<div><div class=\\"k\\" style=\\"color:var(--mute);font-size:12px;margin-bottom:6px\\">headers</div><pre>" + esc(JSON.stringify(log.headers || {}, null, 2)) + "</pre></div>" +
          "<div><div class=\\"k\\" style=\\"color:var(--mute);font-size:12px;margin-bottom:6px\\">request" + (log.requestTruncated ? " (truncated)" : "") + "</div><pre>" + esc(JSON.stringify(log.request, null, 2)) + "</pre></div>" +
          "<div><div class=\\"k\\" style=\\"color:var(--mute);font-size:12px;margin-bottom:6px\\">response" + (log.responseTruncated ? " (truncated)" : "") + "</div><pre>" + esc(typeof log.response === "string" ? log.response : JSON.stringify(log.response ?? null, null, 2)) + "</pre></div>";
        $("logModal").classList.add("show");
      } catch (e) {
        showMsg($("msgLogs"), e.message, "err");
      }
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
    $("logClose").onclick = () => $("logModal").classList.remove("show");
    $("logModal").addEventListener("click", (e) => { if (e.target === $("logModal")) $("logModal").classList.remove("show"); });
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

    // navigation
    document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });
    document.querySelectorAll("[data-goto]").forEach((el) => {
      el.addEventListener("click", () => setView(el.getAttribute("data-goto")));
    });
    $("btnSide").onclick = () => $("side").classList.toggle("open");

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
      else value = "";
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
    $("btnSaveLog").onclick = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({
            logEnabled: $("logEnabled").checked,
            logRetentionDays: Number($("logRetention").value) || 7,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.logEnabled = data.settings.logEnabled;
        meta.logRetentionDays = data.settings.logRetentionDays;
        paintProxyUI();
        showMsg($("msgLogs"), t("logSaved"), "ok");
        await loadLogs();
      } catch (e) { showMsg($("msgLogs"), e.message, "err"); }
    };
    $("rangeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-days]");
      if (!b) return;
      usageDays = Number(b.dataset.days) || 7;
      loadUsage();
    });
    $("logDay").onchange = () => { logPage = 1; loadLogs(); };
    $("logOk").onchange = () => { logPage = 1; loadLogs(); };
    $("btnLogRefresh").onclick = () => loadLogs();
    $("btnLogClear").onclick = async () => {
      if (!confirm(t("clearLogsConfirm"))) return;
      try {
        const res = await fetch("/api/admin/logs", {
          method: "DELETE", headers: jsonHeaders(),
          body: JSON.stringify({ all: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgLogs"), t("logsCleared"), "ok");
        logPage = 1;
        await Promise.all([loadLogs(), loadUsage()]);
      } catch (e) { showMsg($("msgLogs"), e.message, "err"); }
    };

    $("btnAdd").onclick = addOAuth;
    $("btnRefresh").onclick = () => { hideMsg($("msg")); hideMsg($("msgKeys")); hideMsg($("msgLogs")); loadAll(); };
    $("adminToken").onchange = loadAll;

    async function loadAll() {
      await loadMeta();
      applyI18n();
      await Promise.all([loadAccounts(), loadKeys(), loadUsage(), loadLogs()]);
      paintCurl();
    }
    loadAll();
  </script>
</body>
</html>`;
}
