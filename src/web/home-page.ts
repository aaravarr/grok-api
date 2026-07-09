/** Public marketing homepage at `/` */
export function homePageHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Grok API</title>
  <style>
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-Medium.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist";src:url("/static/fonts/Geist-SemiBold.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist Mono";src:url("/static/fonts/GeistMono-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:"Geist Mono";src:url("/static/fonts/GeistMono-Medium.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
    :root {
      --ink:#0a0a0a;
      --body:#525252;
      --mute:#a3a3a3;
      --line:#e5e5e5;
      --soft:#f5f5f5;
      --card:#ffffff;
      --accent:#0a0a0a;
      --ok:#15803d;
      --ok-bg:#dcfce7;
      --warn:#b45309;
      --warn-bg:#ffedd5;
      --font:"Geist",ui-sans-serif,system-ui,-apple-system,sans-serif;
      --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
      --ease:cubic-bezier(.16,1,.3,1);
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    html,body{margin:0;padding:0}
    body{
      font-family:var(--font);color:var(--ink);background:#fff;
      font-size:15px;line-height:1.5;letter-spacing:-.01em;
      min-height:100dvh;-webkit-font-smoothing:antialiased;
    }
    button,input{font:inherit} button{cursor:pointer}
    a{color:inherit;text-decoration:none}
    .wrap{width:min(1120px,100%);margin:0 auto;padding:0 24px}

    /* nav */
    .nav{
      position:sticky;top:0;z-index:40;height:64px;
      display:flex;align-items:center;justify-content:space-between;
      border-bottom:1px solid transparent;
      background:rgba(255,255,255,.84);backdrop-filter:saturate(180%) blur(12px);
      transition:border-color .2s var(--ease),box-shadow .2s var(--ease);
    }
    .nav.scrolled{border-color:var(--line);box-shadow:0 1px 0 rgba(0,0,0,.02)}
    .brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.03em}
    .mark{
      width:22px;height:22px;border-radius:6px;background:var(--ink);
      display:grid;place-items:center;flex-shrink:0;
    }
    .nav-right{display:flex;align-items:center;gap:8px}
    .seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
    .seg button{border:0;background:transparent;height:30px;padding:0 11px;color:var(--body);font-size:13px;font-weight:500}
    .seg button:hover{background:var(--soft)}
    .seg button.on{background:var(--ink);color:#fff}

    .btn{
      display:inline-flex;align-items:center;justify-content:center;gap:6px;
      height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--ink);
      background:var(--ink);color:#fff;font-weight:500;font-size:13.5px;
      transition:transform .12s var(--ease),opacity .15s,background .15s;
      white-space:nowrap;
    }
    .btn:hover{background:#000}
    .btn:active{transform:scale(.98)}
    .btn-ghost{background:transparent;color:var(--ink);border-color:var(--line)}
    .btn-ghost:hover{background:var(--soft);border-color:#d4d4d4}
    .btn-lg{height:42px;padding:0 18px;font-size:14px;border-radius:10px}

    /* hero */
    .hero{
      min-height:min(78dvh,720px);
      display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);
      gap:48px;align-items:center;padding:48px 0 64px;
    }
    .hero h1{
      margin:0;font-size:clamp(36px,4.8vw,52px);line-height:1.05;
      letter-spacing:-.045em;font-weight:600;max-width:14ch;
    }
    .hero .lead{
      margin:18px 0 0;color:var(--body);font-size:16px;line-height:1.55;
      max-width:38ch;
    }
    .hero-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
    .hero-note{margin-top:16px;font-family:var(--mono);font-size:12px;color:var(--mute)}

    .terminal{
      border:1px solid var(--line);border-radius:14px;background:#0a0a0a;color:#e5e5e5;
      overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.12);
      transform:translateY(0);transition:transform .4s var(--ease);
    }
    .terminal:hover{transform:translateY(-2px)}
    .term-bar{
      display:flex;align-items:center;gap:6px;padding:12px 14px;
      border-bottom:1px solid #262626;background:#111;
    }
    .dot{width:8px;height:8px;border-radius:50%;background:#404040}
    .dot.r{background:#525252}.dot.y{background:#737373}.dot.g{background:#a3a3a3}
    .term-path{margin-left:8px;font-family:var(--mono);font-size:11px;color:#737373}
    .term-body{padding:16px 16px 18px;font-family:var(--mono);font-size:12.5px;line-height:1.7}
    .term-body .c{color:#a3a3a3}
    .term-body .g{color:#86efac}
    .term-body .w{color:#fafafa}
    .term-body .dim{color:#525252}

    /* sections */
    .section{padding:72px 0}
    .section h2{
      margin:0 0 8px;font-size:clamp(24px,3vw,32px);letter-spacing:-.03em;font-weight:600;
    }
    .section .sub{margin:0 0 28px;color:var(--body);max-width:48ch;font-size:15px}

    .bento{
      display:grid;grid-template-columns:1.2fr 1fr 1fr;grid-template-rows:auto auto;
      gap:12px;
    }
    .tile{
      border:1px solid var(--line);border-radius:14px;background:var(--card);
      padding:22px;min-height:160px;display:flex;flex-direction:column;justify-content:space-between;
      transition:border-color .2s var(--ease),box-shadow .2s var(--ease),transform .2s var(--ease);
    }
    .tile:hover{border-color:#d4d4d4;box-shadow:0 12px 32px rgba(0,0,0,.04);transform:translateY(-1px)}
    .tile.wide{grid-column:1 / 2;grid-row:1 / 3;min-height:340px;background:linear-gradient(165deg,#0a0a0a 0%,#171717 100%);color:#fafafa;border-color:#0a0a0a}
    .tile.wide p{color:#a3a3a3}
    .tile h3{margin:0;font-size:17px;letter-spacing:-.02em;font-weight:600}
    .tile p{margin:10px 0 0;font-size:14px;line-height:1.55;color:var(--body)}
    .tile .num{font-family:var(--mono);font-size:12px;color:var(--mute);margin-bottom:18px}
    .tile.wide .num{color:#737373}
    .tile .foot{margin-top:24px;font-family:var(--mono);font-size:12px;color:var(--mute)}
    .tile.wide .foot{color:#737373}

    /* examples */
    .ex-head{
      display:flex;align-items:flex-end;justify-content:space-between;gap:16px;
      flex-wrap:wrap;margin-bottom:16px;
    }
    .ex-head h2{margin:0}
    .ex-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .ex-card{
      border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#0a0a0a;
      box-shadow:0 16px 40px rgba(0,0,0,.08);
    }
    .ex-card-top{
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:12px 16px;border-bottom:1px solid #262626;background:#111;
      font-family:var(--mono);font-size:12px;color:#a3a3a3;
    }
    .ex-card pre{
      margin:0;padding:18px 16px;font-family:var(--mono);font-size:12.5px;line-height:1.7;
      color:#e5e5e5;overflow-x:auto;white-space:pre-wrap;word-break:break-all;min-height:128px;
    }
    .ex-hint{margin:12px 0 0;font-size:13px;color:var(--mute)}

    /* footer */
    .foot{
      border-top:1px solid var(--line);padding:28px 0 40px;
      display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
      font-size:13px;color:var(--mute);
    }
    .foot a{color:var(--mute)}
    .foot a:hover{color:var(--ink)}
    @media (max-width:900px){
      .wrap{padding:0 16px}
      .hero{grid-template-columns:1fr;gap:28px;min-height:auto;padding:28px 0 40px}
      .hero h1{max-width:none;font-size:34px}
      .bento{grid-template-columns:1fr}
      .tile.wide{grid-column:auto;grid-row:auto;min-height:200px}
      .section{padding:48px 0}
      .nav{padding:0 4px;height:56px}
    }
    @media (prefers-reduced-motion:reduce){
      html{scroll-behavior:auto}
      .terminal,.tile,.btn{transition:none!important}
    }
  </style>
</head>
<body>
  <div class="nav" id="nav">
    <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;width:100%">
      <a class="brand" href="/">
        <span class="mark" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 13H1.5L8 1Z" fill="white"/></svg></span>
        <span>Grok API</span>
      </a>
      <div class="nav-right">
        <div class="seg" id="langSeg">
          <button type="button" data-lang="zh" class="on">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <a class="btn btn-ghost" id="btnLogin" href="/login">Sign in</a>
        <a class="btn" id="btnPrimary" href="/login">Open console</a>
      </div>
    </div>
  </div>

  <main>
    <section class="wrap hero">
      <div>
        <h1 id="heroTitle">One local proxy for every Grok client</h1>
        <p class="lead" id="heroLead">Pool SuperGrok OAuth accounts, route by credits, issue keys, and log usage. OpenAI-compatible endpoints for Claude Code, Cursor, and your own tools.</p>
        <div class="hero-cta">
          <a class="btn btn-lg" id="ctaPrimary" href="/login">Get started</a>
          <a class="btn btn-ghost btn-lg" id="ctaSecondary" href="#examples">View examples</a>
        </div>
        <div class="hero-note" id="heroNote">POST /v1/chat/completions · POST /v1/responses · GET /v1/models</div>
      </div>
      <div class="terminal" aria-hidden="true">
        <div class="term-bar">
          <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
          <span class="term-path">localhost:8787</span>
        </div>
        <div class="term-body">
          <div><span class="dim">$</span> <span class="w">curl</span> <span class="c">$HOST/v1/chat/completions</span> <span class="dim">\\</span></div>
          <div>  <span class="dim">-H</span> <span class="g">"Authorization: Bearer $API_KEY"</span> <span class="dim">\\</span></div>
          <div>  <span class="dim">-d</span> <span class="c">'{"model":"grok-4.5",...}'</span></div>
          <div style="margin-top:14px"><span class="dim">#</span> <span class="c">route</span> <span class="w">account-2</span> <span class="dim">·</span> <span class="c">credits</span> <span class="g">100%</span></div>
          <div><span class="dim">#</span> <span class="c">usage</span> <span class="w">in 412</span> <span class="dim">/</span> <span class="w">out 86</span> <span class="dim">/</span> <span class="w">cache 0</span></div>
        </div>
      </div>
    </section>

    <section class="wrap section">
      <h2 id="featTitle">Built for real client traffic</h2>
      <p class="sub" id="featSub">Pool accounts once. Let every tool share a stable OpenAI-shaped surface with isolation and observability.</p>
      <div class="bento">
        <article class="tile wide">
          <div>
            <div class="num" id="t1n">01</div>
            <h3 id="t1t">Credit-aware account pool</h3>
            <p id="t1d">Add SuperGrok accounts with device login. Auto or manual routing. Exhausted accounts rotate out without client changes.</p>
          </div>
          <div class="foot" id="t1f">OAuth · auto / manual · failover</div>
        </article>
        <article class="tile">
          <div>
            <div class="num" id="t2n">02</div>
            <h3 id="t2t">Keys and roles</h3>
            <p id="t2d">Users issue their own keys. Admins own the pool, proxy, and registration policy.</p>
          </div>
        </article>
        <article class="tile">
          <div>
            <div class="num" id="t3n">03</div>
            <h3 id="t3t">Logs and tokens</h3>
            <p id="t3d">Full request capture with client detection. Input, cache, output, and reasoning breakdowns.</p>
          </div>
        </article>
        <article class="tile">
          <div>
            <div class="num" id="t4n">04</div>
            <h3 id="t4t">Drop-in clients</h3>
            <p id="t4d">Point Claude Code, Cursor, or any OpenAI SDK at this host. Same shapes, local control.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="wrap section" id="examples" style="padding-top:24px">
      <div class="ex-head">
        <div>
          <h2 id="exTitle">Call it like OpenAI</h2>
        </div>
        <div class="ex-tools">
          <div class="seg" id="curlSeg">
            <button type="button" data-ep="chat" class="on">chat</button>
            <button type="button" data-ep="responses">responses</button>
            <button type="button" data-ep="models">models</button>
          </div>
          <button class="btn btn-ghost" type="button" id="btnCopyCurl">Copy</button>
        </div>
      </div>
      <div class="ex-card">
        <div class="ex-card-top"><span id="curlTitle">POST /v1/chat/completions</span></div>
        <pre id="curlBody"></pre>
      </div>
      <p class="ex-hint" id="exHint">Replace $API_KEY with a gk_ key from the console.</p>
    </section>
  </main>

  <footer class="wrap foot">
    <span id="footLeft">Grok API · local SuperGrok pool</span>
    <span>
      <a href="/health">/health</a>
      ·
      <a href="/overview" id="footApp">Console</a>
    </span>
  </footer>

  <script>
    const I18N = {
      zh: {
        login:"登录", enter:"进入控制台", start:"开始使用", examples:"查看示例",
        title:"本地代理，接住所有 Grok 客户端",
        lead:"汇聚 SuperGrok OAuth 账号，按额度路由，签发密钥，记录用量。OpenAI 兼容接口，适配 Claude Code、Cursor 与自建工具。",
        note:"POST /v1/chat/completions · POST /v1/responses · GET /v1/models",
        featTitle:"为真实客户端流量准备",
        featSub:"账号池配一次。所有工具共用稳定的 OpenAI 形态接口，带隔离与可观测性。",
        t1n:"01", t1t:"额度感知账号池", t1d:"用设备码添加 SuperGrok 账号。自动或手动路由。额度耗尽自动换号，客户端无需改配置。", t1f:"OAuth · 自动/手动 · 故障切换",
        t2n:"02", t2t:"密钥与角色", t2d:"用户自助签发密钥。管理员掌管账号池、代理与注册策略。",
        t3n:"03", t3t:"日志与 Token", t3d:"完整请求记录与客户端识别。输入、缓存、输出、推理分类统计。",
        t4n:"04", t4t:"即插即用", t4d:"把 Claude Code、Cursor 或任意 OpenAI SDK 指到本机。形状不变，控制权在本地。",
        setup:"需初始化", openApp:"控制台",
        exTitle:"像调用 OpenAI 一样",
        copy:"复制", copied:"已复制",
        exHint:"将 $API_KEY 换成控制台签发的 gk_ 密钥。",
        foot:"Grok API · 本地 SuperGrok 账号池",
      },
      en: {
        login:"Sign in", enter:"Open console", start:"Get started", examples:"View examples",
        title:"One local proxy for every Grok client",
        lead:"Pool SuperGrok OAuth accounts, route by credits, issue keys, and log usage. OpenAI-compatible endpoints for Claude Code, Cursor, and your own tools.",
        note:"POST /v1/chat/completions · POST /v1/responses · GET /v1/models",
        featTitle:"Built for real client traffic",
        featSub:"Pool accounts once. Share a stable OpenAI-shaped surface with isolation and observability.",
        t1n:"01", t1t:"Credit-aware account pool", t1d:"Add SuperGrok accounts with device login. Auto or manual routing. Exhausted accounts rotate out without client changes.", t1f:"OAuth · auto / manual · failover",
        t2n:"02", t2t:"Keys and roles", t2d:"Users issue their own keys. Admins own the pool, proxy, and registration policy.",
        t3n:"03", t3t:"Logs and tokens", t3d:"Full request capture with client detection. Input, cache, output, and reasoning breakdowns.",
        t4n:"04", t4t:"Drop-in clients", t4d:"Point Claude Code, Cursor, or any OpenAI SDK at this host. Same shapes, local control.",
        setup:"Setup needed", openApp:"Console",
        exTitle:"Call it like OpenAI",
        copy:"Copy", copied:"Copied",
        exHint:"Replace $API_KEY with a gk_ key from the console.",
        foot:"Grok API · local SuperGrok pool",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let curlEp = "chat";
    const t = (k) => I18N[lang][k] ?? k;
    const $ = (id) => document.getElementById(id);

    function paintCurl() {
      const b = location.origin;
      function curlCmd(path, jsonBody) {
        const lines = ["curl " + b + path + " \\\\"];
        if (jsonBody == null) {
          lines.push('  -H "Authorization: Bearer $API_KEY"');
        } else {
          lines.push('  -H "Authorization: Bearer $API_KEY" \\\\');
          lines.push('  -H "Content-Type: application/json" \\\\');
          lines.push("  -d " + JSON.stringify(jsonBody));
        }
        return lines.join("\\n");
      }
      const map = {
        chat: {
          title: "POST /v1/chat/completions",
          body: curlCmd("/v1/chat/completions", '{"model":"grok-4.5","messages":[{"role":"user","content":"hello"}]}')
        },
        responses: {
          title: "POST /v1/responses",
          body: curlCmd("/v1/responses", '{"model":"grok-4.5","input":"hello"}')
        },
        models: {
          title: "GET /v1/models",
          body: curlCmd("/v1/models", null)
        }
      };
      const cur = map[curlEp] || map.chat;
      $("curlTitle").textContent = cur.title;
      $("curlBody").textContent = cur.body;
      $("curlSeg").querySelectorAll("button").forEach((btn) => btn.classList.toggle("on", btn.dataset.ep === curlEp));
    }

    function apply() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      $("btnLogin").textContent = t("login");
      $("btnPrimary").textContent = t("enter");
      $("ctaPrimary").textContent = t("start");
      $("ctaSecondary").textContent = t("examples");
      $("heroTitle").textContent = t("title");
      $("heroLead").textContent = t("lead");
      $("heroNote").textContent = t("note");
      $("featTitle").textContent = t("featTitle");
      $("featSub").textContent = t("featSub");
      ["t1n","t1t","t1d","t1f","t2n","t2t","t2d","t3n","t3t","t3d","t4n","t4t","t4d"].forEach((k) => {
        if ($(k)) $(k).textContent = t(k);
      });
      $("exTitle").textContent = t("exTitle");
      $("exHint").textContent = t("exHint");
      $("btnCopyCurl").textContent = t("copy");
      $("footLeft").textContent = t("foot");
      $("footApp").textContent = t("openApp");
      paintCurl();
    }

    window.addEventListener("scroll", () => {
      $("nav").classList.toggle("scrolled", window.scrollY > 4);
    }, { passive: true });

    $("langSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      lang = b.dataset.lang;
      localStorage.setItem("grok_api_lang", lang);
      apply();
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
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      $("btnCopyCurl").textContent = t("copied");
      setTimeout(() => { $("btnCopyCurl").textContent = t("copy"); }, 1200);
    };

    (async function boot() {
      apply();
      let needsSetup = false;
      let loggedIn = false;
      try {
        const meta = await (await fetch("/api/meta")).json();
        needsSetup = !!meta.needsSetup;
      } catch {}
      const token = localStorage.getItem("grok_api_session") || "";
      if (token) {
        try {
          const me = await fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } });
          loggedIn = me.ok;
        } catch {}
      }
      if (needsSetup) {
        ["btnLogin","btnPrimary","ctaPrimary"].forEach((id) => {
          $(id).href = "/setup";
          $(id).textContent = t("setup");
        });
      } else if (loggedIn) {
        $("btnLogin").href = "/overview";
        $("btnPrimary").href = "/overview";
        $("ctaPrimary").href = "/overview";
        $("btnLogin").textContent = t("openApp");
        $("btnPrimary").textContent = t("enter");
        $("ctaPrimary").textContent = t("enter");
      } else {
        $("btnLogin").href = "/login";
        $("btnPrimary").href = "/login";
        $("ctaPrimary").href = "/login";
      }
      $("ctaSecondary").href = "#examples";
    })();
  </script>
</body>
</html>`;
}
