import { styles } from "./styles.js";

export type AppPage =
  | "overview"
  | "accounts"
  | "keys"
  | "users"
  | "usage"
  | "logs"
  | "settings"
  | "contribute"
  | "leaderboard";

export function appPageHtml(page: AppPage | string): string {
  if (!['overview','accounts','keys','users','usage','logs','settings','contribute','leaderboard'].includes(page)) page = 'overview';
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Grok API</title>
  <link rel="icon" href="/static/logo.svg" type="image/svg+xml" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <style>
${styles()}
  </style>
</head>
<body>
  <div class="app" id="appRoot">
    <aside class="side" id="side">
      <a class="brand" href="/" title="Home">
        <div class="brand-mark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="3.4" cy="3.4" r="1.35" fill="white"/><circle cx="3.4" cy="8" r="1.35" fill="white"/><circle cx="3.4" cy="12.6" r="1.35" fill="white"/><path d="M5.4 3.4C7.5 3.4 8.9 6.2 9.9 8" stroke="white" stroke-width="1.45" stroke-linecap="round"/><path d="M5.4 8H9.9" stroke="white" stroke-width="1.45" stroke-linecap="round"/><path d="M5.4 12.6C7.5 12.6 8.9 9.8 9.9 8" stroke="white" stroke-width="1.45" stroke-linecap="round"/><path d="M9.3 5.5L12.6 8L9.3 10.5" stroke="white" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <span>Grok API</span>
      </a>
      <nav>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navOps">Operate</div>
          <a class="nav-item ${page==='overview'?'on':''}" href="/overview" data-view="overview"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg></span><span data-i18n="navOverview">Overview</span></a>
          <a class="nav-item ${page==='accounts'?'on':''}" href="/accounts" data-view="accounts" data-admin-only><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><span data-i18n="navAccounts">Accounts</span></a>
          <a class="nav-item ${page==='keys'?'on':''}" href="/keys" data-view="keys"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg></span><span data-i18n="navKeys">API Keys</span></a>
          <a class="nav-item ${page==='users'?'on':''}" href="/users" data-view="users" data-admin-only><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><span data-i18n="navUsers">Users</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navCommunity">Community</div>
          <a class="nav-item ${page==='contribute'?'on':''}" href="/contribute" data-view="contribute"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span><span data-i18n="navContribute">Contribute</span></a>
          <a class="nav-item ${page==='leaderboard'?'on':''}" href="/leaderboard" data-view="leaderboard"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M5 8H3a2 2 0 0 0 2 2h0"/><path d="M19 8h2a2 2 0 0 1-2 2h0"/></svg></span><span data-i18n="navLeaderboard">Leaderboard</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navAnalyze">Analyze</div>
          <a class="nav-item ${page==='usage'?'on':''}" href="/usage" data-view="usage"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-9"/></svg></span><span data-i18n="navUsage">Usage</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navOps2">Ops</div>
          <a class="nav-item ${page==='logs'?'on':''}" href="/logs" data-view="logs"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg></span><span data-i18n="navLogs">Logs</span></a>
          <a class="nav-item ${page==='settings'?'on':''}" href="/settings" data-view="settings" data-admin-only><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span><span data-i18n="navSettings">Settings</span></a>
        </div>
      </nav>
    </aside>

    <div class="side-scrim" id="sideScrim" aria-hidden="true"></div>

    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="btn btn-secondary btn-sm side-toggle" type="button" id="btnSide" aria-label="Menu">☰</button>
          <div class="topbar-titles">
            <span class="page-title" id="pageTitle">Overview</span>
            <span class="page-sub" id="pageSub"></span>
          </div>
        </div>
        <div class="top-actions">
          <div class="seg" id="langSeg">
            <button type="button" data-lang="zh">中文</button>
            <button type="button" data-lang="en">EN</button>
          </div>
          <div class="user-chip" id="userChip" style="display:none"><strong id="userName">–</strong><span id="userRole" class="mono"></span></div>
          <button class="btn btn-secondary btn-sm" id="btnRefresh" type="button" data-i18n="refresh">Refresh</button>
          <button class="btn btn-ghost btn-sm" id="btnLogout" type="button" data-i18n="logout">Logout</button>
        </div>
      </header>

      <main class="content">
        <!-- OVERVIEW -->
        <section class="view ${page==='overview'?'on':''}" id="view-overview">
          <div class="hero">
            <h1 data-i18n="title">Account Pool</h1>
            <p data-i18n="subtitle">SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.</p>
          </div>
          <div class="stats">
            <div class="stat clickable" data-goto="accounts" data-admin-only><div class="n" id="sTotal">–</div><div class="l" data-i18n="statAccounts">Accounts</div></div>
            <div class="stat clickable" data-goto="accounts" data-admin-only><div class="n" id="sActive">–</div><div class="l" data-i18n="statActive">Active</div></div>
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
                <div class="quick-actions" id="quickActions">
                  <button type="button" class="qa" data-goto="contribute"><strong data-i18n="navContribute">Contribute</strong><span data-i18n="qaContrib">Share SuperGrok capacity</span></button>
                  <button type="button" class="qa" data-goto="leaderboard"><strong data-i18n="navLeaderboard">Leaderboard</strong><span data-i18n="qaLb">See top contributors</span></button>
                  <button type="button" class="qa" data-goto="keys"><strong data-i18n="navKeys">API Keys</strong><span data-i18n="qaKey">Issue client keys</span></button>
                  <button type="button" class="qa" data-goto="usage"><strong data-i18n="navUsage">Usage</strong><span data-i18n="qaUsage">Charts & distribution</span></button>
                  <button type="button" class="qa" data-goto="logs"><strong data-i18n="navLogs">Logs</strong><span data-i18n="qaLogs">Debug full requests</span></button>
                  <button type="button" class="qa" data-goto="accounts" data-admin-only><strong data-i18n="navAccounts">Accounts</strong><span data-i18n="qaAcc">Add / switch / credits</span></button>
                  <button type="button" class="qa" data-goto="settings" data-admin-only><strong data-i18n="navSettings">Settings</strong><span data-i18n="qaSettings">Proxy & logs</span></button>
                  <a class="qa" href="/#examples"><strong data-i18n="qaCurlTitle">cURL</strong><span data-i18n="qaCurl">On homepage</span></a>
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
        <section class="view ${page==='accounts'?'on':''}" id="view-accounts">
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
            <div class="dt dt-accounts">
              <div class="dt-head">
                <div data-i18n="colAccount">Account</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colCredits">Credits</div>
                <div data-i18n="colUses">Uses</div>
                <div data-i18n="colLastUsed">Last used</div>
                <div data-i18n="colActions">Actions</div>
              </div>
              <div class="dt-body" id="tbody"><div class="dt-empty">…</div></div>
            </div>
            <div class="pager" id="accPager"></div>
          </div>
        </section>

        <!-- USERS (admin) -->
        <section class="view ${page==='users'?'on':''}" id="view-users">
          <div class="panel">
            <div class="panel-hd">
              <strong data-i18n="navUsers">Users</strong>
              <span class="mono" data-i18n="usersHint">Manage registered users</span>
              <div class="spacer"></div>
            </div>
            <div id="msgUsers" class="msg"></div>
            <div class="dt dt-users">
              <div class="dt-head">
                <div data-i18n="colUser">User</div>
                <div data-i18n="colRole">Role</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colQuota">Quota</div>
                <div data-i18n="colLastUsed">Last login</div>
                <div data-i18n="colActions">Actions</div>
              </div>
              <div class="dt-body" id="tbodyUsers"><div class="dt-empty">…</div></div>
            </div>
          </div>
        </section>

        <!-- KEYS -->
        <section class="view ${page==='keys'?'on':''}" id="view-keys">
          <div class="panel">
            <div class="panel-hd">
              <strong data-i18n="keysTitle">Client keys</strong>
              <span class="mono" data-i18n="keysHint">Bearer gk_…</span>
              <div class="spacer"></div>
              <button class="btn" id="btnCreateKey" type="button" data-i18n="createKey">Create key</button>
            </div>
            <div id="msgKeys" class="msg"></div>
            <div class="dt dt-keys">
              <div class="dt-head">
                <div data-i18n="colAlias">Alias</div>
                <div data-i18n="colKey">Key</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colExpires">Expires</div>
                <div data-i18n="colUses">Uses</div>
                <div data-i18n="colActions">Actions</div>
              </div>
              <div class="dt-body" id="tbodyKeys"><div class="dt-empty">…</div></div>
            </div>
            <div class="pager" id="keyPager"></div>
          </div>
        </section>

        <!-- USAGE -->
        <section class="view ${page==='usage'?'on':''}" id="view-usage">
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
                <div class="chart-card" data-admin-only><h4 data-i18n="chartAccount">By account</h4><div class="chart-wrap"><canvas id="chartAccount"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartKey">By API key (tokens)</h4><div class="chart-wrap"><canvas id="chartKey"></canvas></div></div>
                <div class="chart-card"><h4 data-i18n="chartKeyInOut">By key · in / out</h4><div class="chart-wrap"><canvas id="chartKeyInOut"></canvas></div></div>
              </div>
            </div>
          </div>
        </section>

        <!-- LOGS -->
        <section class="view ${page==='logs'?'on':''}" id="view-logs">
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
              <button class="btn btn-secondary btn-sm" type="button" id="btnLogStrip" data-admin-only data-i18n="stripLogs">Strip bodies</button>
              <button class="btn btn-danger btn-sm" type="button" id="btnLogClear" data-admin-only data-i18n="clearLogs">Clear logs</button>
            </div>
            <div id="msgLogs" class="msg"></div>
            <div class="dt dt-logs">
              <div class="dt-head">
                <div data-i18n="colTime">Time</div>
                <div data-i18n="colClient">Client</div>
                <div data-i18n="colModel">Model</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colTokens">Tokens</div>
                <div data-i18n="colLatency">Latency</div>
                <div data-i18n="colAccount" data-admin-only>Account</div>
                <div data-i18n="colKey">Key</div>
              </div>
              <div class="dt-body" id="tbodyLogs"><div class="dt-empty">…</div></div>
            </div>
            <div class="pager" id="logPager"></div>
          </div>
        </section>

        <!-- CONTRIBUTE -->
        <section class="view ${page==='contribute'?'on':''}" id="view-contribute">
          <div class="contrib-hero">
            <div class="contrib-kicker" data-i18n="contribKicker">Community capacity</div>
            <h1 data-i18n="contribTitle">Share your SuperGrok seat</h1>
            <p data-i18n="contribSub">Link an xAI account you own. Its remaining credits join the shared pool — everyone gets more reliable access, and you climb the contributor board.</p>
            <div class="contrib-cta-row">
              <button class="btn" type="button" id="btnContribStart" data-i18n="contribCta">Contribute an account</button>
              <button class="btn btn-secondary" type="button" data-goto="leaderboard" data-i18n="contribSeeLb">View leaderboard</button>
              <span class="mono" id="contribMineCount" style="color:var(--mute)">–</span>
            </div>
          </div>

          <div class="why-grid">
            <div class="why-card">
              <div class="why-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3 data-i18n="why1t">Private to you</h3>
              <p data-i18n="why1d">Only you can see the accounts you linked — status, credits, and usage. Others never see your list.</p>
            </div>
            <div class="why-card">
              <div class="why-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
              <h3 data-i18n="why2t">Power the pool</h3>
              <p data-i18n="why2d">Idle SuperGrok credits become shared capacity. Credit-aware routing picks healthy seats automatically.</p>
            </div>
            <div class="why-card">
              <div class="why-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/></svg></div>
              <h3 data-i18n="why3t">Climb the board</h3>
              <p data-i18n="why3d">Every successful link counts toward your rank. Admins are excluded — pure community scoreboard.</p>
            </div>
          </div>

          <div class="panel mb">
            <div class="panel-hd">
              <strong data-i18n="contribHow">How it works</strong>
              <div class="spacer"></div>
              <input id="contribName" class="input" data-i18n-placeholder="accNamePh" style="max-width:200px" />
              <button class="btn" type="button" id="btnContribAdd" data-i18n="contribCta">Contribute an account</button>
            </div>
            <div class="panel-bd" style="padding:0">
              <div class="steps">
                <div class="step"><div class="n">01</div><strong data-i18n="step1t">Start OAuth</strong><span data-i18n="step1d">We open an xAI device-code flow. No password is stored by us.</span></div>
                <div class="step"><div class="n">02</div><strong data-i18n="step2t">Approve in browser</strong><span data-i18n="step2d">Enter the code on accounts.x.ai and authorize SuperGrok access.</span></div>
                <div class="step"><div class="n">03</div><strong data-i18n="step3t">Join the pool</strong><span data-i18n="step3d">Credits are checked and the seat becomes available for routing.</span></div>
              </div>
              <div id="contribStage" class="oauth-stage">
                <div class="label" style="color:var(--mute);font-size:12px;margin-bottom:10px" data-i18n="deviceHint">Enter this Device Code:</div>
                <div class="oauth-code" id="contribUserCode">––––</div>
                <div class="oauth-meta">
                  <div class="hint"><span class="pulse-dot" id="contribPulse"></span><span id="contribPollStatus" data-i18n="waiting">Waiting…</span></div>
                  <div class="hint"><span data-i18n="verifyUrl">URL</span>：<a id="contribVerifyLink" href="#" target="_blank" rel="noreferrer">–</a></div>
                  <button class="btn btn-secondary btn-sm" type="button" id="btnContribCopy" data-i18n="copy">Copy</button>
                </div>
              </div>
            </div>
          </div>

          <div class="mine-stats">
            <div class="stat"><div class="n" id="cTotal">–</div><div class="l" data-i18n="statMine">My seats</div></div>
            <div class="stat"><div class="n" id="cActive">–</div><div class="l" data-i18n="statActive">Active</div></div>
            <div class="stat"><div class="n" id="cExhausted">–</div><div class="l" data-i18n="statExhausted">Exhausted</div></div>
            <div class="stat"><div class="n" id="cRank">–</div><div class="l" data-i18n="statMyRank">My rank</div></div>
          </div>

          <div class="panel mb">
            <div class="panel-hd">
              <strong data-i18n="routeTitle">API routing</strong>
              <span class="mono" data-i18n="routeHint">Applies to your API keys</span>
              <div class="spacer"></div>
              <button class="btn btn-sm" type="button" id="btnSaveRoute" data-i18n="saveRoute">Save</button>
            </div>
            <div class="panel-bd">
              <div class="settings-row">
                <div class="seg" id="routeScopeSeg">
                  <button type="button" data-rscope="public" class="on" data-i18n="routePublic">Public pool</button>
                  <button type="button" data-rscope="mine" data-i18n="routeMine">My seats only</button>
                  <button type="button" data-rscope="account" data-i18n="routeAccount">Pin account</button>
                </div>
                <select id="routeAccountSel" class="select" style="min-width:180px;display:none"></select>
              </div>
              <div class="hint" id="routeScopeHint" data-i18n="routePublicHint">Use admin + public contributed seats (others' private seats excluded).</div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-hd">
              <strong data-i18n="mineTitle">My contributions</strong>
              <span class="mono" data-i18n="mineHint">Visible only to you</span>
              <div class="spacer"></div>
              <button class="btn btn-secondary btn-sm" type="button" id="btnContribRefresh" data-i18n="refresh">Refresh</button>
            </div>
            <div class="dt dt-contrib">
              <div class="dt-head">
                <div data-i18n="colAccount">Account</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colCredits">Credits</div>
                <div data-i18n="colUses">Uses</div>
                <div data-i18n="colVisibility">Visibility</div>
                <div data-i18n="colLastUsed">Last used</div>
                <div data-i18n="colActions">Actions</div>
              </div>
              <div class="dt-body" id="tbodyContrib"><div class="dt-empty">…</div></div>
            </div>
            <div class="pager" id="contribPager"></div>
          </div>
        </section>

        <!-- LEADERBOARD -->
        <section class="view ${page==='leaderboard'?'on':''}" id="view-leaderboard">
          <div class="contrib-hero" style="background:radial-gradient(120% 140% at 100% 0%,#f3e8ff 0%,#fff 48%,#eef6ff 100%)">
            <div class="contrib-kicker" data-i18n="lbKicker">Public ranking</div>
            <h1 data-i18n="lbTitle">Contributor leaderboard</h1>
            <p data-i18n="lbSub">Ranked by number of SuperGrok seats contributed. Admin accounts are excluded so the board stays community-first.</p>
            <div class="contrib-cta-row">
              <button class="btn" type="button" data-goto="contribute" data-i18n="lbCta">Contribute now</button>
              <span class="mono" id="lbSummary" style="color:var(--mute)">–</span>
            </div>
          </div>

          <div class="rank-me" id="lbMeCard">
            <div>
              <div class="mono" style="font-size:12px;color:var(--mute);margin-bottom:4px" data-i18n="lbYourRank">Your rank</div>
              <div class="big" id="lbMeRank">–</div>
              <div class="meta" id="lbMeMeta">–</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <span class="pill" id="lbMeCount">0</span>
              <button class="btn btn-secondary btn-sm" type="button" data-goto="contribute" data-i18n="lbBoost">Boost rank</button>
            </div>
          </div>

          <div class="podium" id="lbPodium"></div>

          <div class="panel">
            <div class="panel-hd">
              <strong data-i18n="lbTable">Full ranking</strong>
              <div class="spacer"></div>
              <button class="btn btn-secondary btn-sm" type="button" id="btnLbRefresh" data-i18n="refresh">Refresh</button>
            </div>
            <div class="dt dt-lb">
              <div class="dt-head">
                <div data-i18n="colRank">Rank</div>
                <div data-i18n="colUser">User</div>
                <div data-i18n="colSeats">Seats</div>
                <div data-i18n="colActive">Active</div>
              </div>
              <div class="dt-body" id="tbodyLb"><div class="dt-empty">…</div></div>
            </div>
          </div>
        </section>

        <!-- SETTINGS -->
        <section class="view ${page==='settings'?'on':''}" id="view-settings">
          <div class="panel">
            <div class="panel-bd" style="display:grid;gap:18px">
              <div class="callout" id="adminExplain"></div>
              <div>
                <div style="font-weight:500;margin-bottom:8px" data-i18n="upstreamTitle">xAI upstream</div>
                <div class="settings-row">
                  <input id="upstreamUrl" class="input grow" placeholder="https://api.x.ai/v1" style="min-width:220px;flex:1" />
                  <button class="btn" type="button" id="btnSaveUpstream" data-i18n="saveUpstream">Save</button>
                </div>
                <div class="hint" id="upstreamHint" data-i18n="upstreamHint">Empty = default api.x.ai/v1. Can point to a Vercel/OpenAI-compatible reverse proxy (auto-appends /v1).</div>
              </div>
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
                    <input type="checkbox" id="logBodies" /> <span data-i18n="logBodies">Store request/response bodies</span>
                  </label>
                  <label class="mono" style="display:flex;align-items:center;gap:6px">
                    <span data-i18n="logRetention">Retention (days)</span>
                    <input id="logRetention" class="input" type="number" min="1" max="365" style="min-width:80px;width:80px" />
                  </label>
                  <button class="btn" type="button" id="btnSaveLog" data-i18n="saveLog">Save</button>
                </div>
                <div class="hint" data-i18n="logHint">Default: metadata + tokens only. Bodies are large — enable only when debugging.</div>
              </div>
              <div>
                <div style="font-weight:500;margin-bottom:8px" data-i18n="userSettings">Users</div>
                <div class="settings-row">
                  <label class="mono" style="display:flex;align-items:center;gap:6px">
                    <input type="checkbox" id="allowRegister" /> <span data-i18n="allowRegister">Allow registration</span>
                  </label>
                  <button class="btn" type="button" id="btnSaveReg" data-i18n="saveLog">Save</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <div id="msgContrib" class="toast" role="status" aria-live="polite"></div>

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

  <div class="modal-mask" id="quotaModal">
    <div class="modal" role="dialog">
      <h3 data-i18n="editQuota">Edit token quota</h3>
      <p id="quotaUserHint" class="mono" style="margin-bottom:12px"></p>
      <div class="field">
        <label data-i18n="quotaLabel">Token quota (empty = unlimited)</label>
        <input id="quotaInput" class="input" style="width:100%" type="number" min="0" step="1" placeholder="∞" />
      </div>
      <div class="field">
        <label data-i18n="quotaUsedLabel">Tokens used</label>
        <div class="mono" id="quotaUsedDisp">0</div>
      </div>
      <label class="check" style="display:flex;align-items:center;gap:8px;margin:8px 0 0;font-size:13px">
        <input type="checkbox" id="quotaResetUsed" /> <span data-i18n="quotaResetUsed">Reset used to 0</span>
      </label>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="quotaCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="quotaSubmit" data-i18n="saveQuota">Save</button>
      </div>
    </div>
  </div>


  <script>
    const PAGE = ${JSON.stringify(page)};
    const PAGE_HREF = { overview:"/overview", accounts:"/accounts", keys:"/keys", users:"/users", usage:"/usage", logs:"/logs", settings:"/settings", contribute:"/contribute", leaderboard:"/leaderboard" };
    const PAGE_SIZE = 8;
    const LOG_PAGE = 15;
    const PALETTE = ["#0070f3","#7928ca","#0a7a3e","#ab570a","#ee0000","#00a0a0","#333","#888"];
    const VIEW_META = {
      overview: { titleKey: "navOverview", subKey: "subOverview" },
      accounts: { titleKey: "navAccounts", subKey: "subAccounts", admin: true },
      keys: { titleKey: "navKeys", subKey: "subKeys" },
      users: { titleKey: "navUsers", subKey: "subUsers", admin: true },
      usage: { titleKey: "navUsage", subKey: "subUsage" },
      logs: { titleKey: "navLogs", subKey: "subLogs" },
      settings: { titleKey: "navSettings", subKey: "subSettings", admin: true },
      contribute: { titleKey: "navContribute", subKey: "subContribute" },
      leaderboard: { titleKey: "navLeaderboard", subKey: "subLeaderboard" },
    };
    const I18N = {
      zh: {
        title:"账号池", subtitle:"SuperGrok OAuth 多账号 · 额度感知轮询 · OpenAI 兼容代理。",
        refresh:"刷新", logout:"退出",
        authUser:"用户名", authPass:"密码", authPass2:"确认密码", authSubmit:"继续",
        authSetupTitle:"初始化管理员", authSetupSub:"首次使用，请创建管理员账号。账号池与代理仅管理员可配置。",
        authLoginTitle:"登录", authLoginSub:"使用你的账号登录管理控制台。",
        authRegTitle:"注册", authRegSub:"创建普通用户账号，可管理自己的密钥、日志与用量。",
        authToReg:"没有账号？注册", authToLogin:"已有账号？登录",
        authPassMismatch:"两次密码不一致",
        navOps:"运营", navAnalyze:"分析", navOps2:"运维",
        navOverview:"总览", navAccounts:"账号", navKeys:"密钥", navUsers:"用户", navUsage:"用量", navLogs:"日志", navSettings:"设置",
        subOverview:"状态一览与快捷入口", subAccounts:"OAuth 池 · 路由与额度", subKeys:"客户端鉴权密钥",
        subUsers:"注册用户与角色", subUsage:"Token / 次数 / 模型分布", subLogs:"完整请求排查（低频）", subSettings:"代理与日志策略",
        usersHint:"管理注册用户", colUser:"用户", colRole:"角色", colQuota:"额度",
        allowRegister:"允许注册", userSettings:"用户注册",
        roleAdmin:"管理员", roleUser:"用户",
        editQuota:"编辑 Token 额度", quotaLabel:"Token 额度（空=不限）", quotaUsedLabel:"已用 Token",
        quotaResetUsed:"将已用清零", saveQuota:"保存额度", quotaUnlimited:"不限",
        quotaFmt:(u,q)=>u+" / "+q, setQuota:"额度",
        viewMore:"查看详情 →", viewAllLogs:"全部日志 →",
        ovUsage:"近 7 日用量", ovQuick:"快捷操作", ovRecent:"最近请求",
        qaAcc:"添加 / 切换 / 查额度", qaKey:"签发客户端密钥", qaUsage:"图表与分布", qaLogs:"完整请求排查",
        qaCurlTitle:"cURL 示例", qaCurl:"见首页", qaSettings:"代理与日志策略",
        adminExplain:"可选环境变量 <code>ADMIN_TOKEN</code> 可作为紧急管理员通道（Bearer）。日常请使用用户名密码登录。",
        adminExplainOpen:"请使用<strong>用户名密码</strong>登录。首次打开会引导创建管理员；账号池与代理仅管理员可配置。",
        upstreamTitle:"xAI 上游地址", saveUpstream:"保存上游", upstreamSaved:"上游地址已更新",
        upstreamHint:"留空=默认 api.x.ai/v1。可填 Vercel/国内反代域名（自动补 /v1）。OAuth 仍走 auth.x.ai。",
        upstreamActive:(u)=>"当前生效："+u,
        proxyTitle:"出站代理", proxyAuto:"自动", proxyDirect:"直连", proxyCustom:"自定义",
        proxyHintAuto:(src,url)=>"当前生效："+(url||"直连")+"（来源："+src+"）",
        saveProxy:"保存", proxySaved:"代理已更新",
        logSettings:"请求日志", logEnabled:"启用日志", logBodies:"记录请求/响应体", logRetention:"保留天数", saveLog:"保存日志设置",
        logHint:"默认只记元数据与 Token；正文体积大，排查问题时再勾选",
        logSaved:"日志设置已保存",
        usageTitle:"分析", kpiReq:"请求数", kpiTok:"总 Token", kpiOk:"成功率", kpiLat:"平均延迟",
        kpiIn:"输入(未缓存)", kpiOut:"输出 Token", kpiCache:"缓存输入", kpiReason:"推理 Token", kpiImg:"图片 Token",
        chartDay:"每日 Token 构成", chartTokMix:"Token 构成", chartModel:"模型分布", chartAccount:"按账号", chartKey:"按密钥（总 Token）",
        chartKeyInOut:"按密钥 · 输入/输出",
        chartReq:"请求数", chartTok:"总 Token", chartIn:"输入(未缓存)", chartOut:"输出", chartCache:"缓存输入", chartReason:"推理",
        unrouted:"未路由(失败)", noKeyLabel:"无 Key", noModel:"无模型",
        clearLogs:"清理日志", clearLogsConfirm:"确定清理全部请求日志？", logsCleared:"日志已清理",
        stripLogs:"精简正文", stripLogsConfirm:"将从历史日志中删除请求/响应正文（保留元数据与 Token），是否继续？",
        logsStripped:(n,b)=>"已精简 "+n+" 条 · 释放约 "+b,
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
        noKeys:"暂无密钥。创建前 /v1 可匿名访问；创建后必须 Bearer。",
        current:"当前", notChecked:"未查询",
        usedLeft:(u,r)=>u.toFixed(1)+"% 已用 · "+r.toFixed(1)+"% 剩余",
        src:{settings:"手动配置",direct:"直连",env:"环境变量",system:"系统代理",none:"无"},
        switchOk:"已切换（仅检查该账号额度）", addOk:"账号添加成功", keyCreated:"密钥已创建",
        statAccounts:"账号", statActive:"可用", statReqs:"请求(7d)", statKeys:"密钥",
        pageOf:(c,t,n)=>"第 "+c+" / "+t+" 页 · 共 "+n+" 条", prev:"上一页", next:"下一页",
        diskInfo:(d,b)=>d+" 天 · "+b,
        navCommunity:"社区", navContribute:"贡献席位", navLeaderboard:"贡献榜",
        subContribute:"绑定 SuperGrok · 加入共享容量", subLeaderboard:"社区贡献席位排行",
        qaContrib:"分享 SuperGrok 容量", qaLb:"查看贡献排行",
        contribKicker:"社区容量", contribTitle:"分享你的 SuperGrok 席位",
        contribSub:"绑定你拥有的 xAI 账号。剩余额度会进入共享池——大家更稳，你也能登上贡献榜。",
        contribCta:"贡献一个账号", contribSeeLb:"查看贡献榜",
        why1t:"仅你可见", why1d:"你绑定的账号状态、额度与调用记录只对你开放，其他用户看不到列表。",
        why2t:"点亮账号池", why2d:"闲置的 SuperGrok 额度变成共享容量。额度感知路由会自动挑选健康席位。",
        why3t:"冲榜荣誉", why3d:"每次成功绑定都会计入排名。管理员不参与榜单，纯粹的社区排行。",
        contribHow:"如何贡献", step1t:"发起 OAuth", step1d:"走 xAI 设备码流程，我们不保存你的密码。",
        step2t:"浏览器授权", step2d:"在 accounts.x.ai 输入代码，授权 SuperGrok 访问。",
        step3t:"进入池子", step3d:"自动检查额度，席位即可参与路由。",
        mineTitle:"我的贡献", mineHint:"仅自己可见",
        statMine:"我的席位", statExhausted:"已耗尽", statMyRank:"我的排名",
        noContrib:"还没有贡献。点上方按钮绑定第一个账号。",
        contribOk:"贡献成功", contribRankUnranked:"未上榜",
        withdrawContrib:"撤回",
        withdrawContribConfirm:(n)=>"确定撤回贡献「"+n+"」？将从共享池移除该账号。",
        withdrawContribOk:"已撤回贡献",
        routeTitle:"API 路由", routeHint:"对你的 API 密钥生效", saveRoute:"保存路由",
        routePublic:"公共号池", routeMine:"仅自己号池", routeAccount:"指定账号",
        routePublicHint:"使用管理员账号 + 公开贡献席位（他人私有号除外）。",
        routeMineHint:"只使用你贡献的账号。没有可用席位时请求会失败。",
        routeAccountHint:"固定走下方选中的账号（须有权使用）。",
        routeSaved:"路由偏好已保存",
        colVisibility:"可见性", visPublic:"公共", visPrivate:"仅自己",
        setPrivate:"仅自己", setPublic:"公开",
        privateOk:"已设为仅自己可用", publicOk:"已设为公共池可用",
        lbKicker:"公开排行", lbTitle:"贡献者排行榜",
        lbSub:"按贡献的 SuperGrok 席位数量排序。管理员账号已排除，榜单只反映社区贡献。",
        lbCta:"立即贡献", lbYourRank:"你的排名", lbBoost:"提升排名",
        lbTable:"完整榜单", lbEmpty:"还没有贡献者。成为第一名？",
        lbSeats:(n)=>n+" 个席位", lbSummary:(c,d)=>c+" 位贡献者 · 共 "+d+" 个席位",
        lbUnranked:"尚未上榜 — 贡献一个账号即可入榜",
        colRank:"名次", colSeats:"席位", colActive:"可用",
        copyCode:"复制代码",
      },
      en: {
        title:"Account Pool", subtitle:"SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.",
        refresh:"Refresh", logout:"Logout",
        authUser:"Username", authPass:"Password", authPass2:"Confirm password", authSubmit:"Continue",
        authSetupTitle:"Create admin", authSetupSub:"First run: create the admin account. Account pool & proxy are admin-only.",
        authLoginTitle:"Sign in", authLoginSub:"Sign in to the control panel.",
        authRegTitle:"Register", authRegSub:"Create a user account to manage your own API keys, logs and usage.",
        authToReg:"No account? Register", authToLogin:"Have an account? Sign in",
        authPassMismatch:"Passwords do not match",
        navOps:"Operate", navAnalyze:"Analyze", navOps2:"Ops",
        navOverview:"Overview", navAccounts:"Accounts", navKeys:"API Keys", navUsers:"Users", navUsage:"Usage", navLogs:"Logs", navSettings:"Settings",
        subOverview:"Status & shortcuts", subAccounts:"OAuth pool · routing & credits", subKeys:"Client auth keys",
        subUsers:"Registered users & roles", subUsage:"Tokens / calls / models", subLogs:"Full request debug (rare)", subSettings:"Proxy & log policy",
        usersHint:"Manage registered users", colUser:"User", colRole:"Role", colQuota:"Quota",
        allowRegister:"Allow registration", userSettings:"Registration",
        roleAdmin:"Admin", roleUser:"User",
        editQuota:"Edit token quota", quotaLabel:"Token quota (empty = unlimited)", quotaUsedLabel:"Tokens used",
        quotaResetUsed:"Reset used to 0", saveQuota:"Save quota", quotaUnlimited:"Unlimited",
        quotaFmt:(u,q)=>u+" / "+q, setQuota:"Quota",
        viewMore:"Details →", viewAllLogs:"All logs →",
        ovUsage:"Usage (7d)", ovQuick:"Quick actions", ovRecent:"Recent requests",
        qaAcc:"Add / switch / credits", qaKey:"Issue client keys", qaUsage:"Charts & mix", qaLogs:"Full request debug",
        qaCurlTitle:"cURL", qaCurl:"On homepage", qaSettings:"Proxy & log policy",
        adminExplain:"Optional env <code>ADMIN_TOKEN</code> is an emergency admin Bearer. Prefer username/password login.",
        adminExplainOpen:"Sign in with username/password. First visit creates the admin. Account pool & proxy are admin-only.",
        upstreamTitle:"xAI upstream", saveUpstream:"Save upstream", upstreamSaved:"Upstream updated",
        upstreamHint:"Empty = api.x.ai/v1. Point to a Vercel/OpenAI-compatible reverse proxy (/v1 auto-appended). OAuth still uses auth.x.ai.",
        upstreamActive:(u)=>"Active: "+u,
        proxyTitle:"Outbound proxy", proxyAuto:"Auto", proxyDirect:"Direct", proxyCustom:"Custom",
        proxyHintAuto:(src,url)=>"Active: "+(url||"direct")+" (source: "+src+")",
        saveProxy:"Save", proxySaved:"Proxy updated",
        logSettings:"Request logs", logEnabled:"Enable logging", logBodies:"Store request/response bodies", logRetention:"Retention (days)", saveLog:"Save log settings",
        logHint:"Default: metadata + tokens only. Bodies are large — enable when debugging.",
        logSaved:"Log settings saved",
        usageTitle:"Analytics", kpiReq:"Requests", kpiTok:"Total tokens", kpiOk:"Success rate", kpiLat:"Avg latency",
        kpiIn:"Input (uncached)", kpiOut:"Output tokens", kpiCache:"Cached input", kpiReason:"Reasoning", kpiImg:"Image tokens",
        chartDay:"Daily token breakdown", chartTokMix:"Token mix", chartModel:"Model distribution", chartAccount:"By account", chartKey:"By API key (total)",
        chartKeyInOut:"By key · in / out",
        chartReq:"Requests", chartTok:"Total", chartIn:"Input (uncached)", chartOut:"Output", chartCache:"Cached input", chartReason:"Reasoning",
        unrouted:"Unrouted (failed)", noKeyLabel:"No key", noModel:"No model",
        clearLogs:"Clear logs", clearLogsConfirm:"Clear ALL request logs?", logsCleared:"Logs cleared",
        stripLogs:"Strip bodies", stripLogsConfirm:"Remove request/response bodies from historical logs (keep metadata + tokens). Continue?",
        logsStripped:(n,b)=>"Stripped "+n+" rows · saved ~"+b,
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
        navCommunity:"Community", navContribute:"Contribute", navLeaderboard:"Leaderboard",
        subContribute:"Link SuperGrok · grow shared capacity", subLeaderboard:"Community contribution ranking",
        qaContrib:"Share SuperGrok capacity", qaLb:"See top contributors",
        contribKicker:"Community capacity", contribTitle:"Share your SuperGrok seat",
        contribSub:"Link an xAI account you own. Remaining credits join the shared pool — everyone gets more reliable access, and you climb the board.",
        contribCta:"Contribute an account", contribSeeLb:"View leaderboard",
        why1t:"Private to you", why1d:"Only you can see the accounts you linked — status, credits, and usage. Others never see your list.",
        why2t:"Power the pool", why2d:"Idle SuperGrok credits become shared capacity. Credit-aware routing picks healthy seats automatically.",
        why3t:"Climb the board", why3d:"Every successful link counts toward your rank. Admins are excluded — pure community scoreboard.",
        contribHow:"How it works", step1t:"Start OAuth", step1d:"We open an xAI device-code flow. No password is stored by us.",
        step2t:"Approve in browser", step2d:"Enter the code on accounts.x.ai and authorize SuperGrok access.",
        step3t:"Join the pool", step3d:"Credits are checked and the seat becomes available for routing.",
        mineTitle:"My contributions", mineHint:"Visible only to you",
        statMine:"My seats", statExhausted:"Exhausted", statMyRank:"My rank",
        noContrib:"No contributions yet. Click above to link your first account.",
        contribOk:"Contribution added", contribRankUnranked:"Unranked",
        withdrawContrib:"Withdraw",
        withdrawContribConfirm:(n)=>"Withdraw contribution \""+n+"\"? It will be removed from the shared pool.",
        withdrawContribOk:"Contribution withdrawn",
        routeTitle:"API routing", routeHint:"Applies to your API keys", saveRoute:"Save routing",
        routePublic:"Public pool", routeMine:"My seats only", routeAccount:"Pin account",
        routePublicHint:"Admin seats + public contributions (others' private seats excluded).",
        routeMineHint:"Only accounts you contributed. Requests fail if none are available.",
        routeAccountHint:"Always use the selected account (must be allowed for you).",
        routeSaved:"Routing preference saved",
        colVisibility:"Visibility", visPublic:"Public", visPrivate:"Private",
        setPrivate:"Private", setPublic:"Public",
        privateOk:"Now private to you", publicOk:"Now available in public pool",
        lbKicker:"Public ranking", lbTitle:"Contributor leaderboard",
        lbSub:"Ranked by SuperGrok seats contributed. Admin accounts are excluded so the board stays community-first.",
        lbCta:"Contribute now", lbYourRank:"Your rank", lbBoost:"Boost rank",
        lbTable:"Full ranking", lbEmpty:"No contributors yet. Be the first?",
        lbSeats:(n)=>n+" seats", lbSummary:(c,d)=>c+" contributors · "+d+" seats",
        lbUnranked:"Not ranked yet — contribute one account to join",
        colRank:"Rank", colSeats:"Seats", colActive:"Active",
        copyCode:"Copy code",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let view = PAGE;
    let sessionToken = localStorage.getItem("grok_api_session") || "";
    let currentUser = null; // { id, username, role }
        let routing = { mode: "auto", currentAccountId: null };
    let meta = { needsSetup: false, allowRegister: true, proxy: null, proxySource: "none", proxyConfigured: "", logRetentionDays: 7, logEnabled: true, logBodies: false, allowRegisterSetting: true, xaiBaseUrl: "https://api.x.ai/v1", upstreamBaseUrlConfigured: "" };
    let pollTimer = null;
    let allUsers = [];
    let curlEp = "chat";
    let proxyMode = "auto";
    let allAccounts = [];
    let myAccounts = [];
    let allKeys = [];
    let accPage = 1;
    let contribPage = 1;
    let contribPollTimer = null;
    let leaderboardData = null;
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

    function isAdmin() { return currentUser && currentUser.role === "admin"; }
    function apiKeysPath() { return isAdmin() ? "/api/admin/keys" : "/api/me/keys"; }
    function apiLogsPath() { return isAdmin() ? "/api/admin/logs" : "/api/me/logs"; }
    function apiUsagePath() { return isAdmin() ? "/api/admin/usage" : "/api/me/usage"; }

    function pathFor(name) {
      return PAGE_HREF[name] || "/overview";
    }
    function nameForPath(pathname) {
      const entry = Object.entries(PAGE_HREF).find(([, href]) => href === pathname);
      return entry ? entry[0] : "overview";
    }
    function go(name, opts) {
      if (!VIEW_META[name]) name = "overview";
      if (VIEW_META[name].admin && !isAdmin()) name = "overview";
      const href = pathFor(name);
      const replace = opts && opts.replace;
      if (location.pathname !== href) {
        if (replace) history.replaceState({ view: name }, "", href);
        else history.pushState({ view: name }, "", href);
      }
      setView(name);
    }
    function setView(name) {
      if (!VIEW_META[name]) name = "overview";
      if (VIEW_META[name].admin && !isAdmin()) name = "overview";
      view = name;
      document.title = t(VIEW_META[name].titleKey) + " · Grok API";
      document.querySelectorAll(".nav-item").forEach((el) => {
        const href = el.getAttribute("href");
        el.classList.toggle("on", href === pathFor(name));
      });
      document.querySelectorAll(".view").forEach((el) => el.classList.toggle("on", el.id === "view-" + name));
      const m = VIEW_META[name];
      $("pageTitle").textContent = t(m.titleKey);
      $("pageSub").textContent = t(m.subKey);
      closeSide();
      if (name === "usage" || name === "overview") {
        if (lastStats) {
          if (name === "usage") paintCharts(lastStats);
          if (name === "overview") paintOverviewChart(lastStats);
        }
      }
      if (name === "users" && isAdmin()) loadUsers();
      if (name === "contribute") { loadMyAccounts(); loadMyRouting(); loadLeaderboardLite(); }
      if (name === "leaderboard") loadLeaderboard();
    }

    function applyRoleNav() {
      const admin = isAdmin();
      document.querySelectorAll("[data-admin-only]").forEach((el) => {
        el.classList.toggle("hide", !admin);
      });
      // stats: non-admin only sees 请求 + API Keys
      const stats = document.querySelector(".stats");
      if (stats) stats.style.gridTemplateColumns = admin ? "" : "repeat(2,minmax(0,1fr))";
      // quick actions: hide admin tiles, keep user-facing ones
      const qa = $("quickActions");
      if (qa) qa.classList.toggle("user-only", !admin);
      // logs grid without account column for non-admin
      document.querySelectorAll(".dt-logs").forEach((el) => el.classList.toggle("no-account", !admin));
      if (currentUser) {
        $("userChip").style.display = "inline-flex";
        $("userName").textContent = currentUser.username;
        $("userRole").textContent = currentUser.role === "admin" ? t("roleAdmin") : t("roleUser");
      } else {
        $("userChip").style.display = "none";
      }
    }

        async function logout() {
      try {
        await fetch("/api/auth/logout", { method: "POST", headers: headers() });
      } catch {}
      sessionToken = "";
      currentUser = null;
      localStorage.removeItem("grok_api_session");
      location.href = "/login";
    }

    async function ensureSession() {
      if (!sessionToken) return false;
      try {
        const res = await fetch("/api/auth/me", { headers: headers() });
        if (!res.ok) return false;
        const data = await res.json();
        currentUser = data.user;
        return true;
      } catch {
        return false;
      }
    }

    function applyI18n() {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-placeholder")); });
      $("langSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
      paintAdminExplain();
      paintProxyUI();
      paintCurl();
      paintMode();
      paintLogDaySelect();
      applyRoleNav();
      setView(view);
      renderAccounts();
      renderKeys();
      renderMyAccounts();
      if (leaderboardData) {
        paintPodium(leaderboardData.entries || []);
        paintLbTable(leaderboardData.entries || []);
        if (leaderboardData.me) {
          if ($("lbMeRank")) $("lbMeRank").textContent = "#" + leaderboardData.me.rank;
          if ($("lbMeMeta")) $("lbMeMeta").textContent = leaderboardData.me.username + " · " + t("lbSeats", leaderboardData.me.count);
          if ($("lbMeCount")) $("lbMeCount").textContent = t("lbSeats", leaderboardData.me.count);
        } else if ($("lbMeMeta")) {
          $("lbMeMeta").textContent = t("lbUnranked");
        }
        if ($("lbSummary")) $("lbSummary").textContent = t("lbSummary", leaderboardData.totalContributors || 0, leaderboardData.totalDonated || 0);
      }
    }

    function paintAdminExplain() {
      if (!$("adminExplain")) return;
      $("adminExplain").innerHTML = meta.legacyAdminToken
        ? t("adminExplain")
        : t("adminExplainOpen");
    }

    function detectProxyMode() {
      const cfg = (meta.proxyConfigured || "").trim();
      if (!cfg) return "auto";
      if (/^(direct|none|off|false)$/i.test(cfg)) return "direct";
      return "custom";
    }

    function paintProxyUI() {
      if (!$("proxyModeSeg")) return;
      proxyMode = detectProxyMode();
      $("proxyModeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.pmode === proxyMode));
      $("proxyCustomWrap").classList.toggle("show", proxyMode === "custom");
      if (proxyMode === "custom" && !$("proxyUrl").matches(":focus")) $("proxyUrl").value = meta.proxyConfigured || "";
      const srcMap = I18N[lang].src || {};
      const src = srcMap[meta.proxySource] || meta.proxySource;
      if ($("proxyHint")) $("proxyHint").textContent = t("proxyHintAuto", src, meta.proxy || "");
      if ($("logEnabled")) $("logEnabled").checked = meta.logEnabled !== false;
      if ($("logBodies")) $("logBodies").checked = meta.logBodies === true;
      if ($("logRetention") && !$("logRetention").matches(":focus")) $("logRetention").value = meta.logRetentionDays || 7;
      if ($("allowRegister")) $("allowRegister").checked = meta.allowRegisterSetting !== false;
      if ($("upstreamUrl") && !$("upstreamUrl").matches(":focus")) {
        $("upstreamUrl").value = meta.upstreamBaseUrlConfigured || "";
      }
      if ($("upstreamHint")) {
        const active = meta.xaiBaseUrl || "https://api.x.ai/v1";
        $("upstreamHint").textContent = t("upstreamActive", active) + " · " + t("upstreamHint");
      }
    }

    function headers() {
      return sessionToken ? { Authorization: "Bearer " + sessionToken } : {};
    }
    function jsonHeaders() { return { "Content-Type": "application/json", ...headers() }; }
    function showMsg(el, text, type) {
      if (!el) return;
      el.textContent = text;
      const isToast = el.classList.contains("toast") || el.id === "msgContrib";
      el.className = (isToast ? "toast show" : "msg show") + (type ? " " + type : "");
      if (el._hideTimer) clearTimeout(el._hideTimer);
      if (isToast) {
        el._hideTimer = setTimeout(() => hideMsg(el), type === "err" ? 5200 : 3200);
      }
    }
    function hideMsg(el) {
      if (!el) return;
      if (el._hideTimer) { clearTimeout(el._hideTimer); el._hideTimer = null; }
      const isToast = el.classList.contains("toast") || el.id === "msgContrib";
      el.className = isToast ? "toast" : "msg";
      el.textContent = "";
    }
    function esc(s) {
      return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    function fmtTime(ts) {
      if (!ts) return "–";
      const d = new Date(ts);
      const p = (n) => String(n).padStart(2, "0");
      return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }
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
      if (!$("curlBody")) return;
      const b = baseUrl();
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
      if ($("curlSeg")) $("curlSeg").querySelectorAll("button").forEach((btn) => btn.classList.toggle("on", btn.dataset.ep === curlEp));
    }

    function paintMode() {
      if (!$("modeSeg")) return;
      $("modeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.mode === routing.mode));
      if ($("currentLabel")) $("currentLabel").textContent = "Current: " + (routing.currentAccountId || "–") + " · " + routing.mode;
    }

    function shortErr(s) {
      const t = String(s || "").replace(/\s+/g, " ").trim();
      if (t.length <= 72) return t;
      return t.slice(0, 72) + "…";
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
      if (!tbody) return;
      if (!allAccounts.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("noAccounts")) + "</div>";
        $("accPager").innerHTML = "";
        return;
      }
      accPage = renderPager($("accPager"), accPage, allAccounts.length, PAGE_SIZE, (p) => { accPage = p; renderAccounts(); });
      const start = (accPage - 1) * PAGE_SIZE;
      const slice = allAccounts.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((a) => {
        const cur = a.isCurrent;
        const err = a.lastError ? shortErr(a.lastError) : "";
        return '<div class="dt-row' + (cur ? " current" : "") + '">' +
          '<div><div class="name">' + esc(a.name) + '</div>' +
          '<div class="mono">' + esc(a.id) + (a.donorUserId ? " · " + esc(a.donorUserId) : "") + "</div>" +
          ((cur || a.donorUserId)
            ? '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">' +
              (cur ? '<span class="badge current">' + esc(t("current")) + "</span>" : "") +
              (a.donorUserId ? '<span class="badge" title="donor">' + esc("contrib") + "</span>" : "") +
              "</div>"
            : "") +
          (err ? '<div class="acc-err" title="' + esc(a.lastError) + '">' + esc(err) + "</div>" : "") +
          "</div>" +
          '<div><span class="badge ' + esc(a.status) + '">' + esc(a.status) + "</span></div>" +
          "<div>" + creditCell(a) + "</div>" +
          '<div class="mono">' + a.useCount + "</div>" +
          '<div class="dt-time">' + fmtTime(a.lastUsedAt) + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="use" data-id="' + esc(a.id) + '">' + esc(t("use")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="credits" data-id="' + esc(a.id) + '">' + esc(t("credits")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="reset" data-id="' + esc(a.id) + '">' + esc(t("reset")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-id="' + esc(a.id) + '">' + esc(t("del")) + "</button>" +
          "</div></div>";
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
      if (!tbody) return;
      if (!allKeys.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("noKeys")) + "</div>";
        $("keyPager").innerHTML = "";
        return;
      }
      keyPage = renderPager($("keyPager"), keyPage, allKeys.length, PAGE_SIZE, (p) => { keyPage = p; renderKeys(); });
      const start = (keyPage - 1) * PAGE_SIZE;
      const slice = allKeys.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((k) => {
        const st = !k.enabled ? "disabled" : k.expired ? "expired" : "active";
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(k.alias) + '</div><div class="mono">' + esc(k.note || "") + "</div></div>" +
          '<div class="mono">' + esc(k.keyPrefix) + "</div>" +
          '<div><span class="badge ' + (st === "active" ? "active" : "error") + '">' + st + "</span></div>" +
          '<div class="dt-time">' + (k.expiresAt ? fmtTime(k.expiresAt) : "never") + "</div>" +
          '<div class="mono">' + k.useCount + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="toggle" data-id="' + esc(k.id) + '" data-en="' + (k.enabled ? "0" : "1") + '">' +
          esc(k.enabled ? t("disable") : t("enable")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="delkey" data-id="' + esc(k.id) + '">' + esc(t("del")) + "</button>" +
          "</div></div>";
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
      if (!sel) return;
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
      if (!tbody) return;
      if (!items.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("noLogs")) + "</div>";
        $("logPager").innerHTML = "";
        return;
      }
      logPage = renderPager($("logPager"), logPage, logTotal, LOG_PAGE, (p) => { logPage = p; loadLogs(); });
      const showAcc = isAdmin();
      const logsRoot = tbody.closest(".dt-logs");
      if (logsRoot) logsRoot.classList.toggle("no-account", !showAcc);
      tbody.innerHTML = items.map((r) => {
        const tok = fmtUsageShort(r.usage);
        const stCls = r.ok ? "active" : "error";
        const client = clientLabel(r);
        const uaTip = r.userAgent ? ' title="' + esc(r.userAgent) + '"' : "";
        return '<div class="dt-row clickable" data-id="' + esc(r.id) + '">' +
          '<div class="dt-time"><div class="dt-time-main">' + esc(fmtTime(r.ts)) + "</div>" +
          (r.stream ? '<span class="badge">stream</span>' : "") + "</div>" +
          '<div' + uaTip + '><div class="name">' + esc(client) + '</div>' +
          (r.userAgent && r.client && r.userAgent !== r.client ? '<div class="mono" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.userAgent) + "</div>" : "") +
          "</div>" +
          '<div><div class="name">' + esc(r.model || "–") + '</div><div class="mono">' + esc(r.mode) + "</div></div>" +
          '<div><span class="badge ' + stCls + '">' + esc(r.status) + "</span></div>" +
          '<div class="mono" style="white-space:nowrap">' + tok + "</div>" +
          '<div class="mono">' + (r.latencyMs != null ? r.latencyMs + "ms" : "–") + "</div>" +
          (showAcc ? '<div class="mono">' + esc(r.accountName || r.accountId || "–") + "</div>" : "") +
          '<div class="mono">' + esc(r.apiKeyAlias || r.apiKeyId || "–") + "</div>" +
          "</div>";
      }).join("");
      tbody.querySelectorAll(".dt-row[data-id]").forEach((tr) => {
        tr.addEventListener("click", () => openLogDetail(tr.getAttribute("data-id")));
      });
    }

    function renderOverviewRecent(items) {
      const el = $("ovRecent");
      if (!el) return;
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
      if (typeof Chart === "undefined" || !$("chartOverview")) return;
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
      if (typeof Chart === "undefined" || !$("chartDay")) return;
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
      if (isAdmin() && $("chartAccount")) {
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
      }

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

    // clear logs only admin
    // (btn already only in logs view; non-admin still sees own logs without clear if we hide)

    async function loadAccounts() {
      if (!isAdmin()) {
        allAccounts = [];
        return;
      }
      const res = await fetch("/api/admin/accounts", { headers: headers() });
      if (!res.ok) { showMsg($("msg"), "HTTP " + res.status, "err"); return; }
      const data = await res.json();
      routing = data.routing || routing;
      paintMode();
      if ($("sTotal")) $("sTotal").textContent = data.stats.total;
      if ($("sActive")) $("sActive").textContent = data.stats.active;
      allAccounts = data.accounts || [];
      const maxPage = Math.max(1, Math.ceil(allAccounts.length / PAGE_SIZE));
      if (accPage > maxPage) accPage = maxPage;
      renderAccounts();
    }

    async function loadKeys() {
      const res = await fetch(apiKeysPath(), { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      if ($("sKeys")) $("sKeys").textContent = data.keys.length;
      allKeys = data.keys || [];
      const maxPage = Math.max(1, Math.ceil(allKeys.length / PAGE_SIZE));
      if (keyPage > maxPage) keyPage = maxPage;
      renderKeys();
    }

    function fmtQuota(u) {
      const used = u.tokenUsed ?? 0;
      if (u.tokenQuota == null) return fmtNum(used) + " / " + t("quotaUnlimited");
      return t("quotaFmt", fmtNum(used), fmtNum(u.tokenQuota));
    }

    let quotaEditId = null;

    function openQuotaModal(u) {
      quotaEditId = u.id;
      $("quotaUserHint").textContent = u.username + " · " + u.id;
      $("quotaInput").value = u.tokenQuota == null ? "" : String(u.tokenQuota);
      $("quotaUsedDisp").textContent = fmtNum(u.tokenUsed ?? 0);
      $("quotaResetUsed").checked = false;
      $("quotaModal").classList.add("show");
      $("quotaInput").focus();
    }

    function closeQuotaModal() {
      quotaEditId = null;
      $("quotaModal").classList.remove("show");
    }

    async function loadUsers() {
      if (!isAdmin()) return;
      const res = await fetch("/api/admin/users", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      allUsers = data.users || [];
      const tbody = $("tbodyUsers");
      if (!allUsers.length) {
        tbody.innerHTML = '<div class="dt-empty">–</div>';
        return;
      }
      tbody.innerHTML = allUsers.map((u) => {
        const qCls = u.tokenQuota != null && (u.tokenUsed ?? 0) >= u.tokenQuota ? " error" : "";
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(u.username) + '</div><div class="mono">' + esc(u.id) + "</div></div>" +
          '<div><span class="badge ' + (u.role === "admin" ? "current" : "") + '">' + esc(u.role === "admin" ? t("roleAdmin") : t("roleUser")) + "</span></div>" +
          '<div><span class="badge ' + (u.enabled ? "active" : "error") + '">' + (u.enabled ? "active" : "disabled") + "</span></div>" +
          '<div class="mono' + qCls + '">' + esc(fmtQuota(u)) + "</div>" +
          '<div class="dt-time">' + fmtTime(u.lastLoginAt) + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="quota-user" data-id="' + esc(u.id) + '">' + esc(t("setQuota")) + "</button>" +
          (u.id === currentUser?.id ? "" :
            '<button class="btn btn-secondary btn-sm" type="button" data-act="toggle-user" data-id="' + esc(u.id) + '" data-en="' + (u.enabled ? "0" : "1") + '">' +
            esc(u.enabled ? t("disable") : t("enable")) + "</button>" +
            '<button class="btn btn-danger btn-sm" type="button" data-act="del-user" data-id="' + esc(u.id) + '">' + esc(t("del")) + "</button>") +
          "</div></div>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          try {
            if (act === "quota-user") {
              const u = allUsers.find((x) => x.id === id);
              if (u) openQuotaModal(u);
              return;
            }
            if (act === "toggle-user") {
              await fetch("/api/admin/users/" + id, { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ enabled: btn.getAttribute("data-en") === "1" }) });
            }
            if (act === "del-user") {
              if (!confirm(id + " ?")) return;
              await fetch("/api/admin/users/" + id, { method: "DELETE", headers: headers() });
            }
            await loadUsers();
          } catch (e) { showMsg($("msgUsers"), e.message, "err"); }
        });
      });
    }

    async function loadUsage() {
      try {
        const res = await fetch(apiUsagePath() + "?days=" + usageDays, { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        lastStats = data.stats;
        const s = data.stats.summary;
        const seg = tokenSegments(s);
        if ($("uReq")) $("uReq").textContent = fmtNum(s.requests);
        if ($("uIn")) $("uIn").textContent = fmtNum(seg.uncachedIn);
        if ($("uCache")) $("uCache").textContent = fmtNum(seg.cached);
        if ($("uOut")) $("uOut").textContent = fmtNum(s.completionTokens);
        if ($("uReason")) $("uReason").textContent = fmtNum(s.reasoningTokens);
        if ($("uTok")) $("uTok").textContent = fmtNum(s.totalTokens);
        if ($("uOk")) $("uOk").textContent = s.requests ? Math.round((s.ok / s.requests) * 100) + "%" : "–";
        if ($("uLat")) $("uLat").textContent = s.avgLatencyMs != null ? s.avgLatencyMs + "ms" : "–";
        if ($("uImg")) $("uImg").textContent = fmtNum(s.imageTokens);
        if ($("rangeSeg")) $("rangeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", Number(b.dataset.days) === usageDays));

        if ($("sReq")) $("sReq").textContent = fmtNum(s.requests);
        if ($("ovReq")) $("ovReq").textContent = fmtNum(s.requests);
        if ($("ovIn")) $("ovIn").textContent = fmtNum(seg.uncachedIn);
        if ($("ovOut")) $("ovOut").textContent = fmtNum(s.completionTokens);
        if ($("ovCache")) $("ovCache").textContent = t("kpiCache") + " " + fmtNum(seg.cached);
        if ($("ovReason")) $("ovReason").textContent = t("kpiReason") + " " + fmtNum(s.reasoningTokens);

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
        const res = await fetch(apiLogsPath() + "?" + qs.toString(), { headers: headers() });
        if (!res.ok) { showMsg($("msgLogs"), "HTTP " + res.status, "err"); return; }
        const data = await res.json();
        logTotal = data.total || 0;
        logDays = data.days || [];
        paintLogDaySelect();
        if (data.disk && $("logDisk")) $("logDisk").textContent = t("diskInfo", data.disk.days, fmtBytes(data.disk.bytes));
        renderLogs(data.items || []);
        if (view === "overview" || !day) renderOverviewRecent(data.items || []);
      } catch (e) {
        showMsg($("msgLogs"), String(e.message || e), "err");
      }
    }

    async function openLogDetail(id) {
      try {
        const res = await fetch(apiLogsPath() + "/" + encodeURIComponent(id), { headers: headers() });
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
          '<div><div class="k">' + esc(lang === "zh" ? "密钥" : "api key") + '</div><div class="v">' + esc(log.apiKeyAlias || "–") + " / " + esc(log.apiKeyId || "–") + "</div></div>" +
          '<div style="grid-column:1/-1"><div class="k">tokens</div><div class="v">' + esc(fmtUsageDetail(u)) + "</div></div>" +
          (log.error ? '<div style="grid-column:1/-1"><div class="k">error</div><div class="v" style="color:var(--error)">' + esc(log.error) + "</div></div>" : "") +
          "</div>" +
          '<div><div class="k" style="color:var(--mute);font-size:12px;margin-bottom:6px">headers</div><pre>' + esc(JSON.stringify(log.headers || {}, null, 2)) + "</pre></div>" +
          (log.request !== undefined
            ? '<div><div class="k" style="color:var(--mute);font-size:12px;margin-bottom:6px">request' + (log.requestTruncated ? " (truncated)" : "") + "</div><pre>" + esc(JSON.stringify(log.request, null, 2)) + "</pre></div>"
            : '<div class="hint" style="margin:8px 0">request body not stored (logBodies off)</div>') +
          (log.response !== undefined
            ? '<div><div class="k" style="color:var(--mute);font-size:12px;margin-bottom:6px">response' + (log.responseTruncated ? " (truncated)" : "") + "</div><pre>" + esc(typeof log.response === "string" ? log.response : JSON.stringify(log.response ?? null, null, 2)) + "</pre></div>"
            : '<div class="hint" style="margin:8px 0">response body not stored (logBodies off)</div>');
        $("logModal").classList.add("show");
      } catch (e) {
        showMsg($("msgLogs"), e.message, "err");
      }
    }

    function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    function stopContribPoll() {
      if (contribPollTimer) { clearInterval(contribPollTimer); contribPollTimer = null; }
    }

    function renderMyAccounts() {
      const tbody = $("tbodyContrib");
      if (!tbody) return;
      if (!myAccounts.length) {
        tbody.innerHTML = '<div class="empty-cta"><h3>' + esc(t("noContrib")) + '</h3><p>' + esc(t("mineHint")) + '</p><button class="btn" type="button" id="btnEmptyContrib">' + esc(t("contribCta")) + '</button></div>';
        if ($("contribPager")) $("contribPager").innerHTML = "";
        const b = $("btnEmptyContrib");
        if (b) b.onclick = () => startContribute();
        return;
      }
      contribPage = renderPager($("contribPager"), contribPage, myAccounts.length, PAGE_SIZE, (pg) => { contribPage = pg; renderMyAccounts(); });
      const start = (contribPage - 1) * PAGE_SIZE;
      const slice = myAccounts.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((a) => {
        const err = a.lastError ? shortErr(a.lastError) : "";
        const isPriv = a.private === true;
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(a.name) + '</div><div class="mono">' + esc(a.id) + "</div>" +
          (err ? '<div class="acc-err" title="' + esc(a.lastError) + '">' + esc(err) + "</div>" : "") +
          "</div>" +
          '<div><span class="badge ' + esc(a.status) + '">' + esc(a.status) + "</span></div>" +
          "<div>" + creditCell(a) + "</div>" +
          '<div class="mono">' + a.useCount + "</div>" +
          '<div><span class="badge ' + (isPriv ? "exhausted" : "active") + '">' + esc(isPriv ? t("visPrivate") : t("visPublic")) + "</span></div>" +
          '<div class="dt-time">' + fmtTime(a.lastUsedAt) + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="c-credits" data-id="' + esc(a.id) + '">' + esc(t("credits")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="c-vis" data-id="' + esc(a.id) + '" data-priv="' + (isPriv ? "0" : "1") + '">' +
          esc(isPriv ? t("setPublic") : t("setPrivate")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="c-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name || a.id) + '">' + esc(t("withdrawContrib")) + "</button>" +
          "</div></div>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "c-credits") checkMyCredits(id);
          if (act === "c-vis") setMyAccPrivate(id, btn.getAttribute("data-priv") === "1");
          if (act === "c-del") delMyAcc(id, btn.getAttribute("data-name") || id);
        });
      });
      paintRouteAccountSelect();
    }

    async function loadMyAccounts() {
      try {
        const res = await fetch("/api/me/accounts", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        myAccounts = data.accounts || [];
        const st = data.stats || {};
        if ($("cTotal")) $("cTotal").textContent = st.total ?? myAccounts.length;
        if ($("cActive")) $("cActive").textContent = st.active ?? 0;
        if ($("cExhausted")) $("cExhausted").textContent = st.exhausted ?? 0;
        if ($("contribMineCount")) $("contribMineCount").textContent = t("lbSeats", st.total ?? myAccounts.length);
        const maxPage = Math.max(1, Math.ceil(myAccounts.length / PAGE_SIZE));
        if (contribPage > maxPage) contribPage = maxPage;
        renderMyAccounts();
      } catch {}
    }

    async function loadLeaderboardLite() {
      try {
        const res = await fetch("/api/leaderboard", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        if ($("cRank")) {
          $("cRank").textContent = data.me ? ("#" + data.me.rank) : t("contribRankUnranked");
        }
      } catch {}
    }

    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        leaderboardData = data;
        if ($("lbSummary")) $("lbSummary").textContent = t("lbSummary", data.totalContributors || 0, data.totalDonated || 0);
        if (data.me) {
          if ($("lbMeRank")) $("lbMeRank").textContent = "#" + data.me.rank;
          if ($("lbMeMeta")) $("lbMeMeta").textContent = data.me.username + " · " + t("lbSeats", data.me.count);
          if ($("lbMeCount")) $("lbMeCount").textContent = t("lbSeats", data.me.count);
        } else {
          if ($("lbMeRank")) $("lbMeRank").textContent = "–";
          if ($("lbMeMeta")) $("lbMeMeta").textContent = t("lbUnranked");
          if ($("lbMeCount")) $("lbMeCount").textContent = t("lbSeats", 0);
        }
        if ($("cRank")) $("cRank").textContent = data.me ? ("#" + data.me.rank) : t("contribRankUnranked");
        paintPodium(data.entries || []);
        paintLbTable(data.entries || []);
      } catch {}
    }

    function paintPodium(entries) {
      const el = $("lbPodium");
      if (!el) return;
      if (!entries.length) {
        el.innerHTML = '<div class="empty-cta" style="grid-column:1/-1"><h3>' + esc(t("lbEmpty")) + '</h3><button class="btn" type="button" data-goto="contribute">' + esc(t("lbCta")) + '</button></div>';
        el.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => go(b.getAttribute("data-goto"))));
        return;
      }
      const top = [entries[1], entries[0], entries[2]]; // silver, gold, bronze visual order
      const cls = ["silver", "gold", "bronze"];
      const place = ["#2", "#1", "#3"];
      el.innerHTML = top.map((e, i) => {
        if (!e) return '<div class="pod ' + cls[i] + '" style="opacity:.35"><div class="place">' + place[i] + '</div><div class="uname">–</div><div class="cnt">0</div><div class="lbl">' + esc(t("colSeats")) + '</div></div>';
        return '<div class="pod ' + cls[i] + (e.isMe ? " me" : "") + '">' +
          '<div class="place">' + place[i] + '</div>' +
          '<div class="uname">' + esc(e.username) + (e.isMe ? ' · me' : '') + '</div>' +
          '<div class="cnt">' + e.count + '</div>' +
          '<div class="lbl">' + esc(t("colSeats")) + ' · ' + e.activeCount + ' ' + esc(t("statActive")).toLowerCase() + '</div>' +
          '</div>';
      }).join("");
    }

    function paintLbTable(entries) {
      const tbody = $("tbodyLb");
      if (!tbody) return;
      if (!entries.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("lbEmpty")) + "</div>";
        return;
      }
      tbody.innerHTML = entries.map((e) => {
        const rb = e.rank === 1 ? "top1" : e.rank === 2 ? "top2" : e.rank === 3 ? "top3" : "";
        return '<div class="dt-row' + (e.isMe ? " me lb-row" : "") + '">' +
          '<div><span class="rank-badge ' + rb + '">#' + e.rank + "</span></div>" +
          '<div><div class="name">' + esc(e.username) + (e.isMe ? ' <span class="badge current">me</span>' : "") + '</div></div>' +
          '<div class="mono">' + e.count + "</div>" +
          '<div class="mono">' + e.activeCount + "</div>" +
          "</div>";
      }).join("");
    }

    async function startContribute() {
      hideMsg($("msgContrib"));
      stopContribPoll();
      if ($("btnContribAdd")) $("btnContribAdd").disabled = true;
      if ($("btnContribStart")) $("btnContribStart").disabled = true;
      if ($("contribStage")) $("contribStage").classList.remove("show");
      try {
        const res = await fetch("/api/me/accounts/oauth", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ name: ($("contribName") && $("contribName").value) || undefined, openBrowser: false }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const url = data.verificationUriComplete || data.verificationUri;
        $("contribUserCode").textContent = data.userCode;
        $("contribVerifyLink").textContent = data.verificationUri;
        $("contribVerifyLink").href = url;
        $("contribPollStatus").textContent = t("waiting");
        $("contribStage").classList.add("show");
        // open verification page for the user
        try { window.open(url, "_blank", "noopener,noreferrer"); } catch {}
        const sessionId = data.sessionId;
        contribPollTimer = setInterval(async () => {
          try {
            const pr = await fetch("/api/me/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
            const result = await pr.json();
            if (result.ok) {
              stopContribPoll();
              $("contribStage").classList.remove("show");
              showMsg($("msgContrib"), t("contribOk") + ": " + (result.account?.name || result.account?.id), "ok");
              if ($("contribName")) $("contribName").value = "";
              if ($("btnContribAdd")) $("btnContribAdd").disabled = false;
              if ($("btnContribStart")) $("btnContribStart").disabled = false;
              await Promise.all([loadMyAccounts(), loadLeaderboardLite()]);
              return;
            }
            if (result.pending) {
              $("contribPollStatus").textContent = t("waiting") + " " + new Date().toLocaleTimeString();
              return;
            }
            stopContribPoll();
            if ($("btnContribAdd")) $("btnContribAdd").disabled = false;
            if ($("btnContribStart")) $("btnContribStart").disabled = false;
            showMsg($("msgContrib"), result.error || "failed", "err");
          } catch {
            $("contribPollStatus").textContent = t("waiting");
          }
        }, 2000);
      } catch (e) {
        showMsg($("msgContrib"), e.message, "err");
        if ($("btnContribAdd")) $("btnContribAdd").disabled = false;
        if ($("btnContribStart")) $("btnContribStart").disabled = false;
      }
    }

    async function checkMyCredits(id) {
      try {
        const res = await fetch("/api/me/accounts/" + id + "/credits", { method: "POST", headers: headers() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const c = data.credits;
        showMsg($("msgContrib"), t("usedLeft", c.creditUsagePercent, c.remainingPercent), "ok");
        await loadMyAccounts();
      } catch (e) { showMsg($("msgContrib"), e.message, "err"); }
    }

    async function setMyAccPrivate(id, priv) {
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(id), {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ private: !!priv }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgContrib"), priv ? t("privateOk") : t("publicOk"), "ok");
        await loadMyAccounts();
      } catch (e) { showMsg($("msgContrib"), e.message || String(e), "err"); }
    }

    let routeScope = "public";

    function paintRouteScopeUI() {
      if (!$("routeScopeSeg")) return;
      $("routeScopeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.rscope === routeScope));
      if ($("routeAccountSel")) $("routeAccountSel").style.display = routeScope === "account" ? "" : "none";
      if ($("routeScopeHint")) {
        $("routeScopeHint").textContent =
          routeScope === "mine" ? t("routeMineHint") :
          routeScope === "account" ? t("routeAccountHint") : t("routePublicHint");
      }
    }

    function paintRouteAccountSelect() {
      const sel = $("routeAccountSel");
      if (!sel) return;
      const cur = sel.value || (currentUser && currentUser.routeAccountId) || "";
      sel.innerHTML = myAccounts.map((a) =>
        '<option value="' + esc(a.id) + '"' + (a.id === cur ? " selected" : "") + ">" +
        esc(a.name) + (a.private ? " · " + t("visPrivate") : "") + "</option>"
      ).join("") || '<option value="">–</option>';
    }

    async function loadMyRouting() {
      try {
        const res = await fetch("/api/me/routing", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        routeScope = data.routeScope || "public";
        if (currentUser) {
          currentUser.routeScope = routeScope;
          currentUser.routeAccountId = data.routeAccountId || null;
        }
        paintRouteScopeUI();
        paintRouteAccountSelect();
        if ($("routeAccountSel") && data.routeAccountId) $("routeAccountSel").value = data.routeAccountId;
      } catch {}
    }

    async function saveMyRouting() {
      try {
        const body = { routeScope };
        if (routeScope === "account") {
          body.routeAccountId = ($("routeAccountSel") && $("routeAccountSel").value) || null;
        }
        const res = await fetch("/api/me/routing", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        if (data.user) currentUser = data.user;
        routeScope = data.routeScope || routeScope;
        paintRouteScopeUI();
        showMsg($("msgContrib"), t("routeSaved"), "ok");
      } catch (e) { showMsg($("msgContrib"), e.message || String(e), "err"); }
    }

    async function delMyAcc(id, name) {
      if (!confirm(t("withdrawContribConfirm", name || id))) return;
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(id), {
          method: "DELETE",
          headers: headers(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgContrib"), t("withdrawContribOk"), "ok");
        await Promise.all([loadMyAccounts(), loadLeaderboardLite(), loadLeaderboard().catch(() => {})]);
      } catch (e) {
        showMsg($("msgContrib"), e.message || String(e), "err");
      }
    }

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
    if ($("btnCreateKey")) $("btnCreateKey").onclick = openKeyModal;
    if ($("keyCancel")) $("keyCancel").onclick = closeKeyModal;
    if ($("keyModal")) $("keyModal").addEventListener("click", (e) => { if (e.target === $("keyModal")) closeKeyModal(); });
    if ($("logClose")) $("logClose").onclick = () => $("logModal").classList.remove("show");
    if ($("logModal")) $("logModal").addEventListener("click", (e) => { if (e.target === $("logModal")) $("logModal").classList.remove("show"); });
    if ($("quotaCancel")) $("quotaCancel").onclick = closeQuotaModal;
    if ($("quotaModal")) $("quotaModal").addEventListener("click", (e) => { if (e.target === $("quotaModal")) closeQuotaModal(); });
    if ($("quotaSubmit")) $("quotaSubmit").onclick = async () => {
      if (!quotaEditId) return;
      try {
        const raw = $("quotaInput").value.trim();
        const body = {};
        body.tokenQuota = raw === "" ? null : Number(raw);
        if (body.tokenQuota !== null && (!Number.isFinite(body.tokenQuota) || body.tokenQuota < 0)) {
          throw new Error("tokenQuota");
        }
        if ($("quotaResetUsed").checked) body.resetUsed = true;
        const res = await fetch("/api/admin/users/" + quotaEditId, {
          method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        closeQuotaModal();
        await loadUsers();
      } catch (e) { showMsg($("msgUsers"), e.message, "err"); closeQuotaModal(); }
    };
    if ($("keySubmit")) $("keySubmit").onclick = async () => {
      try {
        const days = $("keyDays").value ? Number($("keyDays").value) : null;
        const res = await fetch(apiKeysPath(), {
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
      await fetch(apiKeysPath() + "/" + id, { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ enabled }) });
      await loadKeys();
    }
    async function delKey(id) {
      if (!confirm(id + " ?")) return;
      await fetch(apiKeysPath() + "/" + id, { method: "DELETE", headers: headers() });
      await loadKeys();
    }

    // navigation: client-side SPA routing (no full reload)
    document.querySelectorAll("a.nav-item[data-view]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(el.getAttribute("data-view"));
      });
    });
    document.querySelectorAll("[data-goto]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        go(el.getAttribute("data-goto"));
      });
    });
    window.addEventListener("popstate", () => {
      const name = (history.state && history.state.view) || nameForPath(location.pathname);
      setView(name);
    });
    function openSide() {
      $("side").classList.add("open");
      if ($("sideScrim")) $("sideScrim").classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function closeSide() {
      $("side").classList.remove("open");
      if ($("sideScrim")) $("sideScrim").classList.remove("show");
      document.body.style.overflow = "";
    }
    function toggleSide() {
      if ($("side").classList.contains("open")) closeSide();
      else openSide();
    }
    $("btnSide").onclick = toggleSide;
    if ($("sideScrim")) $("sideScrim").onclick = closeSide;

    $("langSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      lang = b.dataset.lang;
      localStorage.setItem("grok_api_lang", lang);
      applyI18n();
      loadAll();
    });
    if ($("modeSeg")) $("modeSeg").addEventListener("click", async (e) => {
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
    if ($("curlSeg")) $("curlSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-ep]");
      if (!b) return;
      curlEp = b.dataset.ep;
      paintCurl();
    });
    if ($("btnCopyCurl")) $("btnCopyCurl").onclick = async () => {
      const text = $("curlBody").textContent;
      try { await navigator.clipboard.writeText(text); } catch {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      $("btnCopyCurl").textContent = t("copied");
      setTimeout(() => { $("btnCopyCurl").textContent = t("copy"); }, 1200);
    };
    if ($("proxyModeSeg")) $("proxyModeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-pmode]");
      if (!b) return;
      proxyMode = b.dataset.pmode;
      $("proxyModeSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x.dataset.pmode === proxyMode));
      $("proxyCustomWrap").classList.toggle("show", proxyMode === "custom");
    });
    if ($("btnSaveUpstream")) $("btnSaveUpstream").onclick = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ upstreamBaseUrl: $("upstreamUrl").value.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.upstreamBaseUrlConfigured = data.settings.upstreamBaseUrl || "";
        meta.xaiBaseUrl = data.xaiBaseUrl || data.settings.upstreamBaseUrl || meta.xaiBaseUrl;
        paintProxyUI();
        showMsg($("msg"), t("upstreamSaved"), "ok");
      } catch (e) { showMsg($("msg"), e.message, "err"); }
    };
    if ($("btnSaveProxy")) $("btnSaveProxy").onclick = async () => {
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
    if ($("btnSaveLog")) $("btnSaveLog").onclick = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({
            logEnabled: $("logEnabled").checked,
            logBodies: $("logBodies").checked,
            logRetentionDays: Number($("logRetention").value) || 7,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.logEnabled = data.settings.logEnabled;
        meta.logBodies = data.settings.logBodies === true;
        meta.logRetentionDays = data.settings.logRetentionDays;
        paintProxyUI();
        showMsg($("msgLogs"), t("logSaved"), "ok");
        await loadLogs();
      } catch (e) { showMsg($("msgLogs"), e.message, "err"); }
    };
    if ($("btnSaveReg")) $("btnSaveReg").onclick = async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ allowRegister: $("allowRegister").checked }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.allowRegisterSetting = data.settings.allowRegister;
        meta.allowRegister = data.settings.allowRegister;
        paintProxyUI();
        showMsg($("msgLogs"), t("logSaved"), "ok");
      } catch (e) { showMsg($("msgLogs"), e.message, "err"); }
    };
    if ($("rangeSeg")) $("rangeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-days]");
      if (!b) return;
      usageDays = Number(b.dataset.days) || 7;
      loadUsage();
    });
    if ($("logDay")) $("logDay").onchange = () => { logPage = 1; loadLogs(); };
    if ($("logOk")) $("logOk").onchange = () => { logPage = 1; loadLogs(); };
    if ($("btnLogRefresh")) $("btnLogRefresh").onclick = () => loadLogs();
    if ($("btnLogStrip")) $("btnLogStrip").onclick = async () => {
      if (!confirm(t("stripLogsConfirm"))) return;
      try {
        $("btnLogStrip").disabled = true;
        const res = await fetch("/api/admin/logs/strip-bodies", {
          method: "POST", headers: jsonHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const saved = Math.max(0, (data.bytesBefore || 0) - (data.bytesAfter || 0));
        showMsg($("msgLogs"), t("logsStripped", data.stripped || 0, fmtBytes(saved)), "ok");
        logPage = 1;
        await loadLogs();
      } catch (e) { showMsg($("msgLogs"), e.message, "err"); }
      finally { if ($("btnLogStrip")) $("btnLogStrip").disabled = false; }
    };
    if ($("btnLogClear")) $("btnLogClear").onclick = async () => {
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

    if ($("btnAdd")) $("btnAdd").onclick = addOAuth;
    if ($("btnContribAdd")) $("btnContribAdd").onclick = startContribute;
    if ($("btnContribStart")) $("btnContribStart").onclick = startContribute;
    if ($("btnContribRefresh")) $("btnContribRefresh").onclick = () => { hideMsg($("msgContrib")); loadMyAccounts(); loadMyRouting(); loadLeaderboardLite(); };
    if ($("routeScopeSeg")) $("routeScopeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-rscope]");
      if (!b) return;
      routeScope = b.dataset.rscope || "public";
      paintRouteScopeUI();
    });
    if ($("btnSaveRoute")) $("btnSaveRoute").onclick = () => saveMyRouting();
    if ($("btnLbRefresh")) $("btnLbRefresh").onclick = () => loadLeaderboard();
    if ($("btnContribCopy")) $("btnContribCopy").onclick = async () => {
      const code = $("contribUserCode")?.textContent || "";
      try { await navigator.clipboard.writeText(code.replace(/\s+/g, "")); }
      catch {
        const ta = document.createElement("textarea"); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      $("btnContribCopy").textContent = t("copied");
      setTimeout(() => { if ($("btnContribCopy")) $("btnContribCopy").textContent = t("copy"); }, 1200);
    };
    $("btnRefresh").onclick = () => { hideMsg($("msg")); hideMsg($("msgKeys")); hideMsg($("msgLogs")); hideMsg($("msgContrib")); loadAll(); };
    $("btnLogout").onclick = logout;

    async function loadAll() {
      await loadMeta();
      applyI18n();
      if (!currentUser) return;
      applyRoleNav();
      const tasks = [loadKeys(), loadUsage(), loadLogs()];
      if (isAdmin()) tasks.push(loadAccounts());
      if (view === "contribute" || view === "overview") tasks.push(loadMyAccounts(), loadLeaderboardLite());
      if (view === "leaderboard") tasks.push(loadLeaderboard());
      await Promise.all(tasks);
      paintCurl();
    }

    (async function boot() {
      await loadMeta();
      if (meta.needsSetup) {
        location.href = "/setup";
        return;
      }
      const ok = await ensureSession();
      if (!ok) {
        sessionToken = "";
        localStorage.removeItem("grok_api_session");
        location.href = "/login";
        return;
      }
      // non-admin visiting admin-only page
      if (VIEW_META[PAGE]?.admin && !isAdmin()) {
        go("overview", { replace: true });
        await loadAll();
        return;
      }
      view = PAGE;
      history.replaceState({ view: PAGE }, "", pathFor(PAGE));
      applyI18n();
      applyRoleNav();
      await loadAll();
    })();
  </script>
</body>
</html>`;
}
