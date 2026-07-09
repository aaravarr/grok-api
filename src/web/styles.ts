export function styles(): string {
  return `
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-Medium.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-SemiBold.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist Mono";src:url("/static/fonts/GeistMono-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist Mono";src:url("/static/fonts/GeistMono-Medium.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
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
    .nav-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;text-align:left;padding:9px 12px;border-radius:8px;color:var(--body);font-weight:500;font-size:13.5px;text-decoration:none;transition:background .15s var(--ease),color .15s var(--ease),box-shadow .15s var(--ease)}
    .nav-item:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .nav-item.on,.nav-item.on:hover{background:var(--ink);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12)}
    .nav-item .ic{width:18px;height:18px;flex-shrink:0;display:grid;place-items:center;opacity:.72}
    .nav-item .ic svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
    .nav-item:hover .ic,.nav-item.on .ic{opacity:1}
    .side-foot{margin-top:auto;padding:12px 10px 6px;border-top:1px solid var(--hairline);font-size:11px;color:var(--mute);line-height:1.45}

    .main-wrap{min-width:0;width:100%;display:flex;flex-direction:column;min-height:100dvh}
    .topbar{height:var(--top);border-bottom:1px solid var(--hairline);background:rgba(255,255,255,.92);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:20;gap:12px}
    .topbar-left{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
    .topbar-titles{display:flex;align-items:baseline;gap:10px;min-width:0;overflow:hidden}
    .page-title{font-weight:600;font-size:15px;letter-spacing:-.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .page-sub{color:var(--mute);font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .top-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
    .content{padding:24px 28px 72px;width:100%;max-width:none;flex:1;min-width:0}

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
    .toast{
      display:none;position:fixed;top:calc(var(--top) + 14px);left:50%;z-index:45;
      min-width:260px;max-width:min(440px,calc(100vw - 32px));
      padding:12px 16px;border-radius:10px;border:1px solid var(--hairline);background:#fff;
      box-shadow:0 10px 30px rgba(0,0,0,.12);font-size:13px;line-height:1.45;color:var(--body);
      white-space:pre-wrap;word-break:break-word;pointer-events:none;
      opacity:0;transform:translate(-50%,-8px);transition:opacity .18s var(--ease),transform .18s var(--ease);
    }
    .toast.show{display:block;opacity:1;transform:translate(-50%,0);pointer-events:auto}
    .toast.ok{background:var(--success-bg);border-color:#b7e4c7;color:var(--success)}
    .toast.err{background:var(--error-bg);border-color:#f0b8bb;color:var(--error)}
    .codebox{display:none;margin:12px 16px 0;padding:16px;border-radius:8px;border:1px dashed var(--hairline-strong);background:var(--canvas-soft)}
    .codebox.show{display:block}.codebox .label{color:var(--mute);font-size:12px;margin-bottom:8px}
    .codebox .code{font-family:var(--mono);font-size:28px;font-weight:500;letter-spacing:.14em}

    /* CSS Grid data tables — shared fixed tracks so every row aligns */
    .dt{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
    .dt-head,.dt-row{
      display:grid;align-items:center;column-gap:0;
      border-bottom:1px solid var(--hairline);
      width:100%;
      box-sizing:border-box;
    }
    .dt-head{background:#fafafa;position:sticky;top:0;z-index:1}
    .dt-head > div{
      padding:10px 14px;color:var(--mute);font-weight:500;font-size:12px;white-space:nowrap;
    }
    .dt-row > div{padding:12px 14px;font-size:13px;min-width:0}
    .dt-row:hover{background:var(--canvas-soft)}
    .dt-row.current{background:#f0f7ff;box-shadow:inset 3px 0 0 var(--link)}
    .dt-body > .dt-row:last-child{border-bottom:0}
    .dt-row.clickable{cursor:pointer}
    .dt-empty{padding:40px 16px;text-align:center;color:var(--mute);font-size:13px}
    .dt-actions{display:flex;flex-wrap:nowrap;gap:6px;align-items:center}
    .dt-actions .btn{flex-shrink:0}
    .dt-time{display:flex;flex-direction:column;align-items:flex-start;gap:4px;overflow:hidden;font-variant-numeric:tabular-nums;font-family:var(--mono);font-size:12px;color:var(--mute)}
    .dt-time-main{white-space:nowrap}
    /*
      Fixed track sizes (no max-content): each row is its own grid, so fr/max-content
      would size independently and columns drift. Use the same explicit template for head+rows.
    */
    .dt-accounts{--dt-cols:minmax(0,1.6fr) 100px minmax(0,1.2fr) 56px 150px 252px;min-width:820px}
    .dt-users{--dt-cols:minmax(0,1.4fr) 88px 88px minmax(0,1.1fr) 118px 220px;min-width:860px}
    .dt-keys{--dt-cols:minmax(0,1.3fr) minmax(0,1fr) 88px 140px 56px 160px;min-width:780px}
    .dt-logs{--dt-cols:118px minmax(0,1fr) minmax(0,1fr) 72px minmax(0,1.2fr) 80px minmax(0,.9fr) minmax(0,.9fr);min-width:960px}
    .dt-logs.no-account{--dt-cols:118px minmax(0,1fr) minmax(0,1fr) 72px minmax(0,1.2fr) 80px minmax(0,1fr);min-width:820px}
    .dt-accounts .dt-head,.dt-accounts .dt-row,
    .dt-users .dt-head,.dt-users .dt-row,
    .dt-keys .dt-head,.dt-keys .dt-row,
    .dt-logs .dt-head,.dt-logs .dt-row{
      grid-template-columns:var(--dt-cols);
    }
    .badge{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font-size:12px;font-weight:500;background:var(--canvas-soft-2);color:var(--body);border:1px solid var(--hairline);max-width:100%}
    .badge.active{background:var(--success-bg);color:var(--success);border-color:#b7e4c7}
    .badge.exhausted{background:var(--violet-bg);color:var(--violet);border-color:#d8ccf1}
    .badge.expired,.badge.error{background:var(--error-bg);color:var(--error);border-color:#f0b8bb}
    .badge.current{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .mono{font-family:var(--mono);font-size:12px;color:var(--mute)}.name{font-weight:500;color:var(--ink)}
    .actions{display:flex;flex-wrap:nowrap;gap:6px;align-items:center}
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
    .quick-actions.user-only{grid-template-columns:1fr 1fr}
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
    .side-toggle{display:none;width:36px;height:36px;min-width:36px;padding:0;flex-shrink:0;align-items:center;justify-content:center}
    .side-scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.36);z-index:25;backdrop-filter:blur(1px)}
    .side-scrim.show{display:block}
    .auth-gate{position:fixed;inset:0;z-index:100;background:var(--canvas-soft);display:flex;align-items:center;justify-content:center;padding:24px}
    .auth-gate.hidden{display:none}
    .auth-card{width:min(400px,100%);background:#fff;border:1px solid var(--hairline);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.08);padding:28px 24px}
    .auth-card h1{margin:0 0 6px;font-size:22px;letter-spacing:-.6px}
    .auth-card .sub{color:var(--mute);font-size:13px;margin-bottom:18px;line-height:1.5}
    .auth-card .field{margin-bottom:12px}
    .auth-card label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
    .auth-card .input{width:100%}
    .auth-card .actions{display:flex;flex-direction:column;gap:8px;margin-top:16px}
    .auth-card .actions .btn{width:100%;height:36px}
    .auth-card .switch{text-align:center;font-size:13px;color:var(--mute);margin-top:12px}
    .auth-card .switch a{cursor:pointer}
    .auth-msg{display:none;margin-bottom:12px;padding:10px;border-radius:8px;font-size:13px}
    .auth-msg.show{display:block}.auth-msg.err{background:var(--error-bg);color:var(--error)}.auth-msg.ok{background:var(--success-bg);color:var(--success)}
    .user-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;background:var(--canvas-soft);border:1px solid var(--hairline);font-size:12px;color:var(--body)}
    .user-chip strong{color:var(--ink);font-weight:500}
    [data-admin-only].hide{display:none!important}
    

    @media(max-width:1100px){
      .stats{grid-template-columns:repeat(2,1fr)}
      .usage-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
      .usage-kpis.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
      .grid-2,.charts{grid-template-columns:1fr}
    }
    @media(max-width:960px){
      .app{grid-template-columns:1fr}
      .side{
        position:fixed;left:0;top:0;transform:translateX(-100%);
        transition:transform .22s var(--ease);width:min(300px,86vw);
        box-shadow:8px 0 32px rgba(0,0,0,.12);padding-top:max(14px,env(safe-area-inset-top));
        padding-bottom:max(10px,env(safe-area-inset-bottom));
      }
      .side.open{transform:none}
      .side-toggle{display:inline-flex}
      .main-wrap{min-width:0;width:100%}
      .topbar{
        height:auto;min-height:var(--top);padding:10px 16px;
        padding-top:max(10px,env(safe-area-inset-top));
        gap:8px;flex-wrap:nowrap;
      }
      .topbar-left{gap:8px;min-width:0}
      .topbar-titles{flex-direction:column;align-items:flex-start;gap:1px}
      .page-title{font-size:15px;line-height:1.2}
      .page-sub{display:none}
      .top-actions{gap:6px}
      .top-actions .user-chip span{display:none}
      .top-actions .user-chip{max-width:96px;overflow:hidden}
      .top-actions .user-chip strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px}
      .content{
        padding:16px 16px 88px;
        padding-left:max(16px,env(safe-area-inset-left));
        padding-right:max(16px,env(safe-area-inset-right));
        padding-bottom:max(88px,calc(24px + env(safe-area-inset-bottom)));
      }
      .panel,.card,.contrib-hero,.rank-me{border-radius:12px}
      .panel-hd,.card-hd,.routing-bar{padding:12px 14px;gap:8px}
      .panel-bd,.card-bd{padding:14px}
      .stats{gap:10px;margin-bottom:14px}
      .stat{padding:14px}
      .stat .n{font-size:22px;line-height:28px}
      .input,.select{min-width:0}
      .input.grow{min-width:0;width:100%}
      .settings-row{flex-direction:column;align-items:stretch}
      .settings-row .btn,.settings-row .seg{width:100%}
      .settings-row .seg button{flex:1}
      #proxyCustomWrap.show{width:100%}
      .log-meta{grid-template-columns:1fr}
      .dt-actions{flex-wrap:wrap}
      .dt-accounts{--dt-cols:minmax(0,1.4fr) 90px minmax(0,1.1fr) 48px 120px 200px;min-width:680px}
      .dt-users{--dt-cols:minmax(0,1.2fr) 80px 80px minmax(0,1fr) 100px 200px;min-width:760px}
      .toast{top:max(12px,calc(env(safe-area-inset-top) + 8px));left:16px;right:16px;width:auto;max-width:none;transform:translateY(-6px);min-width:0}
      .toast.show{transform:translateY(0)}
      .modal-mask{padding:12px;padding-top:max(12px,env(safe-area-inset-top));align-items:flex-end}
      .modal,.modal.wide{width:100%;max-height:min(88dvh,900px);border-radius:14px 14px 10px 10px}
    }
    @media(max-width:720px){
      .content{
        padding:14px 14px 96px;
        padding-left:max(14px,env(safe-area-inset-left));
        padding-right:max(14px,env(safe-area-inset-right));
      }
      .topbar{padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top))}
      .top-actions .seg button{padding:0 8px;font-size:12px}
      .top-actions #btnRefresh{display:none}
      .stats{grid-template-columns:1fr 1fr;gap:8px}
      .usage-kpis,.usage-kpis.compact{grid-template-columns:1fr 1fr}
      .quick-actions,.quick-actions.user-only{grid-template-columns:1fr}
      .panel-hd .input{width:100%;max-width:none!important;flex:1 1 100%}
      .panel-hd .btn{flex:1 1 auto}
      .oauth-code{font-size:26px;letter-spacing:.12em;padding:14px 10px}
      .oauth-meta{flex-direction:column;align-items:flex-start}
      .mine-stats{grid-template-columns:1fr 1fr}
      .rank-me{padding:14px;gap:10px}
      .rank-me .big{font-size:32px}
      .contrib-hero{padding:18px 16px;border-radius:12px}
      .contrib-hero h1{font-size:22px;letter-spacing:-.8px}
      .contrib-cta-row{gap:8px}
      .contrib-cta-row .btn{width:100%}
      .why-grid,.steps{grid-template-columns:1fr}
      .step{border-right:0;border-bottom:1px solid var(--hairline)}
      .step:last-child{border-bottom:0}
      .dt{margin:0 -2px;padding:0 2px}
      .pager{flex-wrap:wrap;gap:8px}
    }
    @media(max-width:420px){
      .top-actions .user-chip{display:none}
      .page-title{font-size:14px}
      .stats{grid-template-columns:1fr}
      .mine-stats{grid-template-columns:1fr}
      .seg button{padding:0 8px}
    }
    @media(min-width:1400px){
      .content{padding:28px 36px 80px}
      .chart-wrap{height:220px}
    }
    /* Contribute / Leaderboard */
    .contrib-hero{
      position:relative;overflow:hidden;border:1px solid var(--hairline);border-radius:16px;
      background:radial-gradient(120% 140% at 0% 0%,#eef6ff 0%,#fff 45%,#faf5ff 100%);
      padding:28px 28px 24px;margin-bottom:16px;
    }
    .contrib-hero::before{
      content:"";position:absolute;inset:auto -20% -40% auto;width:320px;height:320px;border-radius:50%;
      background:radial-gradient(circle at center,rgba(0,112,243,.18),transparent 65%);pointer-events:none;
    }
    .contrib-hero::after{
      content:"";position:absolute;inset:auto auto -30% -10%;width:260px;height:260px;border-radius:50%;
      background:radial-gradient(circle at center,rgba(121,40,202,.14),transparent 65%);pointer-events:none;
    }
    .contrib-hero > *{position:relative;z-index:1}
    .contrib-kicker{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:999px;background:rgba(23,23,23,.04);border:1px solid var(--hairline);font-size:12px;font-weight:500;color:var(--body);margin-bottom:12px}
    .contrib-hero h1{margin:0;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-1.2px}
    .contrib-hero p{margin:10px 0 0;color:var(--body);max-width:58ch;line-height:1.55}
    .contrib-cta-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:18px}
    .contrib-cta-row .btn{height:36px;padding:0 16px}
    .why-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}
    .why-card{border:1px solid var(--hairline);border-radius:12px;background:#fff;padding:16px;box-shadow:var(--shadow);transition:transform .2s var(--ease),box-shadow .2s var(--ease),border-color .2s}
    .why-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.06);border-color:#e2e2e2}
    .why-ic{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:var(--canvas-soft-2);border:1px solid var(--hairline);margin-bottom:12px;color:var(--ink)}
    .why-ic svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
    .why-card h3{margin:0 0 6px;font-size:14px;font-weight:600;letter-spacing:-.2px}
    .why-card p{margin:0;font-size:12.5px;color:var(--body);line-height:1.5}
    .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:4px 0 0;counter-reset:step}
    .step{position:relative;padding:14px 16px 14px 18px;border-right:1px solid var(--hairline)}
    .step:last-child{border-right:0}
    .step .n{font-family:var(--mono);font-size:11px;color:var(--mute);letter-spacing:.04em;margin-bottom:6px}
    .step strong{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
    .step span{display:block;font-size:12px;color:var(--body);line-height:1.45}
    .oauth-stage{display:none;margin:0;padding:18px;border-top:1px solid var(--hairline);background:linear-gradient(180deg,#fafafa,#fff)}
    .oauth-stage.show{display:block;animation:fadeIn .25s var(--ease)}
    .oauth-code{
      font-family:var(--mono);font-size:36px;font-weight:600;letter-spacing:.18em;color:var(--ink);
      background:#fff;border:1px dashed var(--hairline-strong);border-radius:12px;padding:18px 16px;text-align:center;
      user-select:all;
    }
    .oauth-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:12px}
    .oauth-meta .hint{font-size:12px;color:var(--mute)}
    .pulse-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--link);box-shadow:0 0 0 0 rgba(0,112,243,.5);animation:pulse 1.4s infinite;margin-right:6px;vertical-align:middle}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,112,243,.45)}70%{box-shadow:0 0 0 10px rgba(0,112,243,0)}100%{box-shadow:0 0 0 0 rgba(0,112,243,0)}}
    .mine-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .rank-me{
      display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;
      border:1px solid var(--hairline);border-radius:14px;background:#fff;padding:18px 20px;margin-bottom:14px;
      box-shadow:var(--shadow);
    }
    .rank-me .big{font-size:40px;line-height:1;font-weight:600;letter-spacing:-1.6px;font-variant-numeric:tabular-nums}
    .rank-me .meta{color:var(--mute);font-size:12px;margin-top:4px}
    .rank-me .pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:999px;background:var(--link-bg);color:var(--link-deep);border:1px solid #b6d4ff;font-size:12px;font-weight:500}
    .podium{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:12px;align-items:end;margin-bottom:16px}
    .pod{border:1px solid var(--hairline);border-radius:14px;background:#fff;padding:18px 14px 16px;text-align:center;box-shadow:var(--shadow);position:relative;overflow:hidden;transition:transform .2s var(--ease)}
    .pod:hover{transform:translateY(-2px)}
    .pod.gold{background:linear-gradient(180deg,#fffaf0,#fff);border-color:#f3e0b5;min-height:170px}
    .pod.silver{background:linear-gradient(180deg,#f8fafc,#fff);min-height:150px}
    .pod.bronze{background:linear-gradient(180deg,#fff7f2,#fff);border-color:#f0d2c2;min-height:140px}
    .pod .place{font-family:var(--mono);font-size:11px;color:var(--mute);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    .pod .uname{font-weight:600;font-size:15px;letter-spacing:-.3px;margin-bottom:6px;word-break:break-all}
    .pod .cnt{font-size:28px;font-weight:600;letter-spacing:-1px;font-variant-numeric:tabular-nums}
    .pod .lbl{font-size:11px;color:var(--mute);margin-top:2px}
    .pod.me{outline:2px solid var(--ink);outline-offset:-1px}
    .lb-row.me{background:#f0f7ff;box-shadow:inset 3px 0 0 var(--link)}
    .rank-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:22px;padding:0 8px;border-radius:999px;background:var(--canvas-soft-2);border:1px solid var(--hairline);font-family:var(--mono);font-size:11px;font-weight:500;color:var(--body)}
    .rank-badge.top1{background:#fff6df;border-color:#f0d789;color:#9a6700}
    .rank-badge.top2{background:#f1f5f9;border-color:#cbd5e1;color:#475569}
    .rank-badge.top3{background:#fff1e8;border-color:#f0c2a0;color:#9a3412}
    .dt-contrib{--dt-cols:minmax(0,1.5fr) 100px minmax(0,1.2fr) 64px 150px 160px;min-width:760px}
    .dt-lb{--dt-cols:72px minmax(0,1.6fr) 100px 100px;min-width:420px}
    .dt-contrib .dt-head,.dt-contrib .dt-row,.dt-lb .dt-head,.dt-lb .dt-row{grid-template-columns:var(--dt-cols)}
    .empty-cta{padding:48px 20px;text-align:center}
    .empty-cta h3{margin:0 0 6px;font-size:16px;font-weight:600}
    .empty-cta p{margin:0 0 16px;color:var(--mute);font-size:13px}
    @media(max-width:1100px){
      .why-grid,.steps,.mine-stats{grid-template-columns:1fr 1fr}
      .podium{grid-template-columns:1fr}
      .pod.gold,.pod.silver,.pod.bronze{min-height:auto}
    }
    @media(prefers-reduced-motion:reduce){.view.on,.modal-mask.show{animation:none}.pulse-dot{animation:none}*{transition:none!important}}
  `;
}
