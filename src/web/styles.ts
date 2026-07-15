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
      --radius-sm:6px;--radius:8px;--radius-md:10px;--radius-lg:12px;--radius-xl:14px;--radius-pill:999px;
      --shadow:0 1px 2px rgba(0,0,0,.04);
      /* Latin: Geist · CJK: Noto Sans SC (loaded via Google Fonts in pages) */
      --font:"Geist","Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
      --mono:"Geist Mono","Noto Sans SC",ui-monospace,SFMono-Regular,Menlo,monospace;
      --ease:cubic-bezier(.16,1,.3,1);--dur:.3s;
      --side:248px;--top:56px;
    }
    *{box-sizing:border-box} html,body{margin:0;padding:0}
    body{font-family:var(--font);color:var(--ink);background:var(--canvas-soft);font-size:14px;line-height:1.5;letter-spacing:0;min-height:100dvh;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    button,input,select,textarea{font:inherit} button{cursor:pointer}
    a{color:var(--link);text-decoration:none} a:hover{color:var(--link-deep)}

    .app{display:grid;grid-template-columns:var(--side) minmax(0,1fr);min-height:100dvh;width:100%}
    .side{position:sticky;top:0;height:100dvh;background:#fff;border-right:1px solid var(--hairline);display:flex;flex-direction:column;padding:12px 10px;z-index:30}
    .brand{
      display:flex;align-items:center;gap:10px;margin:0 2px 12px;padding:8px 10px;min-height:40px;
      color:var(--ink);text-decoration:none;border-radius:var(--radius-md);background:transparent;
      transition:background .15s var(--ease);
    }
    .brand:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .brand-mark{
      width:26px;height:26px;border-radius:var(--radius);background:var(--ink);
      display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:0;
    }
    .brand-mark svg{display:block;width:14px;height:14px}
    .brand-name{
      font-family:var(--mono);font-weight:600;font-size:13.5px;line-height:1;
      letter-spacing:-.02em;white-space:nowrap;
    }
    .nav-group{margin-bottom:10px}
    .nav-label{
      font-size:10.5px;font-weight:600;color:var(--mute);padding:10px 12px 5px;
      letter-spacing:.08em;text-transform:uppercase;line-height:1.2;
    }
    .nav-item{
      display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;text-align:left;
      padding:8px 12px;min-height:36px;border-radius:var(--radius);color:var(--body);font-weight:500;font-size:13.5px;
      line-height:1;letter-spacing:-.01em;text-decoration:none;
      transition:background .15s var(--ease),color .15s var(--ease),box-shadow .15s var(--ease);
    }
    .nav-item:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .nav-item.on,.nav-item.on:hover{background:var(--ink);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12)}
    .nav-item .ic{width:18px;height:18px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;opacity:.72;line-height:0}
    .nav-item .ic svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
    .nav-item:hover .ic,.nav-item.on .ic{opacity:1}
    .nav-item > span:last-child{line-height:1.2}

    .main-wrap{position:relative;min-width:0;width:100%;display:flex;flex-direction:column;min-height:100dvh}
    .topbar{
      height:var(--top);border-bottom:1px solid var(--hairline);
      background:rgba(255,255,255,.86);backdrop-filter:saturate(180%) blur(16px);-webkit-backdrop-filter:saturate(180%) blur(16px);
      display:flex;align-items:center;justify-content:space-between;
      padding:0 24px;position:sticky;top:0;z-index:20;gap:16px;
    }
    .topbar-left{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
    .topbar-titles{
      display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
      gap:1px;min-width:0;overflow:hidden;line-height:1.15;
    }
    .page-title{
      margin:0;font-weight:600;font-size:14px;line-height:1.25;letter-spacing:-.02em;
      color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .page-sub{
      margin:0;color:var(--mute);font-size:12px;font-weight:400;line-height:1.25;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(420px,42vw);
    }
    .top-actions{display:flex;align-items:center;gap:4px;flex-shrink:0}
    .icon-btn{
      display:inline-flex;align-items:center;justify-content:center;
      width:32px;height:32px;padding:0;border-radius:var(--radius);
      border:0;background:transparent;color:var(--body);
      transition:background .15s var(--ease),color .15s var(--ease);
    }
    .icon-btn:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .icon-btn:active{transform:translateY(0.5px)}
    .icon-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .lang-icon-btn{width:34px}
    .lang-icon{
      position:relative;display:inline-block;width:16px;height:16px;
      font-weight:700;line-height:1;user-select:none;
    }
    .lang-icon-zh{
      position:absolute;left:0;top:0;font-size:11px;color:var(--ink);
      font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
    }
    .lang-icon-en{
      position:absolute;right:-1px;bottom:-1px;font-size:10px;color:var(--mute);
      font-family:var(--font);
    }
    .lang-icon-btn:hover .lang-icon-en{color:var(--ink)}
    .tb-menu{position:relative;display:inline-flex;align-items:center}
    .tb-pop{
      position:absolute;top:calc(100% + 8px);right:0;min-width:168px;
      padding:6px;border-radius:var(--radius-lg);background:#fff;
      border:1px solid var(--hairline);
      box-shadow:0 8px 28px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
      z-index:50;
    }
    .tb-pop[hidden]{display:none!important}
    .tb-menu.open .tb-pop{display:block}
    .tb-item{
      width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;
      min-height:34px;padding:0 10px;border:0;border-radius:var(--radius);
      background:transparent;color:var(--ink);font-size:13px;font-weight:500;text-align:left;
      transition:background .12s var(--ease);
    }
    .tb-item:hover{background:var(--canvas-soft-2)}
    .tb-item.on{background:var(--canvas-soft)}
    .tb-item.danger{color:var(--error)}
    .tb-item.danger:hover{background:var(--error-bg)}
    .tb-check{min-width:14px;color:var(--ink);font-size:12px;font-weight:600}
    .tb-sep{height:1px;background:var(--hairline);margin:6px 4px}
    .tb-user-hd{
      display:flex;align-items:center;gap:10px;padding:8px 10px 10px;
    }
    .tb-user-meta{display:flex;flex-direction:column;gap:2px;min-width:0}
    .tb-user-meta strong{
      font-size:13px;font-weight:600;color:var(--ink);line-height:1.2;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;
    }
    .tb-user-meta span{font-size:12px;color:var(--mute);line-height:1.2}
    .user-menu .user-chip{
      display:inline-flex;align-items:center;gap:8px;height:32px;max-width:190px;
      padding:0 8px 0 4px;border-radius:var(--radius-pill);background:transparent;
      border:0;color:var(--body);
      transition:background .15s var(--ease),color .15s var(--ease);
    }
    .user-menu .user-chip:hover{background:var(--canvas-soft-2);color:var(--ink)}
    .user-menu.open .user-chip{background:var(--canvas-soft-2);color:var(--ink)}
    .user-avatar{
      width:24px;height:24px;border-radius:var(--radius-pill);background:var(--ink);color:#fff;
      display:inline-flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:600;letter-spacing:-.02em;flex-shrink:0;line-height:1;
      text-transform:uppercase;
    }
    .user-avatar.sm{width:28px;height:28px;font-size:12px}
    .user-meta{
      display:flex;flex-direction:column;justify-content:center;min-width:0;gap:0;line-height:1.1;
    }
    .user-chip strong{
      color:var(--ink);font-weight:500;font-size:12px;letter-spacing:-.01em;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;
    }
    .user-role{
      font-size:10px;font-weight:500;color:var(--mute);letter-spacing:.02em;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;
      text-transform:none;
    }
    .user-caret{color:var(--mute);flex-shrink:0;margin-left:2px;transition:transform .15s var(--ease)}
    .user-menu.open .user-caret{transform:rotate(180deg);color:var(--ink)}
    .user-pop{min-width:200px}
    .content{padding:24px 28px 72px;width:100%;max-width:none;flex:1;min-width:0}
    /* Loading states - skeleton first */
    .page-loading{
      position:absolute;inset:0;z-index:40;display:none;
      background:rgba(250,250,250,.88);
    }
    .page-loading.show{display:block}
    .main-wrap{position:relative}
    .page-loading-inner{
      position:sticky;top:var(--top);min-height:calc(100dvh - var(--top));
      display:flex;align-items:flex-start;justify-content:stretch;
      padding:24px 28px 72px;box-sizing:border-box;
    }
    .page-sk{
      width:100%;display:flex;flex-direction:column;gap:14px;
    }
    .page-sk-kpis{
      display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;
    }
    .page-sk-card{
      border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;padding:16px 18px;
      display:flex;flex-direction:column;gap:12px;
    }
    .page-sk-row{display:flex;flex-direction:column;gap:10px}
    .page-sk-main{
      display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,.9fr);gap:14px;
    }
    .sk{
      display:block;border-radius:var(--radius);
      background:linear-gradient(90deg,#efefef 0%,#f7f7f7 42%,#efefef 84%);
      background-size:220% 100%;
      animation:sk-shimmer 1.15s ease-in-out infinite;
    }
    .sk.sm{height:10px}.sk.md{height:14px}.sk.lg{height:22px}.sk.xl{height:28px}
    .sk.w20{width:20%}.sk.w28{width:28%}.sk.w36{width:36%}.sk.w44{width:44%}
    .sk.w52{width:52%}.sk.w60{width:60%}.sk.w72{width:72%}.sk.w88{width:88%}.sk.w100{width:100%}
    .sk.block{width:100%;min-height:120px;border-radius:var(--radius-md)}
    .sk.chart{width:100%;min-height:180px;border-radius:var(--radius-md)}
    .sk.kpi-n{width:46%;height:26px;margin-top:4px}
    .sk.kpi-l{width:58%;height:10px}
    .sk.kpi-s{width:40%;height:10px}
    .sk-table{display:flex;flex-direction:column;gap:0;border:1px solid var(--hairline);border-radius:var(--radius-lg);overflow:hidden;background:#fff}
    .sk-table-head,.sk-table-row{
      display:grid;grid-template-columns:var(--sk-cols,1.2fr .8fr .8fr 1fr .7fr .9fr);
      gap:12px;align-items:center;padding:12px 14px;
    }
    .sk-table-head{background:var(--canvas-soft);border-bottom:1px solid var(--hairline)}
    .sk-table-row + .sk-table-row{border-top:1px solid var(--hairline)}
    .sk-table-row{min-height:52px}
    .is-loading{position:relative}
    .loading-overlay{
      position:absolute;inset:0;z-index:5;display:flex;align-items:stretch;justify-content:stretch;
      background:rgba(255,255,255,.78);backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);
      border-radius:inherit;padding:14px;box-sizing:border-box;
    }
    .loading-overlay .sk-fill{width:100%;height:100%;min-height:120px;display:flex;flex-direction:column;gap:12px}
    .dt-body.is-loading{min-height:180px}
    .dt-body .sk-table{border:0;border-radius:0}
    @keyframes sk-shimmer{
      0%{background-position:100% 0}
      100%{background-position:-100% 0}
    }
    @media(max-width:900px){
      .page-loading-inner{padding:16px 14px 48px}
      .page-sk-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
      .page-sk-main{grid-template-columns:1fr}
    }
    @media(prefers-reduced-motion:reduce){
      .sk{animation:none;background:#efefef}
    }


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

    /* Overview */
    .ov-welcome{
      display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 16px;
      margin:0 0 12px;padding:14px 16px;border:1px solid var(--hairline);border-radius:var(--radius-lg);
      background:linear-gradient(135deg,#fafafa 0%,#fff 48%,#f3f8ff 100%);
    }
    .ov-kicker{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:4px}
    .ov-welcome h1{margin:0;font-size:22px;line-height:1.15;letter-spacing:-.6px;font-weight:650;color:var(--ink)}
    .ov-welcome p{margin:4px 0 0;font-size:13px;line-height:1.4;color:var(--body);max-width:48ch}
    .ov-welcome-side{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
    .ov-pill{
      display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:var(--radius-pill);
      border:1px solid var(--hairline);background:#fff;font-size:12px;color:var(--body);font-weight:500;
    }
    .ov-kpis{
      display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:12px;
    }
    .ov-kpi{
      border:1px solid var(--hairline);border-radius:var(--radius-md);padding:12px 14px;background:#fff;text-align:left;
      transition:border-color .15s,box-shadow .15s,transform .15s;min-width:0;
    }
    .ov-kpi.clickable{cursor:pointer}
    .ov-kpi:hover{border-color:#d8d8d8;box-shadow:0 8px 22px rgba(0,0,0,.04);transform:translateY(-1px)}
    .ov-kpi-l{font-size:12px;color:var(--mute);font-weight:500}
    .ov-kpi-n{margin-top:4px;font-size:22px;line-height:1.15;font-weight:650;letter-spacing:-.7px;font-variant-numeric:tabular-nums;color:var(--ink)}
    .ov-kpi-s{margin-top:3px;font-size:11px;color:var(--mute);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ov-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.85fr);gap:12px;align-items:start}
    .ov-main{display:grid;gap:12px;min-width:0}
    .ov-side{display:grid;gap:12px;min-width:0;align-content:start}
    .ov-grid > .card,.ov-main > .card,.ov-side > .card,.ov-mini-grid > .card{height:auto}
    .ov-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-width:0}
    .ov-card-mini .card-bd{padding:10px 12px 12px}
    .chart-ov-mini{height:150px;min-height:150px}
    .ov-card-usage.card{height:auto}
    .ov-card-sub{margin-top:2px;font-size:12px;color:var(--mute)}
    .ov-token-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}
    .ov-token{
      display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:1px solid var(--hairline);
      border-radius:var(--radius);background:var(--canvas-soft);min-width:0;
    }
    .ov-token span:not(.ov-dot){font-size:11px;color:var(--mute);display:flex;align-items:center;gap:5px}
    .ov-token strong{font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink);letter-spacing:-.3px}
    .ov-dot{width:7px;height:7px;border-radius:var(--radius-pill);flex-shrink:0}
    .ov-dot.in{background:#0070f3}.ov-dot.cache{background:#00a0a0}.ov-dot.out{background:#7928ca}.ov-dot.reason{background:#ab570a}
    .ov-qa-bd{padding:10px !important}
    .ov-empty{padding:14px 12px;text-align:center;color:var(--mute);font-size:13px}
    .ov-recent-main{min-width:0}
    .ov-recent-side{text-align:right;flex-shrink:0}
    .ov-card-recent .quick-row{padding:10px 14px;margin:0;border-radius:0;border-bottom:1px solid var(--hairline)}
    .ov-card-recent .quick-row:last-child{border-bottom:0}
    .ov-card-recent .quick-row:hover{background:var(--canvas-soft)}
    .ov-card-usage .card-bd{padding:12px 14px 14px}
    .ov-card-usage .card-hd,.ov-side .card-hd{padding:10px 14px}
    #quickActions.user-only .qa[data-admin-only]{display:none}

    .grid-2{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.75fr);gap:14px;align-items:stretch}
    .grid-2b{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .card{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;box-shadow:var(--shadow);overflow:hidden;height:100%}
    .card-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft);border-top-left-radius:var(--radius-lg);border-top-right-radius:var(--radius-lg)}
    .card-hd strong{font-size:13px;font-weight:500}
    .card-hd .spacer{flex:1}
    .card-bd{padding:16px}
    .card-ft{padding:10px 16px;border-top:1px solid var(--hairline);background:#fff}

    .panel{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;box-shadow:var(--shadow);overflow:visible;width:100%;max-width:100%}
    /* allow table horizontal scroll inside panel without clipping the scrollbar track oddly */
    .panel > .dt{border-radius:0 0 var(--radius-lg) var(--radius-lg)}
    .panel-hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 18px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft)}
    /* Keep header background clipped to panel radius when overflow stays visible for dropdowns */
    .panel > .panel-hd:first-child,
    .panel > .routing-bar:first-child,
    .panel > .add-bar:first-child{
      border-top-left-radius:var(--radius-lg);border-top-right-radius:var(--radius-lg)
    }
    .panel > :last-child{
      border-bottom-left-radius:var(--radius-lg);border-bottom-right-radius:var(--radius-lg)
    }
    .panel-hd .spacer{flex:1}
    .panel-bd{padding:18px;min-width:0}
    .routing-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--hairline);background:#fff}
    .routing-left{display:flex;flex-wrap:wrap;align-items:center;gap:10px;min-width:0}
    .bar-label{font-size:12px;font-weight:500;color:var(--mute)}
    .current-pill{
      display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:var(--radius-pill);
      background:var(--canvas-soft);border:1px solid var(--hairline);font-size:12px;color:var(--body);
    }
    .add-bar{
      display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;
      padding:14px 18px;
    }
    .add-fields{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;flex:1;min-width:0}
    .add-field{display:flex;flex-direction:column;gap:6px;min-width:140px}
    .add-field .input,.add-field .select,.add-field .cselect{min-width:150px;width:100%}
    .add-field .cselect{min-width:150px}
    .field-label{font-size:11px;font-weight:500;color:var(--mute);letter-spacing:.02em}
    .input.block,.select.block{width:100%;min-width:0;display:block}
    .cselect.block{width:100%}

    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:var(--radius);border:1px solid var(--ink);background:var(--ink);color:#fff;font-weight:500;font-size:13px;transition:background .15s var(--ease),transform .12s var(--ease),opacity .15s}
    .btn:hover{background:#000}.btn:active{transform:translateY(1px) scale(.98)}
    .btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .btn-secondary{background:#fff;color:var(--ink);border-color:var(--hairline)}
    .btn-secondary:hover{background:var(--canvas-soft-2);border-color:var(--hairline-strong)}
    .btn-danger{background:#fff;color:var(--error);border-color:#f3b0b0}
    .btn-danger:hover{background:var(--error-bg)}
    .btn-sm{height:28px;padding:0 10px;font-size:12px}
    .btn-ghost{background:transparent;border-color:transparent;color:var(--body)}
    .btn-ghost:hover{background:var(--canvas-soft-2);color:var(--ink)}

    .input,.select{height:32px;padding:0 10px;border-radius:var(--radius);border:1px solid var(--hairline);background:#fff;color:var(--ink);min-width:120px;outline:none}
    .input:focus,.select:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .input.grow{flex:1;min-width:160px}
    .input::placeholder{color:var(--mute)}
    /* Custom select (replaces native dropdown list) */
    .cselect{
      position:relative;display:inline-flex;vertical-align:middle;min-width:120px;z-index:1;
    }
    .cselect.open{z-index:80}
    .media-advanced,.media-form-stack{overflow:visible}.media-form{overflow:hidden}
    .media-advanced .cselect.open{z-index:90}
    .cselect.grow,.cselect.block{display:flex;width:100%;min-width:0}
    .cselect select.select-native{
      position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;overflow:hidden;
    }
    .cselect-btn{
      display:inline-flex;align-items:center;justify-content:space-between;gap:8px;
      width:100%;min-width:0;height:32px;padding:0 10px 0 12px;border-radius:var(--radius);
      border:1px solid var(--hairline);background:#fff;color:var(--ink);font-size:13px;font-weight:500;
      text-align:left;transition:border-color .15s,box-shadow .15s,background .12s;
    }
    .cselect-btn:hover{border-color:var(--hairline-strong);background:var(--canvas-soft)}
    .cselect.open .cselect-btn,.cselect-btn:focus{
      border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08);outline:none;
    }
    .cselect-btn .cselect-label{
      flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .cselect-btn .cselect-caret{
      flex-shrink:0;width:12px;height:12px;color:var(--mute);
      transition:transform .15s var(--ease);
    }
    .cselect.open .cselect-caret{transform:rotate(180deg);color:var(--ink)}
    .cselect-menu{
      display:none;position:absolute;z-index:90;top:calc(100% + 4px);left:0;right:0;
      width:100%;min-width:100%;max-height:min(280px,50vh);overflow:hidden;
      padding:0;border-radius:var(--radius-lg);border:1px solid var(--hairline);background:#fff;
      box-shadow:0 10px 28px rgba(0,0,0,.12),0 2px 6px rgba(0,0,0,.04);
      -webkit-overflow-scrolling:touch;isolation:isolate;
    }
    .cselect.open .cselect-menu{display:flex;flex-direction:column;animation:fadeIn .12s var(--ease)}
    .cselect-menu.drop-up{top:auto;bottom:calc(100% + 4px)}
    /* only searchable menus (user picker) may grow a bit for the search field */
    .cselect-menu.searchable{
      right:auto;width:max(100%,200px);max-width:min(280px,92vw);
    }
    .cselect-search{
      padding:8px;border-bottom:1px solid var(--hairline);background:#fff;flex:0 0 auto;position:relative;z-index:1;
    }
    .cselect-search .input{
      height:32px;width:100%;min-width:0;box-sizing:border-box;font-size:12px;
      background:#fff;
    }
    .cselect-opts{
      flex:1 1 auto;overflow:auto;padding:4px;min-height:0;max-height:min(280px,50vh);
      background:#fff;position:relative;z-index:1;
    }
    .cselect-menu.searchable .cselect-opts{max-height:min(240px,45vh)}
    .cselect-empty{padding:14px 10px;text-align:center;color:var(--mute);font-size:12px;background:#fff}
    .cselect-title{display:block;width:100%;font-size:13px;font-weight:500;line-height:1.3;color:inherit}
    .cselect-desc{display:block;width:100%;margin-top:3px;font-size:11.5px;line-height:1.4;color:var(--mute);white-space:normal;font-weight:400}
    .cselect-btn.has-desc{height:auto;min-height:44px;align-items:center;padding-top:8px;padding-bottom:8px}
    .cselect-btn.has-desc .cselect-label{
      display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;
      white-space:normal;overflow:hidden;
    }
    .cselect-btn.has-desc .cselect-title,
    .cselect-btn.has-desc .cselect-desc{
      overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
    }
    .cselect-btn.has-desc .cselect-title{-webkit-line-clamp:1}
    .cselect-opt.has-desc{
      display:flex;flex-direction:column;align-items:flex-start;justify-content:center;
      height:auto;min-height:52px;padding:9px 10px;white-space:normal;overflow:hidden;gap:2px;
    }
    .cselect-opt.on .cselect-desc{color:rgba(255,255,255,.78)}
    .cselect-opt{
      display:flex;align-items:center;width:100%;min-height:34px;padding:7px 10px;border:0;
      border-radius:var(--radius);background:#fff;color:var(--body);font-size:13px;font-weight:500;
      text-align:left;cursor:pointer;transition:background .1s,color .1s;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .cselect-opt:hover,.cselect-opt:focus{background:var(--canvas-soft-2);color:var(--ink);outline:none}
    .cselect-opt.on{background:var(--ink);color:#fff}
    .cselect-opt.on:hover{background:#000;color:#fff}
    .cselect-opt:disabled{opacity:.4;cursor:not-allowed}
    .filter-bar .cselect{min-width:110px}
    .add-field .cselect{min-width:160px}
    .add-account,.add-account-body{overflow:visible;position:relative}
    .add-account:has(.cselect.open){z-index:40}
    .pager-jump{display:inline-flex;align-items:center;gap:6px}
    .pager-jump .pager-input{
      width:52px;height:28px;padding:0 6px;border-radius:var(--radius-sm);border:1px solid var(--hairline);
      background:#fff;color:var(--ink);font-size:12px;font-variant-numeric:tabular-nums;text-align:center;outline:none;
    }
    .pager-jump .pager-input:focus{border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .pager-jump .pager-total{color:var(--mute);font-variant-numeric:tabular-nums;white-space:nowrap}

    .seg{display:inline-flex;border:1px solid var(--hairline);border-radius:var(--radius);overflow:hidden;background:#fff}
    .seg button{border:0;background:transparent;height:30px;padding:0 12px;color:var(--body);font-weight:500;font-size:13px}
    .seg button:hover{background:var(--canvas-soft-2)}.seg button.on{background:var(--ink);color:#fff}

    .msg{display:none!important}
    .toast-host{
      position:fixed;top:max(16px,calc(var(--top) + 12px));left:50%;transform:translateX(-50%);
      z-index:400;display:flex;flex-direction:column;align-items:center;gap:8px;
      width:min(420px,calc(100vw - 32px));pointer-events:none;
    }
    .toast{
      display:none;width:100%;
      padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--hairline);background:#fff;
      box-shadow:0 12px 36px rgba(0,0,0,.14);font-size:13px;line-height:1.45;color:var(--body);
      white-space:pre-wrap;word-break:break-word;pointer-events:auto;
      opacity:0;transform:translateY(-8px);transition:opacity .18s var(--ease),transform .18s var(--ease);
    }
    .toast.show{display:block;opacity:1;transform:translateY(0)}
    .toast.ok{background:var(--success-bg);border-color:#b7e4c7;color:var(--success)}
    .toast.err{background:var(--error-bg);border-color:#f0b8bb;color:var(--error)}
    .codebox{display:none;margin:0;padding:16px;border-radius:var(--radius-md);border:1px dashed var(--hairline-strong);background:var(--canvas-soft)}
    .codebox.show{display:block}.codebox .label{color:var(--mute);font-size:12px;margin-bottom:8px}
    .codebox .code{font-family:var(--mono);font-size:28px;font-weight:500;letter-spacing:.14em}

    /*
      CSS Grid data tables
      - .dt is the horizontal scrollport (mobile-friendly)
      - each head/row is its own grid with the SAME width: max(100%, --dt-min)
        so columns align and wide screens fill the panel
      - flexible tracks use minmax(minPx, Nfr); fixed tracks stay px
      - --dt-min ≈ sum of track floors (enables overflow-x when viewport is narrow)
    */
    .dt{
      width:100%;max-width:100%;
      overflow-x:auto;overflow-y:hidden;
      -webkit-overflow-scrolling:touch;
      overscroll-behavior-x:contain;
      touch-action:pan-x pan-y;
    }
    .dt-head,.dt-row{
      display:grid;align-items:center;column-gap:0;
      border-bottom:1px solid var(--hairline);
      box-sizing:border-box;
      width:max(100%,var(--dt-min,0px));
      min-width:max(100%,var(--dt-min,0px));
      grid-template-columns:var(--dt-cols);
    }
    .dt-head{background:#fafafa;position:sticky;top:0;z-index:1}
    .dt-head > div{
      padding:10px 12px;color:var(--mute);font-weight:500;font-size:12px;white-space:nowrap;
      overflow:hidden;text-overflow:ellipsis;min-width:0;
    }
    .dt-row > div{
      padding:10px 12px;font-size:13px;line-height:1.4;min-width:0;
      overflow:hidden;
    }
    .dt-row:hover{background:var(--canvas-soft)}
    .dt-row.current{background:#f0f7ff;box-shadow:inset 3px 0 0 var(--link)}
    .dt-body > .dt-row:last-child{border-bottom:0}
    .dt-row.clickable{cursor:pointer}
    .dt-empty{padding:40px 16px;text-align:center;color:var(--mute);font-size:13px}
    .dt-actions{display:flex;flex-wrap:nowrap;gap:4px;align-items:center;justify-content:flex-start;overflow:visible}
    .dt-actions .btn{flex-shrink:0}
    .dt-time{display:flex;flex-direction:column;align-items:flex-start;gap:2px;overflow:hidden;font-variant-numeric:tabular-nums;font-family:var(--mono);font-size:12px;line-height:1.35;color:var(--mute)}
    .dt-time-main{white-space:nowrap}
    .dt-time.is-soon .dt-time-main{color:#b45309}
    .dt-time.is-expired .dt-time-main{color:#b42318}
    .sub-expires .dt-time-main{font-variant-numeric:tabular-nums}
    /* actions: 使用 编辑 刷新 删除 [重新授权] */
    .dt-accounts{--dt-min:1380px;--dt-cols:minmax(140px,1.2fr) 88px minmax(72px,.55fr) 88px minmax(90px,.85fr) minmax(100px,.95fr) 112px 52px 108px 280px}
    .dt-accounts .badge{max-width:none;overflow:visible;text-overflow:clip}
    .dt-accounts .sub-expires{overflow:visible}
    .dt-accounts .dt-row > div:last-child,.dt-accounts .dt-head > div:last-child{overflow:visible}
    .dt-users{--dt-min:980px;--dt-cols:minmax(140px,1.4fr) 88px 88px minmax(110px,1.1fr) 120px 320px}
    .dt-keys{--dt-min:1080px;--dt-cols:minmax(120px,1.1fr) minmax(150px,1.2fr) 88px 140px 72px 340px}
    .dt-keys.has-owner{--dt-min:1220px;--dt-cols:minmax(110px,1fr) minmax(150px,1.15fr) minmax(100px,.95fr) 88px 130px 72px 340px}
    .dt-keys .dt-num,.dt-logs .dt-num{
      font-variant-numeric:tabular-nums;white-space:nowrap;overflow:visible;text-overflow:clip;
    }
    .dt-keys .dt-num{text-align:right;padding-right:14px}
    .dt-keys .dt-row > div:last-child,.dt-keys .dt-head > div:last-child{overflow:visible}
    .dt-keys .key-cell{overflow:visible}
    .dt-keys .key-prefix{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mute);font-family:var(--mono);font-size:12px;line-height:1.35}
    .dt-keys .key-secret{max-width:100%}
    .filter-bar{
      display:flex;flex-wrap:wrap;gap:8px;align-items:center;
      padding:10px 14px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft);
    }
    .filter-bar .input,.filter-bar .select{height:32px}
    .filter-bar .input.grow{flex:1;min-width:140px}
    .route-panel .panel-bd{padding:16px 18px 18px}
    .route-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:14px 16px;align-items:end}
    .route-field{display:flex;flex-direction:column;gap:8px;min-width:0}
    .field-label{font-size:12px;font-weight:500;color:var(--mute);letter-spacing:.01em}
    .route-hint{
      margin-top:12px;padding:10px 12px;border-radius:var(--radius);border:1px solid var(--hairline);
      background:var(--canvas-soft);font-size:12px;line-height:1.5;color:var(--body);
    }
    .route-panel .seg{width:fit-content;max-width:100%}
    .dt-logs{--dt-min:1240px;--dt-cols:118px minmax(110px,1.1fr) minmax(100px,1fr) 72px minmax(160px,1.4fr) 80px 88px 64px minmax(120px,1fr) minmax(90px,.85fr)}
    .dt-logs.no-account{--dt-min:1120px;--dt-cols:118px minmax(110px,1.1fr) minmax(100px,1fr) 72px minmax(160px,1.4fr) 80px 88px 64px minmax(120px,1fr)}
    .dt-logs .dt-num{font-family:var(--mono);font-size:12px;color:var(--mute)}
    .acc-err{
      color:var(--error);font-size:11px;line-height:1.3;margin-top:3px;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;
    }
    .badge{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:var(--radius-pill);font-size:11px;font-weight:500;background:var(--canvas-soft-2);color:var(--body);border:1px solid var(--hairline);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .badge.active{background:var(--success-bg);color:var(--success);border-color:#b7e4c7}
    .badge.pending{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .badge.exhausted{background:var(--violet-bg);color:var(--violet);border-color:#d8ccf1}
    .badge.expired,.badge.error{background:var(--error-bg);color:var(--error);border-color:#f0b8bb}
    .oauth-phase{font-size:11px;color:var(--mute);margin-top:2px;line-height:1.3}
    .badge.current{background:var(--link-bg);color:var(--link-deep);border-color:#b6d4ff}
    .mono{font-family:var(--mono);font-size:12px;line-height:1.35;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .mute{color:var(--mute);opacity:.85}
    .name{font-weight:500;font-size:13px;line-height:1.35;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .name .badge{vertical-align:middle;margin-left:4px}
    .actions{display:flex;flex-wrap:nowrap;gap:6px;align-items:center}
    .meter{height:6px;border-radius:var(--radius-pill);background:var(--canvas-soft-2);overflow:hidden;border:1px solid var(--hairline);width:100%;max-width:100px}
    .meter>i{display:block;height:100%;background:var(--link)}
    .meter.warn>i{background:var(--warn)}.meter.bad>i{background:var(--error)}
    .credit-txt{font-family:var(--mono);font-size:11px;line-height:1.3;color:var(--body);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .credit-sub{margin-top:2px;font-size:10.5px;line-height:1.25;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .empty{padding:40px 16px;text-align:center;color:var(--mute)}
    .callout{border:1px solid var(--hairline);border-radius:var(--radius-md);padding:12px 14px;background:var(--canvas-soft);font-size:13px;color:var(--body);line-height:1.5}
    .callout strong{color:var(--ink);font-weight:500}
    .callout code{font-family:var(--mono);font-size:11px;background:#fff;border:1px solid var(--hairline);border-radius:var(--radius-sm);padding:1px 5px}
    .settings-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
    .hint,.hint-active{font-size:11px;line-height:1.45;color:#a3a3a3;margin-top:2px;word-break:break-word}
    .hint-active{margin-top:6px;word-break:break-all}
    .settings-row .hint,.settings-row .hint-active{width:100%}
    .settings-row .hint-active{margin-top:8px}
    .settings-row .hint{margin-top:2px}
    .settings-stack{display:grid;gap:14px;width:100%;max-width:none}
    .settings-card{
      border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;
      box-shadow:var(--shadow);overflow:hidden;
    }
    .settings-card-hd{
      display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;
      padding:14px 18px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft);
    }
    .settings-card-title{font-size:14px;font-weight:600;letter-spacing:-.2px}
    .settings-card-sub{font-size:12px;color:var(--mute);margin-top:3px;line-height:1.4}
    .settings-card-bd{padding:16px 18px 18px}
    .settings-row.tight{gap:10px}
    .settings-split{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
    .endpoint-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .endpoint-field{display:grid;gap:6px;min-width:0}
    .endpoint-field .input{width:100%}
    .endpoint-field .hint-active{margin-top:6px}
    .endpoint-field .hint{margin-top:2px}
    @media(max-width:1100px){.endpoint-grid{grid-template-columns:1fr}}
    .toggle-list{display:grid;gap:8px}
    .toggle-row{
      display:flex;align-items:flex-start;gap:12px;padding:12px 12px;border:1px solid var(--hairline);
      border-radius:var(--radius-md);background:var(--canvas-soft);cursor:pointer;margin:0;transition:background .12s,border-color .12s;
    }
    .toggle-row:hover{background:#fff;border-color:#e2e2e2}
    .toggle-row.static{cursor:default;align-items:center;justify-content:space-between}
    .toggle-row input[type=checkbox]{width:16px;height:16px;margin:2px 0 0;accent-color:var(--ink);flex-shrink:0}
    .toggle-row span{display:flex;flex-direction:column;gap:2px;min-width:0}
    .toggle-row strong{font-size:13px;font-weight:500;color:var(--ink)}
    .toggle-row em{font-style:normal;font-size:11px;color:#a3a3a3;line-height:1.4}
    @media(max-width:900px){.settings-split{grid-template-columns:1fr}}
    .curl-pre{margin:0;padding:14px;font-family:var(--mono);font-size:12px;line-height:1.65;color:var(--ink);overflow-x:auto;white-space:pre-wrap;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:var(--radius-md);min-height:88px}
    .pager{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid var(--hairline);background:#fff;font-size:12px;color:var(--mute)}
    .pager .btns{display:flex;gap:6px;align-items:center}

    .charts{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px}
    .chart-card{border:1px solid var(--hairline);border-radius:var(--radius-md);padding:14px 16px;background:#fff;min-height:240px}
    .chart-card h4{margin:0 0 10px;font-size:13px;font-weight:500;color:var(--body)}
    .chart-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px}
    .chart-hd h4{margin:0}
    .chart-meta{
      flex-shrink:0;font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;
      color:var(--mute);letter-spacing:-.01em;white-space:nowrap;
    }
    .chart-meta.on{color:#0a7a7a}
    .chart-wrap{position:relative;height:200px}
    .chart-overview{height:180px;min-height:180px}
    @media(min-width:1100px){.chart-overview{height:190px;min-height:190px}}
    .usage-kpis{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin-bottom:14px}
    .usage-kpis.compact{grid-template-columns:repeat(5,minmax(0,1fr))}
    .kpi{border:1px solid var(--hairline);border-radius:var(--radius-md);padding:12px 14px;background:var(--canvas-soft)}
    .kpi .n{font-size:20px;font-weight:600;letter-spacing:-.7px;font-variant-numeric:tabular-nums}
    .kpi .l{font-size:12px;color:var(--mute);margin-top:2px}
    .kpi .sub{font-size:11px;color:var(--mute);margin-top:2px;font-family:var(--mono)}

    .quick-list{display:flex;flex-direction:column;gap:0}
    .quick-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 4px;border-bottom:1px solid var(--hairline);font-size:13px;border-radius:var(--radius-sm);transition:background .12s}
    .quick-row:hover{background:var(--canvas-soft)}
    .quick-row:last-child{border-bottom:0}
    .quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .quick-actions.user-only{grid-template-columns:1fr 1fr}
    .qa{
      display:flex;flex-direction:column;gap:2px;padding:10px 11px;border:1px solid var(--hairline);
      border-radius:var(--radius);background:var(--canvas-soft);cursor:pointer;text-align:left;
      transition:border-color .15s,background .15s,transform .15s,box-shadow .15s;min-width:0;
    }
    .qa:hover{border-color:#d4d4d4;background:#fff;transform:translateY(-1px);box-shadow:var(--shadow)}
    .qa strong{font-size:13px;font-weight:550;color:var(--ink)}
    .qa span{font-size:11px;color:var(--mute);line-height:1.35}

    .modal-mask{display:none;position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:200;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
    .modal-mask.show{display:flex;animation:fadeIn .15s var(--ease)}
    #confirmModal{z-index:320}
    .modal-sub{margin:0 0 14px;color:var(--body);font-size:13px;line-height:1.5}
    .modal{width:min(440px,100%);background:#fff;border-radius:var(--radius-xl);border:1px solid var(--hairline);box-shadow:0 16px 48px rgba(0,0,0,.12);padding:20px;position:relative;z-index:1}
    .modal.modal-confirm{width:min(400px,100%)}
    .modal.modal-confirm p{white-space:pre-wrap;word-break:break-word}
    #confirmOk.btn-danger{background:var(--error);border-color:var(--error);color:#fff}
    #confirmOk.btn-danger:hover{filter:brightness(.95)}
    .modal.wide{width:min(820px,100%);max-height:min(86dvh,900px);display:flex;flex-direction:column}
    .modal.modal-acc{width:min(520px,100%);padding:0;overflow:visible}
    .modal-hd{padding:18px 20px 0}
    .modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;padding:14px 20px 0;overflow:visible}
    .modal-grid .field{margin:0;position:relative;overflow:visible}
    .modal-grid .field-span{grid-column:1 / -1}
    .modal-acc .row{padding:16px 20px 18px;margin:0;border-top:1px solid var(--hairline);background:var(--canvas-soft);margin-top:16px;position:relative;z-index:0;border-radius:0 0 var(--radius-xl) var(--radius-xl)}
    .field-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
    .field-hd label{margin:0}
    .field-hd-actions{display:flex;align-items:center;gap:8px}
    .field-meta{font-size:11px;color:var(--mute)}
    .modal h3{margin:0 0 6px;font-size:18px;letter-spacing:-.4px}
    .modal p{margin:0 0 14px;color:var(--body);font-size:13px;line-height:1.45}
    .modal-hd p{margin:0}
    .modal .field{margin-bottom:12px}
    .modal label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px;font-weight:500}
    .modal .row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
    .modal .hint{margin-top:8px;font-size:12px;color:var(--mute);line-height:1.4}
    .msel{position:relative;width:100%;z-index:1}
    .msel.open{z-index:30}
    .msel-btn{
      width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;
      min-height:36px;padding:7px 12px;border-radius:var(--radius);border:1px solid var(--hairline);
      background:#fff;color:var(--ink);text-align:left;cursor:pointer;
      transition:border-color .12s,box-shadow .12s,background .12s;
    }
    .msel-btn:hover{border-color:var(--hairline-strong);background:var(--canvas-soft)}
    .msel.open .msel-btn{border-color:var(--ink);box-shadow:0 0 0 3px rgba(23,23,23,.08)}
    .msel-label{
      flex:1;min-width:0;font-size:13px;line-height:1.35;color:var(--ink);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .msel-caret{width:12px;height:12px;color:var(--mute);flex-shrink:0;transition:transform .15s var(--ease)}
    .msel.open .msel-caret{transform:rotate(180deg);color:var(--ink)}
    /* fixed panel escapes modal overflow / stacking; position set in JS */
    .msel-panel{
      position:fixed;z-index:300;
      border:1px solid var(--hairline);border-radius:var(--radius-md);background:#fff;
      box-shadow:0 16px 40px rgba(0,0,0,.16);
      display:flex;flex-direction:column;
      width:min(480px,calc(100vw - 32px));
      max-height:min(320px,50vh);
      overflow:hidden;
    }
    .msel-panel[hidden]{display:none!important}
    .msel-search{padding:8px;border-bottom:1px solid var(--hairline);background:var(--canvas-soft);flex:0 0 auto}
    .msel-search .input{height:32px}
    .msel-list{
      flex:1 1 auto;min-height:0;max-height:min(240px,40vh);
      overflow-x:hidden;overflow-y:auto;padding:6px;
      -webkit-overflow-scrolling:touch;overscroll-behavior:contain;
    }
    .msel-opt{
      display:flex;align-items:center;gap:12px;min-height:36px;padding:8px 10px;
      margin:0;border-radius:var(--radius);cursor:pointer;font-size:13px;color:var(--ink);
      user-select:none;transition:background .12s;
    }
    .msel-opt:hover{background:var(--canvas-soft-2)}
    .msel-opt.on{background:#eef5ff}
    .msel-opt input[type=checkbox]{
      width:16px;height:16px;margin:0;flex:0 0 16px;align-self:center;
      accent-color:var(--ink);cursor:pointer;
    }
    .msel-name{
      flex:1;min-width:0;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .msel-empty{padding:18px 12px;text-align:center;color:var(--mute);font-size:12px;flex:0 0 auto}
    .msel-more{padding:8px;text-align:center;font-size:11px;color:var(--mute);font-family:var(--mono)}
    @media(max-width:560px){.modal-grid{grid-template-columns:1fr}}
    .key-cell{display:flex;flex-direction:column;gap:6px;min-width:0;overflow:visible}
    .key-prefix[hidden],.key-secret[hidden]{display:none!important}
    .key-secret{word-break:break-all;white-space:pre-wrap;color:var(--ink);background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:var(--radius);padding:8px 10px;font-size:11.5px;line-height:1.4;max-width:100%}
    .secret{font-family:var(--mono);font-size:12px;word-break:break-all;background:var(--canvas-soft);border:1px solid var(--hairline);border-radius:var(--radius);padding:10px}
    .admin-box{display:none;align-items:center;gap:8px;padding:4px 8px 4px 10px;border:1px solid var(--hairline);border-radius:var(--radius);background:var(--canvas-soft);max-width:300px}
    .admin-box.show{display:flex}
    .admin-box .tip{font-size:11px;color:var(--mute);line-height:1.3;max-width:100px}
    #proxyCustomWrap{display:none;flex:1;min-width:200px}
    #proxyCustomWrap.show{display:flex;gap:8px;align-items:center;flex:1}
    .log-detail{flex:1;overflow:auto;display:grid;gap:12px}
    .log-detail pre{margin:0;padding:12px;border-radius:var(--radius);border:1px solid var(--hairline);background:var(--canvas-soft);font-family:var(--mono);font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:280px;overflow:auto}
    .log-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;font-size:12px}
    .log-meta .k{color:var(--mute)}.log-meta .v{font-family:var(--mono);color:var(--ink);word-break:break-all}
    .mb{margin-bottom:12px}
    .side-toggle{display:none;flex-shrink:0}
    .side-toggle-icon{display:block}
    .side-scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.36);z-index:25;backdrop-filter:blur(1px)}
    .side-scrim.show{display:block}
    .auth-gate{position:fixed;inset:0;z-index:100;background:var(--canvas-soft);display:flex;align-items:center;justify-content:center;padding:24px}
    .auth-gate.hidden{display:none}
    .auth-card{width:min(400px,100%);background:#fff;border:1px solid var(--hairline);border-radius:var(--radius-xl);box-shadow:0 16px 48px rgba(0,0,0,.08);padding:28px 24px}
    .auth-card h1{margin:0 0 6px;font-size:22px;letter-spacing:-.6px}
    .auth-card .sub{color:var(--mute);font-size:13px;margin-bottom:18px;line-height:1.5}
    .auth-card .field{margin-bottom:12px}
    .auth-card label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
    .auth-card .input{width:100%}
    .auth-card .actions{display:flex;flex-direction:column;gap:8px;margin-top:16px}
    .auth-card .actions .btn{width:100%;height:36px}
    .auth-card .switch{text-align:center;font-size:13px;color:var(--mute);margin-top:12px}
    .auth-card .switch a{cursor:pointer}
    .auth-msg{display:none;margin-bottom:12px;padding:10px;border-radius:var(--radius);font-size:13px}
    .auth-msg.show{display:block}.auth-msg.err{background:var(--error-bg);color:var(--error)}.auth-msg.ok{background:var(--success-bg);color:var(--success)}
    [data-admin-only].hide{display:none!important}
    

    @media(max-width:1100px){
      .stats{grid-template-columns:repeat(2,1fr)}
      .usage-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
      .usage-kpis.compact{grid-template-columns:repeat(2,minmax(0,1fr))}
      .grid-2,.charts,.ov-grid{grid-template-columns:1fr}
      .ov-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}
      .ov-mini-grid{grid-template-columns:1fr 1fr}
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
        padding-left:max(16px,env(safe-area-inset-left));
        padding-right:max(16px,env(safe-area-inset-right));
        gap:10px;flex-wrap:nowrap;
      }
      .topbar-left{gap:8px;min-width:0}
      .page-title{font-size:14px}
      .page-sub{display:none}
      .top-actions{gap:4px}
      .user-meta{display:none}
      .user-menu .user-chip{padding:0 6px 0 4px;max-width:none}
      .user-avatar{width:28px;height:28px;font-size:12px}
      .content{
        padding:18px 20px 88px;
        padding-left:max(20px,env(safe-area-inset-left));
        padding-right:max(20px,env(safe-area-inset-right));
        padding-bottom:max(88px,calc(24px + env(safe-area-inset-bottom)));
      }
      .panel,.card,.contrib-hero,.rank-me{border-radius:var(--radius-lg)}
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
      /* keep actions on one line so row width stays locked to --dt-min */
      .dt-actions{flex-wrap:nowrap}
      .dt-accounts{--dt-min:1280px;--dt-cols:minmax(130px,1.2fr) 88px 88px minmax(90px,.85fr) minmax(90px,.9fr) minmax(90px,.9fr) 48px 100px 420px}
      .dt-users{--dt-min:920px;--dt-cols:minmax(130px,1.2fr) 80px 80px minmax(100px,1fr) 110px 300px}
      .dt-keys{--dt-min:820px;--dt-cols:minmax(110px,1.1fr) minmax(110px,1fr) 80px 120px 72px 200px}
      .dt-keys.has-owner{--dt-min:960px;--dt-cols:minmax(100px,1fr) minmax(100px,1fr) minmax(90px,.9fr) 80px 120px 72px 200px}
      .route-grid{grid-template-columns:1fr}
      .route-panel .seg{width:100%}
      .route-panel .seg button{flex:1}
      .filter-bar{padding:10px 12px}
      .filter-bar .input.grow{width:100%;min-width:0}
      .dt-contrib{--dt-min:1120px;--dt-cols:minmax(130px,1.1fr) 80px minmax(90px,.9fr) 128px 48px 80px minmax(100px,1fr) 100px 240px}
      .dt-logs{--dt-min:1140px;--dt-cols:110px minmax(100px,1fr) minmax(90px,1fr) 64px minmax(140px,1.2fr) 76px 84px 56px minmax(110px,1fr) minmax(80px,.85fr)}
      .dt-logs.no-account{--dt-min:1040px;--dt-cols:110px minmax(100px,1fr) minmax(90px,1fr) 64px minmax(140px,1.2fr) 76px 84px 56px minmax(110px,1fr)}
      .toast{top:max(12px,calc(env(safe-area-inset-top) + 8px));left:16px;right:16px;width:auto;max-width:none;transform:translateY(-6px);min-width:0}
      .toast.show{transform:translateY(0)}
      .modal-mask{padding:12px;padding-top:max(12px,env(safe-area-inset-top));align-items:flex-end}
      .modal,.modal.wide{width:100%;max-height:min(88dvh,900px);border-radius:var(--radius-xl) var(--radius-xl) var(--radius-md) var(--radius-md)}
    }
    @media(max-width:720px){
      .content{
        padding:16px 18px 96px;
        padding-left:max(18px,env(safe-area-inset-left));
        padding-right:max(18px,env(safe-area-inset-right));
      }
      .topbar{
        padding:10px 14px;
        padding-top:max(10px,env(safe-area-inset-top));
        padding-left:max(14px,env(safe-area-inset-left));
        padding-right:max(14px,env(safe-area-inset-right));
      }
      .user-meta{display:none}
      .user-caret{display:none}
      .stats{grid-template-columns:1fr 1fr;gap:8px}
      .usage-kpis,.usage-kpis.compact{grid-template-columns:1fr 1fr;gap:8px}
      .usage-kpis .kpi{padding:12px}
      .usage-kpis .kpi .n{font-size:18px;letter-spacing:-.5px}
      .chart-card{min-height:0;padding:12px}
      .chart-wrap{height:210px}
      .ov-welcome{padding:16px}
      .ov-welcome h1{font-size:22px}
      .ov-kpis{grid-template-columns:1fr 1fr}
      .ov-token-row{grid-template-columns:1fr 1fr}
      .ov-mini-grid{grid-template-columns:1fr}
      .chart-ov-mini{height:160px}
      .quick-actions,.quick-actions.user-only{grid-template-columns:1fr}
      .quick-actions,.quick-actions.user-only{grid-template-columns:1fr}
      .panel-hd .input{width:100%;max-width:none!important;flex:1 1 100%}
      .panel-hd .btn{flex:1 1 auto}
      .oauth-code{font-size:26px;letter-spacing:.12em;padding:14px 10px}
      .oauth-meta{flex-direction:column;align-items:flex-start}
      .mine-stats{grid-template-columns:1fr 1fr}
      .rank-me{padding:14px;gap:10px}
      .rank-me .big{font-size:32px}
      .contrib-hero{padding:18px 16px;border-radius:var(--radius-lg)}
      .contrib-hero h1{font-size:22px;letter-spacing:-.8px}
      .contrib-cta-row{gap:8px}
      .contrib-cta-row .btn{width:100%}
      .why-grid,.steps{grid-template-columns:1fr}
      .step{border-right:0;border-bottom:1px solid var(--hairline)}
      .step:last-child{border-bottom:0}
      .pager{flex-wrap:wrap;gap:8px}
    }
    @media(max-width:420px){
      .content{
        padding:14px 16px 96px;
        padding-left:max(16px,env(safe-area-inset-left));
        padding-right:max(16px,env(safe-area-inset-right));
      }
      .user-meta{display:none}
      .user-caret{display:none}
      .page-title{font-size:13.5px}
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
      position:relative;overflow:hidden;border:1px solid var(--hairline);border-radius:var(--radius-xl);
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
    .contrib-kicker{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--radius-pill);background:rgba(23,23,23,.04);border:1px solid var(--hairline);font-size:12px;font-weight:500;color:var(--body);margin-bottom:12px}
    .contrib-hero h1{margin:0;font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-1.2px}
    .contrib-hero p{margin:10px 0 0;color:var(--body);max-width:58ch;line-height:1.55}
    .contrib-cta-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:18px}
    .contrib-cta-row .btn{height:36px;padding:0 16px}
    .why-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}
    .why-card{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;padding:16px;box-shadow:var(--shadow);transition:transform .2s var(--ease),box-shadow .2s var(--ease),border-color .2s}
    .why-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.06);border-color:#e2e2e2}
    .why-ic{width:32px;height:32px;border-radius:var(--radius);display:grid;place-items:center;background:var(--canvas-soft-2);border:1px solid var(--hairline);margin-bottom:12px;color:var(--ink)}
    .why-ic svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
    .why-card h3{margin:0 0 6px;font-size:14px;font-weight:600;letter-spacing:-.2px}
    .why-card p{margin:0;font-size:12.5px;color:var(--body);line-height:1.5}
    .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:4px 0 0;counter-reset:step}
    .step{position:relative;padding:14px 16px 14px 18px;border-right:1px solid var(--hairline)}
    .step:last-child{border-right:0}
    .step .n{font-family:var(--mono);font-size:11px;color:var(--mute);letter-spacing:.04em;margin-bottom:6px}
    .step strong{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
    .step span{display:block;font-size:12px;color:var(--body);line-height:1.45}
    .add-account{border-bottom:1px solid var(--hairline);background:#fff}
    .add-account-collapsed{
      display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;
      padding:14px 18px;
    }
    .add-account-collapsed[hidden]{display:none!important}
    .add-account-summary{display:flex;flex-direction:column;gap:2px;min-width:0}
    .add-account-summary strong{font-size:13px;font-weight:600;letter-spacing:-.2px}
    .add-account-summary .mono{font-size:12px;color:var(--mute);line-height:1.4}
    .add-account-body{
      padding:14px 18px 16px;background:linear-gradient(180deg,#fcfcfc 0%,#fff 48%);
      animation:fadeIn .18s var(--ease);
    }
    .add-account-body[hidden]{display:none!important}
    .add-account-top{
      display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:10px;
      margin-bottom:12px;
    }
    .add-account-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}
    .add-method-row{
      display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px;
    }
    .add-method-seg{flex:0 0 auto}
    .add-bar{
      display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;
      padding:0 0 12px;background:transparent;border-bottom:0;
    }
    .add-pane{padding:0 0 12px}
    .add-pane[hidden]{display:none!important}
    .add-pane-hint{font-size:12px;color:var(--mute);line-height:1.45;margin:0 0 10px}
    .json-add{display:flex;flex-direction:column;gap:10px}
    .json-add-hint{font-size:12px;color:var(--mute);line-height:1.45}
    .cpa-json{
      width:100%;min-height:132px;resize:vertical;font-family:var(--mono);font-size:12px;line-height:1.45;
      padding:12px;border-radius:var(--radius-md);border:1px solid var(--hairline);background:#fff;
    }
    .cpa-json:focus{outline:none;border-color:#c7c7c7;box-shadow:0 0 0 3px rgba(0,0,0,.04)}

    .panel.contrib-action,.contrib-action{
      overflow:hidden;border-radius:var(--radius-lg);
    }
    .contrib-action.panel{overflow:hidden}
    .contrib-action-collapsed{
      display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;
      padding:18px 20px;border-radius:var(--radius-lg);
    }
    .contrib-action-collapsed[hidden]{display:none!important}
    .contrib-action-copy{display:flex;flex-direction:column;gap:4px;min-width:0;max-width:62ch}
    .contrib-action-kicker{
      font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--mute);
    }
    .contrib-action-copy strong{font-size:16px;font-weight:600;letter-spacing:-.3px;line-height:1.3}
    .contrib-action-copy p{margin:0;font-size:13px;color:var(--body);line-height:1.5}
    .contrib-action-body{
      padding:18px 20px 20px;border-top:0;
      background:linear-gradient(180deg,#fcfcfc 0%,#fff 42%);
      animation:fadeIn .18s var(--ease);
      border-radius:0 0 var(--radius-lg) var(--radius-lg);
    }
    .contrib-action-body[hidden]{display:none!important}
    .contrib-action-top{
      display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:12px;
      margin-bottom:14px;
    }
    .contrib-action-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}
    .contrib-method-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px}
    .contrib-fields{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px}
    .contrib-fields .add-field.grow{flex:1 1 220px;min-width:180px}
    .contrib-pane[hidden]{display:none!important}
    .contrib-steps{margin:0 0 12px}
    .contrib-action .oauth-stage{border:1px solid var(--hairline);border-radius:var(--radius-lg);margin-top:4px}
    .contrib-action .oauth-stage.show{display:block}
    .oauth-stage{display:none;margin:0;padding:18px;border-top:1px solid var(--hairline);background:linear-gradient(180deg,#fafafa,#fff)}
    .oauth-stage.show{display:block;animation:fadeIn .25s var(--ease)}
    .oauth-code{
      font-family:var(--mono);font-size:36px;font-weight:600;letter-spacing:.18em;color:var(--ink);
      background:#fff;border:1px dashed var(--hairline-strong);border-radius:var(--radius-lg);padding:18px 16px;text-align:center;
      user-select:all;
    }
    .oauth-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-top:12px}
    .oauth-meta .hint{font-size:12px;color:var(--mute)}
    .pulse-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--link);box-shadow:0 0 0 0 rgba(0,112,243,.5);animation:pulse 1.4s infinite;margin-right:6px;vertical-align:middle}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,112,243,.45)}70%{box-shadow:0 0 0 10px rgba(0,112,243,0)}100%{box-shadow:0 0 0 0 rgba(0,112,243,0)}}
    .mine-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .rank-me{
      display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;
      border:1px solid var(--hairline);border-radius:var(--radius-xl);background:#fff;padding:18px 20px;margin-bottom:14px;
      box-shadow:var(--shadow);
    }
    .rank-me .big{font-size:40px;line-height:1;font-weight:600;letter-spacing:-1.6px;font-variant-numeric:tabular-nums}
    .rank-me .meta{color:var(--mute);font-size:12px;margin-top:4px}
    .rank-me .pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border-radius:var(--radius-pill);background:var(--link-bg);color:var(--link-deep);border:1px solid #b6d4ff;font-size:12px;font-weight:500}
    .podium{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:12px;align-items:end;margin-bottom:16px}
    .pod{border:1px solid var(--hairline);border-radius:var(--radius-xl);background:#fff;padding:18px 14px 16px;text-align:center;box-shadow:var(--shadow);position:relative;overflow:hidden;transition:transform .2s var(--ease)}
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
    .rank-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:22px;padding:0 8px;border-radius:var(--radius-pill);background:var(--canvas-soft-2);border:1px solid var(--hairline);font-family:var(--mono);font-size:11px;font-weight:500;color:var(--body)}
    .rank-badge.top1{background:#fff6df;border-color:#f0d789;color:#9a6700}
    .rank-badge.top2{background:#f1f5f9;border-color:#cbd5e1;color:#475569}
    .rank-badge.top3{background:#fff1e8;border-color:#f0c2a0;color:#9a3412}
    .dt-contrib{--dt-min:1240px;--dt-cols:minmax(130px,1.1fr) 80px minmax(90px,.9fr) 128px 48px 80px minmax(110px,1fr) 110px 280px}
    .members-cell{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
    .members-preview{
      font-size:11px;line-height:1.3;color:var(--mute);max-width:100%;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .member-vis{
      display:flex;flex-wrap:wrap;align-items:center;gap:10px;
      margin:0 0 12px;padding:10px 12px;border:1px solid var(--hairline);border-radius:var(--radius-md);background:var(--canvas-soft);
    }
    .usage-hd{align-items:flex-start;flex-wrap:wrap;gap:12px}
    .usage-controls{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:flex-end;justify-content:flex-end}
    .usage-ctrl{display:flex;flex-direction:column;gap:4px;min-width:0}
    .usage-ctrl .field-label{font-size:11px;color:var(--mute);font-weight:500}
    .usage-ctrl .seg{max-width:100%}
    .usage-ctrl .seg button{padding:0 10px;font-size:12px;height:28px;white-space:nowrap;flex:0 0 auto}
    @media(max-width:960px){
      .usage-hd{flex-direction:column;align-items:stretch}
      .usage-hd .spacer{display:none}
      .usage-controls{
        width:100%;flex-direction:column;align-items:stretch;gap:10px;
        justify-content:flex-start;
      }
      .usage-ctrl{width:100%}
      .usage-ctrl .seg{
        display:flex;width:100%;max-width:100%;
        overflow-x:auto;-webkit-overflow-scrolling:touch;
        scrollbar-width:none;
      }
      .usage-ctrl .seg::-webkit-scrollbar{display:none}
      .usage-ctrl .seg button{
        flex:1 0 auto;min-width:0;padding:0 8px;font-size:12px;height:32px;
      }
    }
    @media(max-width:420px){
      .usage-ctrl .seg button{padding:0 6px;font-size:11px}
      .usage-kpis .kpi .n{font-size:18px;line-height:1.2}
      .usage-kpis .kpi{padding:12px 10px}
      .chart-wrap{height:220px;min-height:220px}
    }
    .member-list{display:grid;gap:8px;max-height:min(360px,50vh);overflow:auto;margin:4px 0 8px}
    .member-add{display:grid;gap:10px;margin:4px 0 12px;padding:12px;border:1px solid var(--hairline);border-radius:var(--radius-md);background:var(--canvas-soft)}
    .member-add .field-hd{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
    .member-add .field-hd .field-label{margin:0}
    .member-add-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-left:auto}
    .msel-inline{position:relative;z-index:1}
    .msel-panel-inline{
      position:relative!important;left:auto!important;top:auto!important;right:auto!important;
      width:100%!important;max-height:none;z-index:1;
      box-shadow:none;border:0!important;border-radius:0;background:transparent;overflow:visible;
      display:flex!important;flex-direction:column;gap:0;
    }
    .msel-panel-inline .msel-search{
      padding:0;border:0;background:transparent;flex:0 0 auto;
    }
    .msel-panel-inline .msel-search .input{
      height:36px;border-radius:var(--radius);background:#fff;
    }
    .msel-panel-inline .msel-list{
      display:none;max-height:min(180px,30vh);padding:4px;margin-top:8px;
      border:1px solid var(--hairline);border-radius:var(--radius);background:#fff;
    }
    .msel-panel-inline .msel-list.has-items{display:block}
    .msel-panel-inline .msel-empty{
      display:none;margin-top:8px;padding:12px;border:1px solid var(--hairline);border-radius:var(--radius);
      background:#fff;text-align:center;color:var(--mute);font-size:12px;
    }
    .msel-panel-inline .msel-empty:not([hidden]){display:block}
    .msel-panel-inline .msel-opt{
      display:flex;align-items:center;gap:10px;min-height:36px;padding:8px 10px;
      margin:0;line-height:1.35;border-radius:var(--radius-sm);
    }
    .msel-panel-inline .msel-opt input[type=checkbox]{
      width:16px;height:16px;margin:0;flex:0 0 16px;align-self:center;
      position:relative;top:0;transform:none;
    }
    .msel-panel-inline .msel-name{
      flex:1;min-width:0;line-height:1.35;display:block;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    .member-row{
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:10px 12px;border:1px solid var(--hairline);border-radius:var(--radius-md);background:var(--canvas-soft);
    }
    .member-row.donor{background:#eef5ff;border-color:#c7ddff}
    .member-main{min-width:0}
    .msel-opt.locked{cursor:default;opacity:1;background:#f3f4f6}
    .msel-opt.locked:hover{background:#f3f4f6}
    .msel-tag{
      display:inline-block;margin-left:6px;padding:1px 6px;border-radius:var(--radius-pill);
      font-size:10px;font-weight:500;color:var(--mute);background:#fff;border:1px solid var(--hairline);
      vertical-align:middle;
    }
    .dt-lb{--dt-min:560px;--dt-cols:64px minmax(100px,1.4fr) 72px 72px 72px 72px}
    .dt-lb-pub{--dt-min:440px;--dt-cols:72px minmax(120px,1.5fr) 100px 100px}
    .lb-boards{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
    .lb-board{min-width:0}
    .lb-board-hd{
      display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px;
      margin-bottom:12px;padding:2px 2px 0;
    }
    .lb-board-hd strong{font-size:15px;font-weight:600;letter-spacing:-.3px}
    .lb-board-hd .mono{font-size:12px;color:var(--mute)}
    .lb-board .rank-me{margin-bottom:12px}
    .lb-board .panel{margin-top:0}
    .empty-cta{padding:48px 20px;text-align:center}
    .empty-cta h3{margin:0 0 6px;font-size:16px;font-weight:600}
    .empty-cta p{margin:0 0 16px;color:var(--mute);font-size:13px}
    @media(max-width:1100px){
      .why-grid,.steps,.mine-stats{grid-template-columns:1fr 1fr}
      .podium{grid-template-columns:1fr}
      .pod.gold,.pod.silver,.pod.bronze{min-height:auto}
      .lb-boards{grid-template-columns:1fr}
    }


    /* ===== Media studio ===== */
    .content:has(#view-media.on){padding-bottom:24px;overflow:hidden}
    /* Media page: keep within viewport; form/result scroll independently */
    #view-media.on{
      display:flex;flex-direction:column;min-height:0;
      height:calc(100dvh - var(--top) - 48px);max-height:calc(100dvh - var(--top) - 48px);
      overflow:hidden
    }
    .media-shell{
      display:flex;flex-direction:column;gap:12px;min-height:0;flex:1 1 auto;overflow:hidden;height:100%;max-height:100%
    }
    .media-hero{
      display:flex;justify-content:space-between;gap:16px;align-items:flex-end;flex:0 0 auto;
      padding:14px 16px;border:1px solid var(--hairline);border-radius:var(--radius-lg);
      background:
        radial-gradient(120% 140% at 100% 0%, #eef6ff 0%, rgba(255,255,255,0) 48%),
        linear-gradient(180deg,#fff 0%, #fafafa 100%);
      /* Avoid double edge: border already draws the outline, keep only soft elevation */
      box-shadow:0 1px 2px rgba(0,0,0,.04);
    }
    .media-hero-copy{min-width:0}
    .media-kicker{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);margin-bottom:6px}
    .media-hero h1{margin:0 0 6px;font-size:24px;letter-spacing:-.55px;line-height:1.15}
    .media-hero p{margin:0;max-width:56ch;color:var(--body);font-size:13px;line-height:1.5}
    .media-hero-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end}
    .media-layout{
      display:grid;grid-template-columns:minmax(0,1fr) 376px;gap:16px;align-items:stretch;
      min-height:0;flex:1 1 auto;overflow:hidden;height:100%;max-height:100%
    }
    .media-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
    .media-side{
      min-width:0;min-height:0;height:100%;max-height:100%;
      display:flex;flex-direction:column;
      overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;
      scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.18) transparent;
      -webkit-overflow-scrolling:touch;
    }
    .media-side::-webkit-scrollbar{width:8px;height:8px}
    .media-side::-webkit-scrollbar-thumb{background:rgba(0,0,0,.14);border-radius:var(--radius-pill)}
    .media-side::-webkit-scrollbar-track{background:transparent}
    .media-studio{
      min-height:0;flex:1 1 auto;display:flex;flex-direction:column;
      overflow:hidden;border-radius:var(--radius-lg);
      box-shadow:0 1px 2px rgba(0,0,0,.04)
    }
    .media-studio.panel{overflow:hidden}
    .media-studio .media-body,
    .media-studio .media-form{
      border-top-left-radius:inherit;border-top-right-radius:inherit
    }
    .media-mcp{
      flex:0 0 auto;display:flex;flex-direction:column;overflow:visible;
      border-radius:var(--radius-lg);height:auto;max-height:none;min-height:0
    }
    .media-mcp.panel{overflow:visible}
    .media-mcp .panel-hd{flex:0 0 auto}
    .media-mcp .panel-bd{flex:0 0 auto;min-height:0;overflow:visible}
    .media-advanced{overflow:visible}
    .media-body{
      display:grid;grid-template-columns:minmax(0,1fr);gap:0;min-height:0;flex:1 1 auto;overflow:hidden
    }
    .media-body.has-result{grid-template-columns:minmax(300px,.95fr) minmax(300px,1.05fr)}
    .media-form{
      display:flex;flex-direction:column;padding:0;background:#fff;min-width:0;min-height:0;overflow:hidden
    }
    .media-body.has-result .media-form{border-right:1px solid var(--hairline)}
    .media-form-scroll{
      flex:1 1 auto;min-height:0;overflow:auto;padding:16px 16px 8px;
      scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.18) transparent
    }
    .media-form-scroll::-webkit-scrollbar{width:8px;height:8px}
    .media-form-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.14);border-radius:var(--radius-pill)}
    .media-form-scroll::-webkit-scrollbar-track{background:transparent}
    .media-toolbar{
      display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:10px;
      padding:10px;margin:0 0 16px;border:1px solid var(--hairline);
      border-radius:var(--radius-md);background:var(--canvas-soft);
      box-shadow:none
    }
    /* nested radius: outer 10 - pad 10, keep inner controls slightly tighter */
    .media-toolbar .cselect,
    .media-toolbar .cselect-btn,
    .media-toolbar .input{border-radius:var(--radius-sm)}
    .media-toolbar .cselect-menu{border-radius:var(--radius)}
    .media-toolbar .cselect-opt{border-radius:calc(var(--radius-sm) - 2px)}
    .media-toolbar-field{margin:0}
    .media-toolbar-field label{display:block;font-size:12px;color:var(--mute);margin:0 0 8px}
    .media-form-stack{display:flex;flex-direction:column;gap:16px}
    .media-form .field{margin:0}
    .media-form label{display:block;font-size:12px;color:var(--mute);margin:0 0 8px;line-height:1.2}
    .media-label-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
    .media-label-row label{margin:0}
    .media-prompt{width:100%;min-height:120px;resize:vertical;line-height:1.55;padding:12px 14px}
    .media-prompt.is-streaming{border-color:#cfe3ff;box-shadow:0 0 0 3px rgba(59,130,246,.08)}
    .media-polish-box{margin-top:10px;display:grid;gap:6px}
    .media-polish-label{display:block;font-size:12px;color:var(--mute);margin:0;line-height:1.2}
    .media-polish-input{width:100%}
    .media-help{margin-top:8px;font-size:12px;color:var(--mute);line-height:1.45}
    .media-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px;align-items:start}
    .media-form .input,.media-form .cselect,.media-side .input,.media-side .cselect,.media-toolbar .cselect{width:100%;min-width:0}
    .media-source-card{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:var(--canvas-soft);padding:12px;display:grid;gap:10px}
    .media-source-drop{display:block;cursor:pointer}
    .media-source-preview{
      min-height:148px;border-radius:var(--radius-md);border:1px dashed #d8d8d8;background:#fff;
      display:grid;place-items:center;overflow:hidden;color:var(--mute);font-size:12.5px;text-align:center;padding:16px;
      transition:border-color .15s var(--ease), background .15s var(--ease)
    }
    .media-source-drop:hover .media-source-preview{border-color:#bdbdbd;background:#fafafa}
    .media-source-preview img{width:100%;height:100%;object-fit:cover;display:block}
    .media-source-url{width:100%}
    .media-advanced{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:var(--canvas-soft)}
    .media-advanced summary{cursor:pointer;list-style:none;padding:12px 14px;font-size:12.5px;font-weight:500;color:var(--body)}
    .media-advanced summary::-webkit-details-marker{display:none}
    .media-advanced-body{padding:12px 14px 14px}
    .media-advanced[open]{position:relative;z-index:6}
    .media-advanced[open] summary{border-bottom:1px solid var(--hairline)}
    .media-advanced .cselect.open{z-index:90}
    .media-actions{
      display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex:0 0 auto;
      padding:12px 16px;margin:0;border-top:1px solid var(--hairline);background:rgba(255,255,255,.96);
      backdrop-filter:blur(8px);position:sticky;bottom:0;z-index:2
    }
    .media-status{font-size:12px;color:var(--mute);display:inline-flex;align-items:center;gap:6px;min-height:20px}
    .media-status[hidden]{display:none!important}
    .media-status.ok{color:var(--success)}
    .media-status.err{color:var(--error)}
    .media-status.loading{color:var(--body)}
    #btnMediaAiPrompt.is-loading{opacity:.85;pointer-events:none}
    #btnMediaAiPrompt .media-inline-spin{
      width:12px;height:12px;border-radius:var(--radius-pill);border:1.5px solid currentColor;border-right-color:transparent;
      display:inline-block;animation:mediaSpin .7s linear infinite
    }
    @keyframes mediaSpin{to{transform:rotate(360deg)}}
    .media-result{
      display:none;flex-direction:column;min-height:0;height:100%;overflow:hidden;
      background:linear-gradient(180deg,#fcfcfc 0%,#f7f7f7 100%)
    }
    .media-body.has-result .media-result{display:flex}
    .media-result[hidden]{display:none!important}
    .media-result-hd{
      display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
      padding:14px 16px;border-bottom:1px solid var(--hairline);flex:0 0 auto;background:rgba(252,252,252,.96)
    }
    .media-result-hd strong{display:block;font-size:13px;font-weight:600}
    .media-result-sub{margin-top:4px;font-size:12px}
    .media-result-bd{
      flex:1 1 auto;padding:16px;min-height:0;display:flex;flex-direction:column;overflow:auto;
      scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.18) transparent
    }
    .media-result-bd::-webkit-scrollbar{width:8px;height:8px}
    .media-result-bd::-webkit-scrollbar-thumb{background:rgba(0,0,0,.14);border-radius:var(--radius-pill)}
    .media-result-bd::-webkit-scrollbar-track{background:transparent}
    .media-empty{
      flex:1;min-height:280px;display:grid;place-items:center;text-align:center;color:var(--mute);
      border:1px dashed #e3e3e3;border-radius:var(--radius-xl);background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(250,250,250,.96));
      padding:32px 24px
    }
    .media-empty-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:6px}
    .media-empty-sub{font-size:12.5px;color:var(--mute);line-height:1.5;max-width:34ch}
    .media-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;width:100%}
    .media-gallery.is-single{
      display:flex;align-items:center;justify-content:center;flex:1;min-height:360px;padding:8px 0
    }
    .media-thumb{display:block;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--hairline);background:#fff;aspect-ratio:1;box-shadow:var(--shadow)}
    .media-thumb img{width:100%;height:100%;object-fit:cover;display:block}
    .media-thumb.is-hero{
      width:min(100%,520px);max-width:100%;aspect-ratio:auto;min-height:280px;max-height:min(62vh,560px);
      background:#0b0b0b;box-shadow:0 12px 32px rgba(0,0,0,.08),var(--shadow)
    }
    .media-thumb.is-hero img{
      width:100%;height:100%;max-height:min(62vh,560px);object-fit:contain;background:
        linear-gradient(180deg,#111 0%,#1a1a1a 100%)
    }
    .media-videos{display:grid;gap:12px;width:100%}
    .media-videos.is-single{display:flex;align-items:center;justify-content:center;flex:1;min-height:360px}
    .media-video{width:100%;border-radius:var(--radius-lg);border:1px solid var(--hairline);background:#000;max-height:420px}
    .media-video.is-hero{width:min(100%,640px);max-height:min(62vh,560px);box-shadow:0 12px 32px rgba(0,0,0,.12)}

    /* Video progress */
    .media-result-hd{align-items:center}
    .media-result-hd-main{min-width:0}
    .media-result-idbar{
      display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;
      max-width:min(100%,420px)
    }
    .media-result-id-label{font-size:11px;color:var(--mute);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
    .media-result-id{
      display:inline-block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      padding:5px 8px;border-radius:var(--radius-sm);background:var(--canvas-soft);border:1px solid var(--hairline);
      color:var(--ink);font-size:11.5px
    }
    .media-progress-card{
      border:1px solid var(--hairline);border-radius:var(--radius-lg);background:
        radial-gradient(120% 90% at 100% 0%, rgba(0,112,243,.08), transparent 42%),
        linear-gradient(180deg,#fff 0%, #fafafa 100%);
      box-shadow:var(--shadow);padding:16px;margin-bottom:14px
    }
    .media-progress-card.is-running{border-color:#d7e8ff}
    .media-progress-card.is-done{border-color:#cfeedd;background:linear-gradient(180deg,#fff 0%, #f3fbf6 100%)}
    .media-progress-card.is-failed{border-color:#f3c1c1;background:linear-gradient(180deg,#fff 0%, #fff5f5 100%)}
    .media-progress-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
    .media-progress-kicker{font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--mute);margin-bottom:4px}
    .media-progress-title{font-size:15px;font-weight:650;letter-spacing:-.2px;color:var(--ink);line-height:1.25}
    .media-progress-sub{margin-top:4px;font-size:12px;color:var(--body);line-height:1.4}
    .media-progress-badge{
      flex:0 0 auto;display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:var(--radius-pill);
      border:1px solid var(--hairline);background:#fff;color:var(--body);font-size:12px;font-weight:600
    }
    .media-progress-card.is-running .media-progress-badge{background:#eef6ff;border-color:#cfe3ff;color:var(--link-deep)}
    .media-progress-card.is-done .media-progress-badge{background:var(--success-bg);border-color:#bfe6cb;color:var(--success)}
    .media-progress-card.is-failed .media-progress-badge{background:var(--error-bg);border-color:#f0b8b8;color:var(--error)}
    .media-progress-idrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    .media-progress-id-label{font-size:11px;color:var(--mute);font-weight:600}
    .media-progress-id{
      max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      padding:5px 8px;border-radius:var(--radius-sm);background:#fff;border:1px solid var(--hairline);font-size:11.5px
    }
    .media-progress-track{
      height:10px;border-radius:var(--radius-pill);background:rgba(23,23,23,.06);overflow:hidden;border:1px solid var(--hairline)
    }
    .media-progress-track.is-indeterminate .media-progress-fill{
      width:36%!important;animation:mediaProgressIndeterminate 1.1s ease-in-out infinite
    }
    @keyframes mediaProgressIndeterminate{
      0%{transform:translateX(-120%)}
      100%{transform:translateX(320%)}
    }
    .media-progress-fill{
      height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#6aa8ff 0%, #0070f3 55%, #5b8def 100%);
      box-shadow:0 0 0 1px rgba(0,112,243,.08) inset;transition:width .45s var(--ease);position:relative
    }
    .media-progress-card.is-running .media-progress-fill::after{
      content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
      transform:translateX(-100%);animation:mediaProgressShine 1.3s ease-in-out infinite
    }
    .media-progress-card.is-done .media-progress-fill{background:linear-gradient(90deg,#34c77b,#0a7a3e)}
    .media-progress-card.is-failed .media-progress-fill{background:linear-gradient(90deg,#ff7b7b,#ee0000)}
    @keyframes mediaProgressShine{to{transform:translateX(100%)}}
    .media-progress-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;color:var(--mute);font-size:12px}
    .media-progress-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
    .media-progress-step{
      display:flex;align-items:center;gap:6px;min-width:0;padding:8px 8px;border-radius:var(--radius);
      border:1px solid var(--hairline);background:#fff;color:var(--mute);font-size:11.5px;font-weight:500
    }
    .media-progress-step i{
      width:8px;height:8px;border-radius:50%;background:#d4d4d4;flex:0 0 auto
    }
    .media-progress-step span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .media-progress-step.done{color:var(--success);border-color:#cfeedd;background:#f3fbf6}
    .media-progress-step.done i{background:var(--success)}
    .media-progress-step.active{color:var(--link-deep);border-color:#cfe3ff;background:#f5f9ff}
    .media-progress-step.active i{background:var(--link);box-shadow:0 0 0 4px rgba(0,112,243,.12)}
    .media-progress-step.fail{color:var(--error);border-color:#f0b8b8;background:#fff5f5}
    .media-progress-step.fail i{background:var(--error)}
    @media(max-width:720px){
      .media-result-hd{align-items:flex-start;flex-direction:column}
      .media-result-idbar{justify-content:flex-start;max-width:100%}
      .media-progress-steps{grid-template-columns:1fr 1fr}
    }

    .media-job{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
    .media-json{margin:0;padding:12px;border-radius:var(--radius-md);border:1px solid var(--hairline);background:#fff;font-family:var(--mono);font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:var(--body)}
    .media-mcp-bd{display:flex;flex-direction:column;gap:14px;min-height:0}
    .media-side-copy{margin:0;color:var(--body);font-size:12.5px;line-height:1.5}
    .media-field-tight{margin:0}
    .media-field-tight label{display:block;font-size:12px;color:var(--mute);margin:0 0 8px}
    .media-codebox{position:relative;border:1px solid #1f2937;border-radius:var(--radius-lg);background:#0b1220;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
    .media-code-copy{position:absolute;top:8px;right:8px;z-index:2;width:28px;height:28px;border:1px solid rgba(255,255,255,.1);border-radius:var(--radius);background:rgba(255,255,255,.05);color:#e5e7eb;display:inline-flex;align-items:center;justify-content:center;padding:0}
    .media-code-copy:hover{background:rgba(255,255,255,.1);color:#fff}
    .media-code-pre{
      margin:0;padding:14px 38px 14px 14px;max-height:210px;overflow:auto;
      font-family:var(--mono);font-size:11.5px;line-height:1.55;color:#e5e7eb;
      white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;tab-size:2;
      scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent
    }
    .media-code-pre::-webkit-scrollbar{width:6px;height:6px}
    .media-code-pre::-webkit-scrollbar-track{background:transparent}
    .media-code-pre::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:var(--radius-pill)}
    .media-code-pre::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.24)}
    .media-code-pre::-webkit-scrollbar-corner{background:transparent}
    .media-code-pre .j-key{color:#93c5fd}
    .media-code-pre .j-str{color:#86efac}
    .media-code-pre .j-num{color:#fbbf24}
    .media-code-pre .j-bool{color:#f0abfc}
    .media-code-pre .j-null{color:#94a3b8}
    .media-tools{border:1px solid var(--hairline);border-radius:var(--radius-lg);background:#fff;overflow:hidden}
    .media-tools > summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;font-size:12.5px;font-weight:600;color:var(--ink)}
    .media-tools > summary::-webkit-details-marker{display:none}
    .media-tools-caret{width:8px;height:8px;border-right:1.5px solid var(--mute);border-bottom:1.5px solid var(--mute);transform:rotate(45deg);transition:transform .15s var(--ease);margin-top:-3px;flex:0 0 auto}
    .media-tools[open] .media-tools-caret{transform:rotate(225deg);margin-top:3px}
    .media-tool-list{list-style:none;margin:0;padding:0 10px 10px;display:grid;gap:8px}
    .media-tool-list li{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid var(--hairline);border-radius:var(--radius-md);background:var(--canvas-soft);min-width:0}
    .media-tool-list code{font-family:var(--mono);font-size:11px;color:var(--ink);line-height:1.35;white-space:normal;overflow-wrap:anywhere;word-break:break-word;min-width:0;flex:1 1 auto}
    .media-tool-list span{font-size:11.5px;color:var(--mute);line-height:1.35;white-space:nowrap;flex:0 0 auto;text-align:right}
    .media-mcp-tools-cfg{padding:0 10px 12px;display:grid;gap:10px;min-height:0}
    .media-mcp-tool-toggles{display:grid;gap:8px;max-height:min(360px,42vh);overflow:auto;padding-right:2px;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.18) transparent}
    .media-mcp-tool-toggles::-webkit-scrollbar{width:6px}
    .media-mcp-tool-toggles::-webkit-scrollbar-thumb{background:rgba(0,0,0,.16);border-radius:999px}
    .media-mcp-tool-toggles::-webkit-scrollbar-track{background:transparent}
    .media-mcp-tool-item{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1px solid var(--hairline);border-radius:var(--radius-md);background:var(--canvas-soft);cursor:pointer;transition:border-color .15s var(--ease), background .15s var(--ease)}
    .media-mcp-tool-item.is-on,.media-mcp-tool-item:has(input:checked){border-color:rgba(17,17,17,.18);background:#fff}
    .media-mcp-tool-item input{margin-top:3px;flex:0 0 auto;width:15px;height:15px;accent-color:var(--ink)}
    .media-mcp-tool-meta{display:grid;gap:2px;min-width:0;flex:1 1 auto}
    .media-mcp-tool-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;min-width:0}
    .media-mcp-tool-meta code{font-family:var(--mono);font-size:11px;color:var(--ink);overflow-wrap:anywhere;line-height:1.35}
    .media-mcp-tool-meta em{font-style:normal;font-size:11.5px;color:var(--mute);line-height:1.35}
    .media-mcp-tool-badge{flex:0 0 auto;font-size:10.5px!important;color:var(--mute)!important;white-space:nowrap;padding:1px 6px;border:1px solid var(--hairline);border-radius:999px;background:var(--canvas-soft-2)}

    .media-steps{display:grid;gap:8px}
    .media-step{display:grid;grid-template-columns:22px 1fr;gap:10px;align-items:center;min-height:40px;padding:8px 12px;border-radius:var(--radius);background:var(--canvas-soft);border:1px solid var(--hairline)}
    .media-step strong{width:22px;height:22px;border-radius:var(--radius-pill);display:inline-flex;align-items:center;justify-content:center;background:var(--ink);color:#fff;font-size:11px;flex:0 0 auto}
    .media-step span{font-size:12px;color:var(--body);line-height:1.35;display:flex;align-items:center}
    .pill.soft{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-pill);background:var(--canvas-soft-2);border:1px solid var(--hairline);color:var(--body);font-size:12px}
    #mediaVideoOpts[hidden],#mediaImageOpts[hidden],#mediaImageUrlField[hidden],#mediaVideoUrlField[hidden],#mediaFormatField[hidden],#mediaVideoAspectField[hidden],#mediaResultPanel[hidden]{display:none!important}
    @media(max-width:1180px){
      #view-media.on{height:auto;max-height:none}
      .media-shell{overflow:visible}
      .media-layout{grid-template-columns:1fr;overflow:visible}
      .media-main,.media-side,.media-studio,.media-mcp,.media-body,.media-form,.media-result{overflow:visible;height:auto;max-height:none}
      .media-side{overflow:visible}
      .media-form-scroll,.media-result-bd,.media-mcp .panel-bd{overflow:visible}
      .media-body.has-result{grid-template-columns:1fr;min-height:0}
      .media-body.has-result .media-form{border-right:0;border-bottom:1px solid var(--hairline)}
      .media-hero{align-items:flex-start;flex-direction:column}
      .media-hero-meta{justify-content:flex-start}
      .media-actions{position:static}
    }
    @media(max-width:720px){
      .media-grid-2,.media-toolbar{grid-template-columns:1fr}
      .media-hero h1{font-size:22px}
    }

    .media-thumb{cursor:zoom-in}
    .media-lightbox{
      position:fixed;inset:0;z-index:320;display:none;background:rgba(8,10,14,.88);
      backdrop-filter:blur(4px)
    }
    .media-lightbox.show{display:block}
    .media-lightbox[hidden]{display:none!important}
    body.media-lb-open{overflow:hidden}
    .media-lightbox-backdrop{position:absolute;inset:0}
    .media-lightbox-stage{
      position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
      overflow:hidden;cursor:grab;touch-action:none;user-select:none
    }
    .media-lightbox-stage.is-dragging{cursor:grabbing}
    .media-lightbox-stage img{
      max-width:min(92vw,1200px);max-height:min(86vh,900px);width:auto;height:auto;
      object-fit:contain;transform-origin:center center;will-change:transform;
      border-radius:var(--radius-md);box-shadow:0 20px 60px rgba(0,0,0,.45);pointer-events:none;background:#0a0a0a
    }
    .media-lightbox-toolbar{
      position:absolute;top:16px;right:16px;z-index:2;display:flex;gap:8px;
      padding:6px;border-radius:var(--radius-pill);background:rgba(20,20,20,.72);border:1px solid rgba(255,255,255,.12);
      backdrop-filter:blur(8px)
    }
    .media-lb-btn{
      width:34px;height:34px;border:0;border-radius:var(--radius-pill);background:transparent;color:#f5f5f5;
      font-size:15px;font-weight:600;display:inline-flex;align-items:center;justify-content:center
    }
    .media-lb-btn:hover{background:rgba(255,255,255,.12)}
    .media-lightbox-hint{
      position:absolute;left:50%;bottom:18px;transform:translateX(-50%);
      padding:7px 12px;border-radius:var(--radius-pill);background:rgba(20,20,20,.7);border:1px solid rgba(255,255,255,.1);
      color:rgba(255,255,255,.78);font-size:12px;pointer-events:none;white-space:nowrap
    }
    @media(max-width:720px){
      .media-lightbox-toolbar{top:10px;right:10px}
      .media-lightbox-hint{bottom:12px;font-size:11px}
      .media-lightbox-stage img{max-width:96vw;max-height:78vh}
    }

    @media(prefers-reduced-motion:reduce){.view.on,.modal-mask.show{animation:none}.pulse-dot{animation:none}*{transition:none!important}}
  `;
}
