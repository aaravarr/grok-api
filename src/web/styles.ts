export function styles(): string {
  return `
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
    .dt-time{white-space:nowrap;font-variant-numeric:tabular-nums;font-family:var(--mono);font-size:12px;color:var(--mute)}
    /*
      Fixed track sizes (no max-content): each row is its own grid, so fr/max-content
      would size independently and columns drift. Use the same explicit template for head+rows.
    */
    .dt-accounts{--dt-cols:minmax(0,1.6fr) 100px minmax(0,1.2fr) 56px 150px 252px;min-width:820px}
    .dt-users{--dt-cols:minmax(0,1.5fr) 96px 96px 150px 160px;min-width:700px}
    .dt-keys{--dt-cols:minmax(0,1.3fr) minmax(0,1fr) 88px 140px 56px 160px;min-width:780px}
    .dt-logs{--dt-cols:150px minmax(0,1fr) minmax(0,1fr) 72px minmax(0,1.2fr) 80px minmax(0,.9fr) minmax(0,.9fr);min-width:960px}
    .dt-logs.no-account{--dt-cols:150px minmax(0,1fr) minmax(0,1fr) 72px minmax(0,1.2fr) 80px minmax(0,1fr);min-width:820px}
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
    .side-toggle{display:none}
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
      .side{position:fixed;left:0;top:0;transform:translateX(-100%);transition:transform .22s var(--ease);width:min(280px,86vw);box-shadow:8px 0 32px rgba(0,0,0,.1)}
      .side.open{transform:none}
      .side-toggle{display:inline-flex}
      .content{padding:16px}
      .topbar{padding:0 14px}
      .log-meta{grid-template-columns:1fr}
      .dt-actions{flex-wrap:wrap}
      .dt-accounts{--dt-cols:minmax(0,1.4fr) 90px minmax(0,1.1fr) 48px 120px 200px;min-width:680px}
      .dt-users{--dt-cols:minmax(0,1.3fr) 88px 88px 120px 140px;min-width:600px}
    }
    @media(min-width:1400px){
      .content{padding:28px 36px 80px}
      .chart-wrap{height:220px}
    }
    @media(prefers-reduced-motion:reduce){.view.on,.modal-mask.show{animation:none}*{transition:none!important}}
  `;
}
