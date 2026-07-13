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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
        <span class="brand-name">Grok API</span>
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
          <a class="nav-item ${page==='contribute'?'on':''}" href="/contribute" data-view="contribute"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="M15.41 6.51 8.59 10.49"/></svg></span><span data-i18n="navContribute">Contribute</span></a>
          <a class="nav-item ${page==='leaderboard'?'on':''}" href="/leaderboard" data-view="leaderboard"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0V4Z"/><path d="M17 4h2a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3"/><path d="M7 4H5a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3"/></svg></span><span data-i18n="navLeaderboard">Leaderboard</span></a>
        </div>
        <div class="nav-group">
          <div class="nav-label" data-i18n="navSystem">System</div>
          <a class="nav-item ${page==='usage'?'on':''}" href="/usage" data-view="usage"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-9"/></svg></span><span data-i18n="navUsage">Usage</span></a>
          <a class="nav-item ${page==='logs'?'on':''}" href="/logs" data-view="logs"><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg></span><span data-i18n="navLogs">Logs</span></a>
          <a class="nav-item ${page==='settings'?'on':''}" href="/settings" data-view="settings" data-admin-only><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span><span data-i18n="navSettings">Settings</span></a>
        </div>
      </nav>
    </aside>

    <div class="side-scrim" id="sideScrim" aria-hidden="true"></div>

    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn side-toggle" type="button" id="btnSide" aria-label="Menu">
            <svg class="side-toggle-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="topbar-titles">
            <h1 class="page-title" id="pageTitle">Overview</h1>
            <p class="page-sub" id="pageSub"></p>
          </div>
        </div>
        <div class="top-actions">
          <div class="tb-menu" id="langMenu">
            <button class="icon-btn lang-icon-btn" id="btnLang" type="button" aria-haspopup="menu" aria-expanded="false" title="Language">
              <span class="lang-icon" aria-hidden="true">
                <span class="lang-icon-zh">文</span>
                <span class="lang-icon-en">A</span>
              </span>
            </button>
            <div class="tb-pop" id="langPop" role="menu" hidden>
              <button type="button" class="tb-item" role="menuitem" data-lang="zh"><span>中文</span><span class="tb-check" data-check="zh"></span></button>
              <button type="button" class="tb-item" role="menuitem" data-lang="en"><span>English</span><span class="tb-check" data-check="en"></span></button>
            </div>
          </div>

          <div class="tb-menu user-menu" id="userMenu" style="display:none">
            <button class="user-chip" id="userChip" type="button" aria-haspopup="menu" aria-expanded="false">
              <span class="user-avatar" id="userAvatar" aria-hidden="true">–</span>
              <span class="user-meta">
                <strong id="userName">–</strong>
                <span id="userRole" class="user-role"></span>
              </span>
              <svg class="user-caret" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="tb-pop user-pop" id="userPop" role="menu" hidden>
              <div class="tb-user-hd">
                <span class="user-avatar sm" id="userAvatarMenu" aria-hidden="true">–</span>
                <div class="tb-user-meta">
                  <strong id="userNameMenu">–</strong>
                  <span id="userRoleMenu">–</span>
                </div>
              </div>
              <div class="tb-sep"></div>
              <button type="button" class="tb-item danger" id="btnLogout" role="menuitem" data-i18n="logout">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main class="content">
        <!-- OVERVIEW -->
        <section class="view ${page==='overview'?'on':''}" id="view-overview">
          <div class="ov-welcome">
            <div class="ov-welcome-main">
              <div class="ov-kicker" data-i18n="ovKicker">Console</div>
              <h1 id="ovHello" data-i18n="ovHello">Overview</h1>
              <p id="ovHelloSub" data-i18n="ovHelloSub">Pool health, recent traffic, and shortcuts.</p>
            </div>
            <div class="ov-welcome-side">
              <div class="ov-pill" id="ovUserPill">–</div>
              <div class="ov-pill mono" id="ovRangePill">–</div>
            </div>
          </div>

          <div class="ov-kpis" id="ovKpis">
            <button type="button" class="ov-kpi clickable" data-goto="usage">
              <div class="ov-kpi-l" data-i18n="statReqs">Requests</div>
              <div class="ov-kpi-n" id="sReq">–</div>
              <div class="ov-kpi-s" id="ovOkRate">–</div>
            </button>
            <button type="button" class="ov-kpi clickable" data-goto="usage">
              <div class="ov-kpi-l" data-i18n="kpiTok">Total tokens</div>
              <div class="ov-kpi-n" id="ovTok">–</div>
              <div class="ov-kpi-s" id="ovLat">–</div>
            </button>
            <button type="button" class="ov-kpi clickable" data-goto="keys">
              <div class="ov-kpi-l" data-i18n="statKeys">API Keys</div>
              <div class="ov-kpi-n" id="sKeys">–</div>
              <div class="ov-kpi-s" data-i18n="qaKey">Issue client keys</div>
            </button>
            <button type="button" class="ov-kpi clickable" data-goto="contribute">
              <div class="ov-kpi-l" data-i18n="statMine">My seats</div>
              <div class="ov-kpi-n" id="ovMine">–</div>
              <div class="ov-kpi-s" id="ovRank">–</div>
            </button>
            <button type="button" class="ov-kpi clickable" data-goto="accounts" data-admin-only>
              <div class="ov-kpi-l" data-i18n="statAccounts">Accounts</div>
              <div class="ov-kpi-n" id="sTotal">–</div>
              <div class="ov-kpi-s" id="sActiveWrap"><span id="sActive">–</span> <span data-i18n="statActive">Active</span></div>
            </button>
          </div>

          <div class="ov-grid mb">
            <div class="ov-main">
              <div class="card ov-card-usage">
                <div class="card-hd">
                  <div>
                    <strong data-i18n="ovUsage">Usage</strong>
                    <div class="mono ov-card-sub" id="ovUsageSub">–</div>
                  </div>
                  <div class="spacer"></div>
                  <button class="btn btn-ghost btn-sm" type="button" data-goto="usage" data-i18n="viewMore">Details →</button>
                </div>
                <div class="card-bd">
                  <div class="ov-token-row">
                    <div class="ov-token"><span class="ov-dot in"></span><span data-i18n="kpiIn">Input</span><strong id="ovIn">–</strong></div>
                    <div class="ov-token"><span class="ov-dot cache"></span><span data-i18n="kpiCache">Cached</span><strong id="ovCache">–</strong></div>
                    <div class="ov-token"><span class="ov-dot out"></span><span data-i18n="kpiOut">Output</span><strong id="ovOut">–</strong></div>
                    <div class="ov-token"><span class="ov-dot reason"></span><span data-i18n="kpiReason">Reasoning</span><strong id="ovReason">–</strong></div>
                  </div>
                  <div class="chart-wrap chart-overview"><canvas id="chartOverview"></canvas></div>
                </div>
              </div>
              <div class="ov-mini-grid">
                <div class="card ov-card-mini">
                  <div class="card-hd"><strong data-i18n="chartModel">Models</strong></div>
                  <div class="card-bd">
                    <div class="chart-wrap chart-ov-mini"><canvas id="chartOvModel"></canvas></div>
                  </div>
                </div>
                <div class="card ov-card-mini">
                  <div class="card-hd"><strong data-i18n="ovReqChart">Requests</strong></div>
                  <div class="card-bd">
                    <div class="chart-wrap chart-ov-mini"><canvas id="chartOvReq"></canvas></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ov-side">
              <div class="card">
                <div class="card-hd"><strong data-i18n="ovQuick">Shortcuts</strong></div>
                <div class="card-bd ov-qa-bd">
                  <div class="quick-actions" id="quickActions">
                    <button type="button" class="qa" data-goto="keys"><strong data-i18n="navKeys">API Keys</strong><span data-i18n="qaKey">Issue client keys</span></button>
                    <button type="button" class="qa" data-goto="usage"><strong data-i18n="navUsage">Usage</strong><span data-i18n="qaUsage">Charts & distribution</span></button>
                    <button type="button" class="qa" data-goto="contribute"><strong data-i18n="navContribute">Contribute</strong><span data-i18n="qaContrib">Share SuperGrok capacity</span></button>
                    <button type="button" class="qa" data-goto="leaderboard"><strong data-i18n="navLeaderboard">Leaderboard</strong><span data-i18n="qaLb">See top contributors</span></button>
                    <button type="button" class="qa" data-goto="logs"><strong data-i18n="navLogs">Logs</strong><span data-i18n="qaLogs">Debug full requests</span></button>
                    <button type="button" class="qa" data-goto="accounts" data-admin-only><strong data-i18n="navAccounts">Accounts</strong><span data-i18n="qaAcc">Pool & credits</span></button>
                    <button type="button" class="qa" data-goto="settings" data-admin-only><strong data-i18n="navSettings">Settings</strong><span data-i18n="qaSettings">Endpoints & proxy</span></button>
                  </div>
                </div>
              </div>

              <div class="card ov-card-recent">
                <div class="card-hd">
                  <strong data-i18n="ovRecent">Recent requests</strong>
                  <div class="spacer"></div>
                  <button class="btn btn-ghost btn-sm" type="button" data-goto="logs" data-i18n="viewAllLogs">All logs →</button>
                </div>
                <div class="card-bd" style="padding:0">
                  <div class="quick-list" id="ovRecent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ACCOUNTS -->
        <section class="view ${page==='accounts'?'on':''}" id="view-accounts">
          <div class="panel">
            <div class="routing-bar">
              <div class="routing-left">
                <span class="bar-label" data-i18n="routing">Routing</span>
                <div class="seg" id="modeSeg">
                  <button type="button" data-mode="auto" class="on" data-i18n="modeAuto">Auto</button>
                  <button type="button" data-mode="manual" data-i18n="modeManual">Manual</button>
                </div>
                <span class="mono current-pill" id="currentLabel">Current: –</span>
              </div>
            </div>
            <div class="add-bar">
              <div class="add-fields">
                <div class="add-field">
                  <label class="field-label" data-i18n="accNamePh">Note (optional)</label>
                  <input id="accName" class="input" data-i18n-placeholder="accNamePh" />
                </div>
                <div class="add-field">
                  <label class="field-label" data-i18n="accDonorLabel">Donor</label>
                  <select id="accDonor" class="select" data-searchable="1">
                    <option value="" data-i18n="accDonorNone">No donor</option>
                  </select>
                </div>
                <div class="add-field">
                  <label class="field-label" data-i18n="colVisibility">Visibility</label>
                  <select id="accPrivate" class="select">
                    <option value="public" data-i18n="visPublic">Public</option>
                    <option value="private" data-i18n="visPrivate">Private</option>
                  </select>
                </div>
              </div>
              <button class="btn" id="btnAdd" type="button" data-i18n="addAccount">Add account</button>
            </div>
            <div id="codeBox" class="codebox">
              <div class="label" data-i18n="deviceHint">Enter this Device Code:</div>
              <div class="code" id="userCode">––––</div>
              <div class="label" style="margin-top:12px"><span data-i18n="verifyUrl">URL</span>：<a id="verifyLink" href="#" target="_blank" rel="noreferrer">–</a></div>
              <div class="label" style="margin-top:8px" id="pollStatus"></div>
            </div>
            <div id="msg" class="msg"></div>
            <div class="filter-bar">
              <input id="accFilterQ" class="input grow" data-i18n-placeholder="filterSearch" placeholder="Search…" />
              <select id="accFilterSt" class="select" style="min-width:110px">
                <option value="" data-i18n="filterAllStatus">All status</option>
                <option value="active">active</option>
                <option value="exhausted">exhausted</option>
                <option value="expired">expired</option>
                <option value="error">error</option>
              </select>
              <select id="accFilterVis" class="select" style="min-width:130px">
                <option value="" data-i18n="filterAllVis">All visibility</option>
                <option value="public" data-i18n="visPublic">Public pool</option>
                <option value="private" data-i18n="visPrivate">Donor only</option>
                <option value="restricted" data-i18n="visRestricted">Named members</option>
              </select>
            </div>
            <div class="dt dt-accounts">
              <div class="dt-head">
                <div data-i18n="colAccount">Account</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colVisibility">Visibility</div>
                <div data-i18n="colDonor">Donor</div>
                <div data-i18n="colAllowed">Allowed users</div>
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
            <div class="filter-bar">
              <input id="userFilterQ" class="input grow" data-i18n-placeholder="filterSearch" placeholder="Search…" />
              <select id="userFilterRole" class="select" style="min-width:110px">
                <option value="" data-i18n="filterAllRole">All roles</option>
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
              <select id="userFilterSt" class="select" style="min-width:110px">
                <option value="" data-i18n="filterAllStatus">All status</option>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
            </div>
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
            <div class="filter-bar">
              <input id="keyFilterQ" class="input grow" data-i18n-placeholder="filterSearch" placeholder="Search…" />
              <select id="keyFilterSt" class="select" style="min-width:110px">
                <option value="" data-i18n="filterAllStatus">All status</option>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
                <option value="expired">expired</option>
              </select>
            </div>
            <div class="dt dt-keys">
              <div class="dt-head">
                <div data-i18n="colAlias">Alias</div>
                <div data-i18n="colKey">Key</div>
                <div data-i18n="colOwner" data-admin-only>Owner</div>
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
            <div class="panel-hd usage-hd">
              <div>
                <strong data-i18n="usageTitle">Analytics</strong>
                <div class="mono" id="usageRangeHint" style="margin-top:2px;font-size:12px">–</div>
              </div>
              <div class="spacer"></div>
              <div class="usage-controls">
                <div class="usage-ctrl">
                  <span class="field-label" data-i18n="usageRange">Range</span>
                  <div class="seg" id="rangeSeg">
                    <button type="button" data-range="1h">1h</button>
                    <button type="button" data-range="6h">6h</button>
                    <button type="button" data-range="24h" class="on">24h</button>
                    <button type="button" data-range="7d">7d</button>
                    <button type="button" data-range="30d">30d</button>
                  </div>
                </div>
                <div class="usage-ctrl">
                  <span class="field-label" data-i18n="usageGran">Bucket</span>
                  <div class="seg" id="granSeg">
                    <button type="button" data-gran="auto" class="on" data-i18n="granAuto">Auto</button>
                    <button type="button" data-gran="minute" data-i18n="granMinute">1m</button>
                    <button type="button" data-gran="5m" data-i18n="gran5m">5m</button>
                    <button type="button" data-gran="hour" data-i18n="granHour">1h</button>
                    <button type="button" data-gran="day" data-i18n="granDay">1d</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel-bd">
              <div class="usage-kpis">
                <div class="kpi"><div class="n" id="uReq">–</div><div class="l" data-i18n="kpiReq">Requests</div></div>
                <div class="kpi"><div class="n" id="uIn">–</div><div class="l" data-i18n="kpiIn">Input tokens</div></div>
                <div class="kpi"><div class="n" id="uCache">–</div><div class="l" data-i18n="kpiCache">Cached input</div></div>
                <div class="kpi"><div class="n" id="uCacheHit">–</div><div class="l" data-i18n="kpiCacheHit">Cache hit</div></div>
                <div class="kpi"><div class="n" id="uOut">–</div><div class="l" data-i18n="kpiOut">Output tokens</div></div>
                <div class="kpi"><div class="n" id="uReason">–</div><div class="l" data-i18n="kpiReason">Reasoning</div></div>
                <div class="kpi"><div class="n" id="uTok">–</div><div class="l" data-i18n="kpiTok">Total tokens</div></div>
              </div>
              <div class="usage-kpis compact" style="margin-top:-4px;margin-bottom:14px">
                <div class="kpi"><div class="n" id="uOk">–</div><div class="l" data-i18n="kpiOk">Success rate</div></div>
                <div class="kpi"><div class="n" id="uLat">–</div><div class="l" data-i18n="kpiLat">Avg latency</div></div>
                <div class="kpi"><div class="n" id="uTtft">–</div><div class="l" data-i18n="kpiTtft">Avg TTFT</div></div>
                <div class="kpi"><div class="n" id="uTps">–</div><div class="l" data-i18n="kpiTps">Avg TPS</div></div>
                <div class="kpi"><div class="n" id="uImg">–</div><div class="l" data-i18n="kpiImg">Image tokens</div></div>
              </div>
              <div class="charts">
                <div class="chart-card">
                  <div class="chart-hd">
                    <h4 id="chartTimeTitle" data-i18n="chartDay">Token over time</h4>
                    <span class="chart-meta" id="cacheHitDay">–</span>
                  </div>
                  <div class="chart-wrap"><canvas id="chartDay"></canvas></div>
                </div>
                <div class="chart-card">
                  <div class="chart-hd">
                    <h4 data-i18n="chartTokMix">Token mix</h4>
                    <span class="chart-meta" id="cacheHitMix">–</span>
                  </div>
                  <div class="chart-wrap"><canvas id="chartTokMix"></canvas></div>
                </div>
                <div class="chart-card"><h4 data-i18n="chartModel">Model distribution</h4><div class="chart-wrap"><canvas id="chartModel"></canvas></div></div>
                <div class="chart-card" data-admin-only>
                  <div class="chart-hd">
                    <h4 data-i18n="chartAccount">By account</h4>
                    <span class="chart-meta" id="cacheHitAcc">–</span>
                  </div>
                  <div class="chart-wrap"><canvas id="chartAccount"></canvas></div>
                </div>
                <div class="chart-card">
                  <div class="chart-hd">
                    <h4 data-i18n="chartKey">By API key (tokens)</h4>
                    <span class="chart-meta" id="cacheHitKey">–</span>
                  </div>
                  <div class="chart-wrap"><canvas id="chartKey"></canvas></div>
                </div>
                <div class="chart-card">
                  <div class="chart-hd">
                    <h4 data-i18n="chartKeyInOut">By key · in / out</h4>
                    <span class="chart-meta" id="cacheHitKeyIO">–</span>
                  </div>
                  <div class="chart-wrap"><canvas id="chartKeyInOut"></canvas></div>
                </div>
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
              <input id="logFilterQ" class="input" style="min-width:140px;max-width:200px" data-i18n-placeholder="filterSearch" placeholder="Search…" />
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
                <div data-i18n="colTtft">TTFT</div>
                <div data-i18n="colTps">TPS</div>
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
            </div>
            <div class="panel-bd">
              <div class="panel-hd" style="border:0;padding:0 0 12px;background:transparent">
                <button class="btn" type="button" id="btnContribAdd" data-i18n="contribCta">Contribute an account</button>
              </div>
              <div class="steps">
                <div class="step"><div class="n">01</div><strong data-i18n="step1t">Start OAuth</strong><span data-i18n="step1d">We open an xAI device-code flow. No password is stored by us.</span></div>
                <div class="step"><div class="n">02</div><strong data-i18n="step2t">Approve in browser</strong><span data-i18n="step2d">Enter the code on accounts.x.ai and authorize SuperGrok access.</span></div>
                <div class="step"><div class="n">03</div><strong data-i18n="step3t">Join the pool</strong><span data-i18n="step3d">Seat status updates live in your list when authorization completes.</span></div>
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

          <div class="panel mb route-panel">
            <div class="panel-hd">
              <div>
                <strong data-i18n="routeTitle">API routing</strong>
                <div class="mono" style="margin-top:2px;font-size:12px" data-i18n="routeHint">Applies to your API keys</div>
              </div>
              <div class="spacer"></div>
              <button class="btn btn-sm" type="button" id="btnSaveRoute" data-i18n="saveRoute">Save</button>
            </div>
            <div class="panel-bd">
              <div class="route-grid">
                <div class="route-field">
                  <label class="field-label" data-i18n="routeScopeLabel">Route mode</label>
                  <div class="seg" id="routeScopeSeg">
                    <button type="button" data-rscope="auto" class="on" data-i18n="routeAuto">Auto</button>
                    <button type="button" data-rscope="public" data-i18n="routePublic">Public pool</button>
                    <button type="button" data-rscope="mine" data-i18n="routeMine">My seats only</button>
                    <button type="button" data-rscope="account" data-i18n="routeAccount">Pin account</button>
                  </div>
                </div>
                <div class="route-field" id="routeAccountWrap" style="display:none">
                  <label class="field-label" data-i18n="routeAccountLabel">Pinned seat</label>
                  <select id="routeAccountSel" class="select" style="width:100%;min-width:0"></select>
                </div>
              </div>
              <div class="route-hint" id="routeScopeHint" data-i18n="routeAutoHint">Use every seat you can access: public, allowlisted, and your own donations.</div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-hd">
              <strong data-i18n="mineTitle">My contributions</strong>
              <span class="mono" data-i18n="mineHint">Visible only to you</span>
              <div class="spacer"></div>
              <button class="btn btn-secondary btn-sm" type="button" id="btnContribRefresh" data-i18n="refresh">Refresh</button>
            </div>
            <div class="filter-bar">
              <input id="contribFilterQ" class="input grow" data-i18n-placeholder="filterSearch" placeholder="Search…" />
              <select id="contribFilterSt" class="select" style="min-width:110px">
                <option value="" data-i18n="filterAllStatus">All status</option>
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="exhausted">exhausted</option>
                <option value="expired">expired</option>
                <option value="error">error</option>
              </select>
              <select id="contribFilterVis" class="select" style="min-width:130px">
                <option value="" data-i18n="filterAllVis">All visibility</option>
                <option value="public" data-i18n="visPublic">Public pool</option>
                <option value="private" data-i18n="visPrivate">Donor only</option>
                <option value="restricted" data-i18n="visRestricted">Named members</option>
              </select>
            </div>
            <div class="dt dt-contrib">
              <div class="dt-head">
                <div data-i18n="colAccount">Account</div>
                <div data-i18n="colStatus">Status</div>
                <div data-i18n="colCredits">Credits</div>
                <div data-i18n="colUses">Uses</div>
                <div data-i18n="colVisibility">Visibility</div>
                <div data-i18n="colMembers">Members</div>
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
            <p data-i18n="lbSub">Two boards: total seats (public + private) and public-only seats. Admins are excluded.</p>
            <div class="contrib-cta-row">
              <button class="btn" type="button" data-goto="contribute" data-i18n="lbCta">Contribute now</button>
              <span class="mono" id="lbSummary" style="color:var(--mute)">–</span>
            </div>
          </div>

          <div class="lb-boards">
            <div class="lb-board">
              <div class="lb-board-hd">
                <strong data-i18n="lbTotalTitle">Total board</strong>
                <span class="mono" data-i18n="lbTotalHint">Public + private</span>
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
                  <strong data-i18n="lbTableTotal">Total ranking</strong>
                  <div class="spacer"></div>
                  <button class="btn btn-secondary btn-sm" type="button" id="btnLbRefresh" data-i18n="refresh">Refresh</button>
                </div>
                <div class="dt dt-lb">
                  <div class="dt-head">
                    <div data-i18n="colRank">Rank</div>
                    <div data-i18n="colUser">User</div>
                    <div data-i18n="colSeats">Total</div>
                    <div data-i18n="colPublic">Public</div>
                    <div data-i18n="colPrivate">Private</div>
                    <div data-i18n="colActive">Active</div>
                  </div>
                  <div class="dt-body" id="tbodyLb"><div class="dt-empty">…</div></div>
                </div>
              </div>
            </div>

            <div class="lb-board">
              <div class="lb-board-hd">
                <strong data-i18n="lbPublicTitle">Public board</strong>
                <span class="mono" data-i18n="lbPublicHint">Shared pool only</span>
              </div>
              <div class="rank-me" id="lbPubMeCard">
                <div>
                  <div class="mono" style="font-size:12px;color:var(--mute);margin-bottom:4px" data-i18n="lbYourRank">Your rank</div>
                  <div class="big" id="lbPubMeRank">–</div>
                  <div class="meta" id="lbPubMeMeta">–</div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
                  <span class="pill" id="lbPubMeCount">0</span>
                </div>
              </div>
              <div class="podium" id="lbPubPodium"></div>
              <div class="panel">
                <div class="panel-hd">
                  <strong data-i18n="lbTablePublic">Public ranking</strong>
                  <div class="spacer"></div>
                </div>
                <div class="dt dt-lb-pub">
                  <div class="dt-head">
                    <div data-i18n="colRank">Rank</div>
                    <div data-i18n="colUser">User</div>
                    <div data-i18n="colPublic">Public</div>
                    <div data-i18n="colActive">Active</div>
                  </div>
                  <div class="dt-body" id="tbodyLbPub"><div class="dt-empty">…</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SETTINGS -->
        <section class="view ${page==='settings'?'on':''}" id="view-settings">
          <div class="settings-stack">
            <div class="callout" id="adminExplain"></div>

            <div class="settings-card">
              <div class="settings-card-hd">
                <div>
                  <div class="settings-card-title" data-i18n="endpointsTitle">Outbound endpoints</div>
                  <div class="settings-card-sub" data-i18n="endpointsSub">LLM / OAuth / Billing — point to official hosts or a jump proxy</div>
                </div>
                <button class="btn" type="button" id="btnSaveUpstream" data-i18n="saveEndpoints">Save endpoints</button>
              </div>
              <div class="settings-card-bd">
                <div class="endpoint-grid">
                  <div class="endpoint-field">
                    <label class="field-label" data-i18n="upstreamTitle">LLM upstream</label>
                    <input id="upstreamUrl" class="input block" placeholder="https://api.x.ai/v1" />
                    <div class="hint-active mono" id="upstreamActive">–</div>
                    <div class="hint" id="upstreamHint" data-i18n="upstreamHint">Empty = api.x.ai/v1</div>
                  </div>
                  <div class="endpoint-field">
                    <label class="field-label" data-i18n="oauthBaseTitle">OAuth base</label>
                    <input id="oauthBaseUrl" class="input block" placeholder="https://auth.x.ai" />
                    <div class="hint-active mono" id="oauthBaseActive">–</div>
                    <div class="hint" id="oauthBaseHint" data-i18n="oauthBaseHint">Empty = auth.x.ai</div>
                  </div>
                  <div class="endpoint-field">
                    <label class="field-label" data-i18n="billingBaseTitle">Billing base</label>
                    <input id="billingBaseUrl" class="input block" placeholder="https://cli-chat-proxy.grok.com" />
                    <div class="hint-active mono" id="billingBaseActive">–</div>
                    <div class="hint" id="billingBaseHint" data-i18n="billingBaseHint">Empty = cli-chat-proxy.grok.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <div class="settings-card-hd">
                <div>
                  <div class="settings-card-title" data-i18n="proxyTitle">Outbound proxy</div>
                  <div class="settings-card-sub" data-i18n="proxySub">Optional local HTTP proxy for Node outbound (not the browser)</div>
                </div>
                <button class="btn" type="button" id="btnSaveProxy" data-i18n="saveProxy">Save</button>
              </div>
              <div class="settings-card-bd">
                <div class="settings-row tight">
                  <div class="seg" id="proxyModeSeg">
                    <button type="button" data-pmode="auto" class="on" data-i18n="proxyAuto">Auto</button>
                    <button type="button" data-pmode="direct" data-i18n="proxyDirect">Direct</button>
                    <button type="button" data-pmode="custom" data-i18n="proxyCustom">Custom</button>
                  </div>
                  <div id="proxyCustomWrap">
                    <input id="proxyUrl" class="input grow" placeholder="http://127.0.0.1:7890" />
                  </div>
                </div>
                <div class="hint-active mono" id="proxyActive">–</div>
                <div class="hint" id="proxyHint"></div>
              </div>
            </div>

            <div class="settings-split">
              <div class="settings-card">
                <div class="settings-card-hd">
                  <div>
                    <div class="settings-card-title" data-i18n="logSettings">Request logs</div>
                    <div class="settings-card-sub" data-i18n="logHint">Metadata by default; bodies only when debugging</div>
                  </div>
                  <button class="btn" type="button" id="btnSaveLog" data-i18n="saveLog">Save</button>
                </div>
                <div class="settings-card-bd">
                  <div class="toggle-list">
                    <label class="toggle-row">
                      <input type="checkbox" id="logEnabled" />
                      <span>
                        <strong data-i18n="logEnabled">Enable logging</strong>
                        <em data-i18n="logEnabledSub">Write request rows to disk</em>
                      </span>
                    </label>
                    <label class="toggle-row">
                      <input type="checkbox" id="logBodies" />
                      <span>
                        <strong data-i18n="logBodies">Store bodies</strong>
                        <em data-i18n="logBodiesSub">Large; enable only for debug</em>
                      </span>
                    </label>
                    <label class="toggle-row">
                      <input type="checkbox" id="logBodiesOnError" />
                      <span>
                        <strong data-i18n="logBodiesOnError">Bodies on error</strong>
                        <em data-i18n="logBodiesOnErrorSub">Always keep response when request fails</em>
                      </span>
                    </label>
                    <div class="toggle-row static">
                      <span>
                        <strong data-i18n="logRetention">Retention (days)</strong>
                        <em data-i18n="logRetentionSub">Auto-delete older logs</em>
                      </span>
                      <input id="logRetention" class="input" type="number" min="1" max="365" style="width:88px" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="settings-card">
                <div class="settings-card-hd">
                  <div>
                    <div class="settings-card-title" data-i18n="userSettings">Registration</div>
                    <div class="settings-card-sub" data-i18n="userSettingsSub">Control public self-signup</div>
                  </div>
                  <button class="btn" type="button" id="btnSaveReg" data-i18n="save">Save</button>
                </div>
                <div class="settings-card-bd">
                  <div class="toggle-list">
                    <label class="toggle-row">
                      <input type="checkbox" id="allowRegister" />
                      <span>
                        <strong data-i18n="allowRegister">Allow registration</strong>
                        <em data-i18n="allowRegisterSub">Users can create accounts after admin setup</em>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <div id="toastHost" class="toast-host" aria-live="polite" aria-relevant="additions"></div>
  <div id="msgContrib" class="toast" hidden aria-hidden="true"></div>

  <div class="modal-mask" id="confirmModal">
    <div class="modal modal-confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMsg">
      <h3 id="confirmTitle" data-i18n="confirmTitle">Confirm</h3>
      <p id="confirmMsg"></p>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="confirmCancel" data-i18n="cancel">Cancel</button>
        <button class="btn" type="button" id="confirmOk" data-i18n="confirmOk">Confirm</button>
      </div>
    </div>
  </div>

  <div class="modal-mask" id="keyModal">
    <div class="modal" role="dialog">
      <h3 id="keyModalTitle" data-i18n="createKey">Create API Key</h3>
      <p id="keyModalSub" data-i18n="keyOnce">The full key is shown only once. Copy it now.</p>
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

  <div class="modal-mask" id="myMembersModal">
    <div class="modal" role="dialog">
      <h3 id="myMembersTitle" data-i18n="membersTitle">Allowed members</h3>
      <p id="myMembersSub" data-i18n="membersSub">Donor always has access. Search full username to add members.</p>
      <div class="member-vis" id="myMembersVisBar">
        <span class="field-label" data-i18n="colVisibility">Visibility</span>
        <div class="seg" id="myMembersVisSeg">
          <button type="button" data-mvis="public" data-i18n="visPublic">Public pool</button>
          <button type="button" data-mvis="restricted" data-i18n="visRestricted">Named members</button>
          <button type="button" data-mvis="private" data-i18n="visPrivate">Donor only</button>
        </div>
      </div>
      <div class="hint" id="myMembersVisHint" style="display:none;margin:0 0 10px"></div>
      <div class="member-add" id="myMembersAddBox">
        <div class="field-hd">
          <label class="field-label" data-i18n="memberAddLabel">Add member</label>
          <div class="member-add-actions">
            <span class="mono" id="myMembersAddMeta" style="font-size:12px;color:var(--mute)"></span>
            <button class="btn btn-secondary btn-sm" type="button" id="myMembersAddClear" data-i18n="memberAddClear">Clear pick</button>
            <button class="btn btn-sm" type="button" id="myMembersAddBtn" data-i18n="memberAddBtn">Add selected</button>
          </div>
        </div>
        <div class="msel msel-inline open" id="myMembersMsel">
          <div class="msel-panel msel-panel-inline" id="myMembersPanel">
            <div class="msel-search">
              <input id="myMembersAddQ" class="input block" type="search" autocomplete="off" data-i18n-placeholder="memberAddPh" placeholder="Search full username…" />
            </div>
            <div class="msel-list" id="myMembersSearchList" role="listbox" aria-multiselectable="true"></div>
            <div class="msel-empty" id="myMembersSearchEmpty" hidden></div>
          </div>
        </div>
      </div>
      <div class="member-list" id="myMembersBody"></div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="myMembersClose" data-i18n="close">Close</button>
      </div>
    </div>
  </div>

  <div class="modal-mask" id="accModal">
    <div class="modal modal-acc" role="dialog">
      <div class="modal-hd">
        <div>
          <h3 id="accModalTitle" data-i18n="accEditTitle">Edit account</h3>
          <p id="accModalSub" data-i18n="accEditSub">Visibility, donor and allowed users</p>
        </div>
      </div>
      <div class="modal-grid">
        <div class="field">
          <label data-i18n="colAccount">Account</label>
          <input id="accEditName" class="input block" />
        </div>
        <div class="field">
          <label data-i18n="colVisibility">Visibility</label>
          <select id="accEditPrivate" class="select block">
            <option value="public" data-i18n="visPublic">Public</option>
            <option value="private" data-i18n="visPrivate">Private</option>
          </select>
        </div>
        <div class="field field-span">
          <label data-i18n="accDonorLabel">Donor</label>
          <select id="accEditDonor" class="select block" data-searchable="1">
            <option value="" data-i18n="accDonorNone">No donor</option>
          </select>
        </div>
        <div class="field field-span">
          <div class="field-hd">
            <label data-i18n="accAllowedLabel">Allowed users</label>
            <button class="btn btn-secondary btn-sm" type="button" id="accEditAllowedClear" data-i18n="accAllowedClear">Clear all</button>
          </div>
          <div class="msel" id="accEditAllowed">
            <button type="button" class="msel-btn" id="accEditAllowedBtn" aria-haspopup="listbox" aria-expanded="false">
              <span class="msel-label" id="accEditAllowedMeta">–</span>
              <svg class="msel-caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="msel-panel" id="accEditAllowedPanel" hidden>
              <div class="msel-search">
                <input id="accEditAllowedQ" class="input block" type="search" autocomplete="off" data-i18n-placeholder="accAllowedSearch" placeholder="Search users…" />
              </div>
              <div class="msel-list" id="accEditAllowedList" role="listbox" aria-multiselectable="true"></div>
              <div class="msel-empty" id="accEditAllowedEmpty" hidden></div>
            </div>
          </div>
          <div class="hint" data-i18n="accAllowedHint">Searchable multi-select. Clear all removes restriction.</div>
        </div>
      </div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="accEditCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="accEditSubmit" data-i18n="save">Save</button>
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

  <div class="modal-mask" id="pwdModal">
    <div class="modal" role="dialog">
      <h3 data-i18n="resetPwdTitle">Reset password</h3>
      <p id="pwdUserHint" class="mono" style="margin-bottom:12px"></p>
      <div class="field">
        <label data-i18n="resetPwdLabel">New password</label>
        <input id="pwdInput" class="input" style="width:100%" type="password" autocomplete="new-password" />
      </div>
      <div class="field">
        <label data-i18n="resetPwdLabel2">Confirm password</label>
        <input id="pwdInput2" class="input" style="width:100%" type="password" autocomplete="new-password" />
      </div>
      <div class="hint" data-i18n="resetPwdHint">At least 6 characters</div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="pwdCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="pwdSubmit" data-i18n="resetPwdSave">Save password</button>
      </div>
    </div>
  </div>

  <div class="modal-mask" id="nameModal">
    <div class="modal" role="dialog">
      <h3 data-i18n="renameUserTitle">Rename user</h3>
      <p id="nameUserHint" class="mono" style="margin-bottom:12px"></p>
      <div class="field">
        <label data-i18n="renameUserLabel">Username</label>
        <input id="nameInput" class="input" style="width:100%" type="text" autocomplete="off" maxlength="32" />
      </div>
      <div class="hint" data-i18n="renameUserHint">2–32 chars · letters, numbers, _ . - or CJK</div>
      <div class="row">
        <button class="btn btn-secondary" type="button" id="nameCancel" data-i18n="close">Close</button>
        <button class="btn" type="button" id="nameSubmit" data-i18n="renameUserSave">Save</button>
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
        cancel:"取消", confirmOk:"确定", confirmTitle:"请确认",
        confirmDelete:"确定删除？",
        authUser:"用户名", authPass:"密码", authPass2:"确认密码", authSubmit:"继续",
        authSetupTitle:"初始化管理员", authSetupSub:"首次使用，请创建管理员账号。账号池与代理仅管理员可配置。",
        authLoginTitle:"登录", authLoginSub:"使用你的账号登录管理控制台。",
        authRegTitle:"注册", authRegSub:"创建普通用户账号，可管理自己的密钥、日志与用量。",
        authToReg:"没有账号？注册", authToLogin:"已有账号？登录",
        authPassMismatch:"两次密码不一致",
        navOps:"运营", navAnalyze:"分析", navOps2:"运维", navSystem:"系统",
        navOverview:"总览", navAccounts:"账号", navKeys:"密钥", navUsers:"用户", navUsage:"用量", navLogs:"日志", navSettings:"设置",
        subOverview:"池状态 · 流量 · 快捷入口", subAccounts:"OAuth 池 · 路由与额度", subKeys:"客户端鉴权密钥",
        subUsers:"注册用户与角色", subUsage:"Token / 次数 / 模型分布", subLogs:"完整请求排查（低频）", subSettings:"代理与日志策略",
        usersHint:"管理注册用户", colUser:"用户", colRole:"角色", colQuota:"额度",
        allowRegister:"允许注册", userSettings:"用户注册",
        roleAdmin:"管理员", roleUser:"用户",
        editQuota:"编辑 Token 额度", quotaLabel:"Token 额度（空=不限）", quotaUsedLabel:"已用 Token",
        quotaResetUsed:"将已用清零", saveQuota:"保存额度", quotaUnlimited:"不限",
        quotaFmt:(u,q)=>u+" / "+q, setQuota:"额度",
        resetPwd:"改密", resetPwdTitle:"重置密码", resetPwdLabel:"新密码", resetPwdLabel2:"确认密码",
        resetPwdHint:"至少 6 位", resetPwdSave:"保存密码", resetPwdOk:"密码已更新",
        resetPwdMismatch:"两次密码不一致",
        renameUser:"改名", renameUserTitle:"修改用户名", renameUserLabel:"用户名",
        renameUserHint:"2–32 位 · 字母数字 _ . - 或中文", renameUserSave:"保存",
        renameUserOk:"用户名已更新", renameUserEmpty:"请输入用户名",
        viewMore:"查看详情 →", viewAllLogs:"全部日志 →",
        qaAcc:"账号池与额度", qaKey:"创建与管理密钥", qaUsage:"趋势与分布", qaLogs:"请求排查",
        qaSettings:"端点与代理",
        ovKicker:"控制台",
        ovHello:"总览",
        ovHelloNamed:(n)=>"你好，"+n,
        ovHelloSub:"账号池健康度、近期流量与常用入口。",
        ovUsage:"用量趋势",
        ovUsageSub:(r)=>"最近 "+r,
        ovQuick:"快捷入口",
        ovRecent:"最近请求",
        ovReqChart:"请求与成功率",
        ovOk:"成功", ovFail:"失败",
        ovOkRate:(p)=>"成功率 "+p+"%",
        ovLat:(ms)=>"平均延迟 "+ms+"ms",
        ovRankLine:(r)=>r ? ("贡献榜 "+r) : "暂未上榜",
        adminExplain:"可选环境变量 <code>ADMIN_TOKEN</code> 可作为紧急管理员通道（Bearer）。日常请使用用户名密码登录。",
        adminExplainOpen:"请使用<strong>用户名密码</strong>登录。首次打开会引导创建管理员；账号池与代理仅管理员可配置。",
        endpointsTitle:"出站端点", endpointsSub:"LLM / OAuth / 额度 — 可填官方地址或跳板域名",
        upstreamTitle:"LLM 上游", saveUpstream:"保存上游", saveEndpoints:"保存端点",
        upstreamSaved:"端点已更新",
        upstreamHint:"留空 = api.x.ai/v1 · 跳板如 https://xai.ahao1.tech/v1",
        upstreamActive:(u)=>"生效 "+u,
        oauthBaseTitle:"OAuth 基址",
        oauthBaseHint:"留空 = auth.x.ai · 跳板如 https://xai.ahao1.tech",
        oauthBaseActive:(u)=>"生效 "+u,
        billingBaseTitle:"额度基址",
        billingBaseHint:"留空 = cli-chat-proxy.grok.com · 跳板如 https://xai.ahao1.tech",
        billingBaseActive:(u)=>"生效 "+u,
        proxyActive:(url)=>"生效 "+(url||"直连"),
        proxyHintSrc:(src)=>"来源："+src,
        proxySub:"仅影响 Node 出站（浏览器授权页不走这里）",
        logEnabledSub:"写入请求日志到磁盘", logBodiesSub:"体积大，仅调试时开启",
        logBodiesOnErrorSub:"HTTP/业务失败时仍保存响应体（默认开）",
        logRetentionSub:"自动清理更早日志",
        userSettingsSub:"控制是否开放公开注册",
        allowRegisterSub:"管理员创建后，用户可自助注册",
        proxyTitle:"出站代理", proxyAuto:"自动", proxyDirect:"直连", proxyCustom:"自定义",
        proxyHintAuto:(src,url)=>"当前生效："+(url||"直连")+"（来源："+src+"）",
        saveProxy:"保存", proxySaved:"代理已更新",
        logSettings:"请求日志", logEnabled:"启用日志", logBodies:"记录请求/响应体",
        logBodiesOnError:"失败时保留响应体", logRetention:"保留天数", saveLog:"保存日志设置",
        logHint:"默认只记元数据与 Token；失败时仍可保留响应体便于排查",
        logSaved:"日志设置已保存",
        usageTitle:"分析", kpiReq:"请求数", kpiTok:"总 Token", kpiOk:"成功率", kpiLat:"平均延迟",
        kpiTtft:"平均首字", kpiTps:"平均 TPS", kpiCacheHit:"缓存命中率",
        cacheHitLabel:(p)=>"缓存命中 "+p+"%",
        cacheHitNone:"缓存命中 –",
        cacheHitTip:(c,p)=>"缓存输入 "+c+" / 总输入 "+p,
        ttftLegacyHint:"旧日志未记录首字延迟",
        ttftLegacyShort:"未记录",
        tpsNoTtftHint:"旧日志无 TTFT，不计入看板 TPS",
        tpsLegacyHint:"按整段耗时估算（未扣首字）",
        tpsTinyGenHint:"生成时长过短（≈首字即结束），TPS 不可靠",
        ttftSampleHint:(n,t)=>"基于 "+n+"/"+t+" 条有 TTFT 的请求",
        ttftNoSampleHint:"窗口内暂无带 TTFT 的请求",
        tpsSampleHint:(n,t)=>"仅统计有 TTFT 且生成≥50ms 的 "+n+"/"+t+" 条 · 已排除首字时间",
        tpsNoSampleHint:"窗口内暂无可用 TPS 样本（需 TTFT 且生成时长足够）",
        kpiIn:"输入(未缓存)", kpiOut:"输出 Token", kpiCache:"缓存输入", kpiReason:"推理 Token", kpiImg:"图片 Token",
        chartDay:"Token 趋势", chartTokMix:"Token 构成", chartModel:"模型分布", chartAccount:"按账号", chartKey:"按密钥（总 Token）",
        usageRange:"时间范围", usageGran:"时间粒度",
        granAuto:"自动", granMinute:"1m", gran5m:"5m", granHour:"1h", granDay:"1d",
        granMinuteLong:"分钟", gran5mLong:"5 分钟", granHourLong:"小时", granDayLong:"天",
        usageRangeHint:(r,g,n)=>"最近 "+r+" · 按"+g+" · "+n+" 个桶",
        chartKeyInOut:"按密钥 · 输入/输出",
        chartReq:"请求数", chartTok:"总 Token", chartIn:"输入(未缓存)", chartOut:"输出", chartCache:"缓存输入", chartReason:"推理",
        unrouted:"未路由(失败)", noKeyLabel:"无 Key", noModel:"无模型",
        clearLogs:"清理日志", clearLogsConfirm:"确定清理全部请求日志？", logsCleared:"日志已清理",
        stripLogs:"精简正文", stripLogsConfirm:"将从历史日志中删除请求/响应正文（保留元数据与 Token），是否继续？",
        logsStripped:(n,b)=>"已精简 "+n+" 条 · 释放约 "+b,
        logDetail:"请求详情", allDays:"全部日期", noLogs:"暂无请求日志",
        colTime:"时间", colClient:"客户端", colModel:"模型", colTokens:"Token", colLatency:"延迟", colTtft:"首字", colTps:"TPS",
        routing:"路由", modeAuto:"自动", modeManual:"手动",
        accNamePh:"账号备注（可选）", addAccount:"添加账号",
        accSyncName:"同步名称",
        accSyncNameOk:"已按邮箱/用户名更新名称",
        accDonorNone:"无贡献者", accDonorLabel:"贡献者",
        accAllowedLabel:"额外可用成员", accAllowedHint:"贡献者始终可用且不可取消；此处只配置额外成员。清空额外成员=仅贡献者（若为私有）或公共池规则",
        accAllowedClear:"清除额外成员", accAllowedNone:"暂无用户",
        accAllowedSearch:"搜索完整用户名或 ID…", accAllowedEmptySearch:"无匹配用户",
        userSearchPh:"输入完整用户名搜索…", userSearchEmpty:"无匹配用户",
        accAllowedPicked:(n)=>n ? ("额外 "+n+" 人") : "无额外成员（贡献者始终可用）",
        accAllowedPickedNames:(n,s)=>"额外 "+n+" 人："+s,
        accAllowedDonorLocked:"贡献者（始终可用）",
        accEdit:"编辑", accEditTitle:"编辑账号", accEditSub:"修改可见性、贡献者与限定用户",
        accSaved:"账号已更新",
        deviceHint:"在浏览器打开验证页，输入以下 Device Code：",
        verifyUrl:"验证地址", waiting:"等待授权…",
        colAccount:"账号", colStatus:"状态", colCredits:"额度", colUses:"调用", colLastUsed:"上次使用", colActions:"操作",
        colDonor:"贡献者", colAllowed:"可用成员", colMembers:"可用成员", colPublic:"公开", colPrivate:"私有",
        visPublic:"公开池", visPrivate:"仅贡献者", visRestricted:"指定成员",
        memberDonor:"贡献者（不可取消）", memberExtra:"额外成员",
        membersTitle:"可用成员", membersSub:"三态：公开池 / 指定成员 / 仅自己。你始终可用；可按完整用户名添加成员。",
        membersNone:"仅贡献者本人", membersCount:(n)=>n+" 人可用",
        memberRevoke:"收回", memberRevokeOk:"已收回该用户权限",
        memberRevokeConfirm:(n)=>"确定收回「"+n+"」的使用权限？",
        memberDisabled:"已禁用/不可用",
        memberAddLabel:"添加成员", memberAddPh:"输入完整用户名…", memberAddBtn:"添加所选",
        memberAddHint:"须输入完整用户名（不支持前缀模糊）", memberAddOk:"已添加成员",
        memberAddEmpty:"请先搜索并勾选用户", memberAlready:"该用户已在名单中",
        memberAddClear:"清空勾选", memberAddNeedQ:"请输入完整用户名后搜索",
        memberAddNoHit:"未找到该用户（需完整用户名）", memberAddPicked:(n)=>n ? ("已选 "+n+" 人") : "未选择",
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
        statAccounts:"账号", statActive:"可用", statReqs:"请求", statKeys:"密钥",
        pageOf:(c,t,n)=>"第 "+c+" / "+t+" 页 · 共 "+n+" 条", prev:"上一页", next:"下一页",
        goPage:"跳转", pageJumpPh:"页",
        diskInfo:(d,b)=>d+" 天 · "+b,
        navCommunity:"社区", navContribute:"贡献", navLeaderboard:"排行",
        subContribute:"绑定 SuperGrok · 加入共享容量", subLeaderboard:"社区贡献排行",
        qaContrib:"绑定席位进池", qaLb:"社区贡献排行",
        contribKicker:"社区容量", contribTitle:"分享你的 SuperGrok 席位",
        contribSub:"绑定你拥有的 xAI 账号。剩余额度会进入共享池——大家更稳，你也能登上贡献榜。",
        contribCta:"贡献一个账号",
        contribSeeLb:"查看贡献榜",
        oauthOpenBrowser:"打开授权页", oauthRetry:"重新发起", oauthReauth:"重新授权",
        oauthPhaseWaiting:"等待授权", oauthPhaseFailed:"授权失败",
        why1t:"仅你可见", why1d:"你绑定的账号状态、额度与调用记录只对你开放，其他用户看不到列表。",
        why2t:"点亮账号池", why2d:"闲置的 SuperGrok 额度变成共享容量。额度感知路由会自动挑选健康席位。",
        why3t:"冲榜荣誉", why3d:"每次成功绑定都会计入排名。管理员不参与榜单，纯粹的社区排行。",
        contribHow:"如何贡献", step1t:"发起 OAuth", step1d:"走 xAI 设备码流程，我们不保存你的密码。",
        step2t:"浏览器授权", step2d:"在 accounts.x.ai 输入代码，授权 SuperGrok 访问。",
        step3t:"进入池子", step3d:"列表实时显示状态，成功后席位参与路由。",
        mineTitle:"我的贡献", mineHint:"仅自己可见",
        statMine:"我的席位", statExhausted:"已耗尽", statMyRank:"我的排名",
        noContrib:"还没有贡献。点上方按钮绑定第一个账号。",
        contribOk:"贡献成功", contribRankUnranked:"未上榜",
        withdrawContrib:"撤回",
        withdrawContribConfirm:(n)=>"确定撤回贡献「"+n+"」？将从共享池移除该账号。",
        withdrawContribOk:"已撤回贡献",
        routeTitle:"API 路由", routeHint:"对你的 API 密钥生效", saveRoute:"保存路由",
        routeScopeLabel:"路由模式", routeAccountLabel:"指定席位",
        routeAuto:"自动", routePublic:"公共号池", routeMine:"仅自己号池", routeAccount:"指定账号",
        routeAutoHint:"使用你有权访问的全部席位：公共池 + 指定给你的 + 自己贡献的。",
        routePublicHint:"仅使用公开席位（管理员账号 + 公开贡献）。私有号不会进入公共轮询。",
        routeMineHint:"只使用你贡献的账号。没有可用席位时请求会失败。",
        routeAccountHint:"固定走下方选中的账号（须有权使用）。",
        routeSaved:"路由偏好已保存",
        colVisibility:"可见性", colOwner:"所属用户",
        setPrivate:"仅自己", setPublic:"公开池",
        privateOk:"已设为仅自己可用（已清空额外成员）",
        publicOk:"已设为完全公开池（已清空额外成员）",
        restrictedOk:"已设为指定成员模式（名单保留）",
        membersSubPublic:"完全公开：进入公共轮询，所有人可用。",
        membersSubPrivate:"仅自己：只有你能用该席位。",
        membersSubRestricted:"指定成员：仅名单内用户可用（你始终可用）。可添加或收回成员。",
        membersClearForPublic:"将清空所有额外可用成员，并设为完全公开池。确定？",
        membersClearForPrivate:"将清空所有额外可用成员，并设为仅自己可用。确定？",
        membersNeedExtras:"指定成员需要至少一名额外用户。请先在下方用完整用户名添加成员。",
        usePrivateBlocked:"仅贡献者/指定成员账号不能设为公共池当前账号",
        usePendingBlocked:"账号尚未完成 OAuth 授权，不能使用",
        useNotActiveBlocked:"账号未处于可用状态，不能设为当前账号",
        visHintPublic:"进入公共轮询池",
        visHintPrivate:"仅贡献者本人可用",
        visHintRestricted:"仅名单内成员可用（含贡献者）",
        filterSearch:"搜索…", filterAllStatus:"全部状态", filterAllRole:"全部角色", filterAllVis:"全部可见性",
        editKey:"编辑", editKeyTitle:"编辑密钥", editKeySub:"修改别名、有效期或备注。不会重新生成密钥。",
        keyUpdated:"密钥已更新", save:"保存", never:"永不过期",
        lbKicker:"公开排行", lbTitle:"贡献者排行榜",
        lbSub:"两个榜：总贡献（公开+私有）与公开贡献。管理员已排除。",
        lbCta:"立即贡献", lbYourRank:"你的排名", lbBoost:"提升排名",
        lbTable:"完整榜单", lbEmpty:"还没有贡献者。成为第一名？",
        lbSeats:(n)=>n+" 个席位",
        lbSummary:(c,d,p,v)=>c+" 位贡献者 · 共 "+d+" 席（公开 "+p+" / 私有 "+v+"）",
        lbUnranked:"尚未上榜 — 贡献一个账号即可入榜",
        lbTotalTitle:"总贡献榜", lbTotalHint:"公开 + 私有",
        lbPublicTitle:"公开贡献榜", lbPublicHint:"仅共享池",
        lbTableTotal:"总贡献排名", lbTablePublic:"公开贡献排名",
        colRank:"名次", colSeats:"席位", colActive:"可用",
        copyCode:"复制代码",
      },
      en: {
        title:"Account Pool", subtitle:"SuperGrok OAuth pool · credit-aware routing · OpenAI-compatible proxy.",
        refresh:"Refresh", logout:"Logout",
        cancel:"Cancel", confirmOk:"Confirm", confirmTitle:"Confirm",
        confirmDelete:"Delete this item?",
        authUser:"Username", authPass:"Password", authPass2:"Confirm password", authSubmit:"Continue",
        authSetupTitle:"Create admin", authSetupSub:"First run: create the admin account. Account pool & proxy are admin-only.",
        authLoginTitle:"Sign in", authLoginSub:"Sign in to the control panel.",
        authRegTitle:"Register", authRegSub:"Create a user account to manage your own API keys, logs and usage.",
        authToReg:"No account? Register", authToLogin:"Have an account? Sign in",
        authPassMismatch:"Passwords do not match",
        navOps:"Operate", navAnalyze:"Analyze", navOps2:"Ops", navSystem:"System",
        navOverview:"Overview", navAccounts:"Accounts", navKeys:"API Keys", navUsers:"Users", navUsage:"Usage", navLogs:"Logs", navSettings:"Settings",
        subOverview:"Pool health · traffic · shortcuts", subAccounts:"OAuth pool · routing & credits", subKeys:"Client auth keys",
        subUsers:"Registered users & roles", subUsage:"Tokens / calls / models", subLogs:"Full request debug (rare)", subSettings:"Proxy & log policy",
        usersHint:"Manage registered users", colUser:"User", colRole:"Role", colQuota:"Quota",
        allowRegister:"Allow registration", userSettings:"Registration",
        roleAdmin:"Admin", roleUser:"User",
        editQuota:"Edit token quota", quotaLabel:"Token quota (empty = unlimited)", quotaUsedLabel:"Tokens used",
        quotaResetUsed:"Reset used to 0", saveQuota:"Save quota", quotaUnlimited:"Unlimited",
        quotaFmt:(u,q)=>u+" / "+q, setQuota:"Quota",
        resetPwd:"Password", resetPwdTitle:"Reset password", resetPwdLabel:"New password", resetPwdLabel2:"Confirm",
        resetPwdHint:"At least 6 characters", resetPwdSave:"Save password", resetPwdOk:"Password updated",
        resetPwdMismatch:"Passwords do not match",
        renameUser:"Rename", renameUserTitle:"Rename user", renameUserLabel:"Username",
        renameUserHint:"2–32 chars · letters, numbers, _ . - or CJK", renameUserSave:"Save",
        renameUserOk:"Username updated", renameUserEmpty:"Enter a username",
        viewMore:"Details →", viewAllLogs:"All logs →",
        qaAcc:"Pool & credits", qaKey:"Create and manage keys", qaUsage:"Trends & mix", qaLogs:"Request debug",
        qaSettings:"Endpoints & proxy",
        ovKicker:"Console",
        ovHello:"Overview",
        ovHelloNamed:(n)=>"Hi, "+n,
        ovHelloSub:"Pool health, recent traffic, and shortcuts.",
        ovUsage:"Usage trend",
        ovUsageSub:(r)=>"Last "+r,
        ovQuick:"Shortcuts",
        ovRecent:"Recent requests",
        ovReqChart:"Requests & success",
        ovOk:"OK", ovFail:"Fail",
        ovOkRate:(p)=>p+"% success",
        ovLat:(ms)=>"avg "+ms+"ms",
        ovRankLine:(r)=>r ? ("Rank "+r) : "Unranked",
        adminExplain:"Optional env <code>ADMIN_TOKEN</code> is an emergency admin Bearer. Prefer username/password login.",
        adminExplainOpen:"Sign in with username/password. First visit creates the admin. Account pool & proxy are admin-only.",
        endpointsTitle:"Outbound endpoints", endpointsSub:"LLM / OAuth / Billing — official hosts or a jump proxy",
        upstreamTitle:"LLM upstream", saveUpstream:"Save upstream", saveEndpoints:"Save endpoints",
        upstreamSaved:"Endpoints updated",
        upstreamHint:"Empty = api.x.ai/v1 · jump e.g. https://xai.ahao1.tech/v1",
        upstreamActive:(u)=>"Active "+u,
        oauthBaseTitle:"OAuth base",
        oauthBaseHint:"Empty = auth.x.ai · jump e.g. https://xai.ahao1.tech",
        oauthBaseActive:(u)=>"Active "+u,
        billingBaseTitle:"Billing base",
        billingBaseHint:"Empty = cli-chat-proxy.grok.com · jump e.g. https://xai.ahao1.tech",
        billingBaseActive:(u)=>"Active "+u,
        proxyActive:(url)=>"Active "+(url||"direct"),
        proxyHintSrc:(src)=>"Source: "+src,
        proxySub:"Node outbound only (browser authorize page is separate)",
        logEnabledSub:"Write request rows to disk", logBodiesSub:"Large; debug only",
        logBodiesOnErrorSub:"Always keep response body on HTTP/business failure (default on)",
        logRetentionSub:"Auto-delete older logs",
        userSettingsSub:"Control public self-signup",
        allowRegisterSub:"After admin setup, users may self-register",
        proxyTitle:"Outbound proxy", proxyAuto:"Auto", proxyDirect:"Direct", proxyCustom:"Custom",
        proxyHintAuto:(src,url)=>"Active: "+(url||"direct")+" (source: "+src+")",
        saveProxy:"Save", proxySaved:"Proxy updated",
        logSettings:"Request logs", logEnabled:"Enable logging", logBodies:"Store request/response bodies",
        logBodiesOnError:"Keep bodies on error", logRetention:"Retention (days)", saveLog:"Save log settings",
        logHint:"Metadata + tokens by default; failed responses can still be kept",
        logSaved:"Log settings saved",
        usageTitle:"Analytics", kpiReq:"Requests", kpiTok:"Total tokens", kpiOk:"Success rate", kpiLat:"Avg latency",
        kpiTtft:"Avg TTFT", kpiTps:"Avg TPS", kpiCacheHit:"Cache hit",
        cacheHitLabel:(p)=>"Cache hit "+p+"%",
        cacheHitNone:"Cache hit –",
        cacheHitTip:(c,p)=>"Cached "+c+" / input "+p,
        ttftLegacyHint:"Legacy log — TTFT not recorded",
        ttftLegacyShort:"n/a",
        tpsNoTtftHint:"No TTFT — excluded from board TPS",
        tpsLegacyHint:"Estimated with full latency (TTFT not subtracted)",
        tpsTinyGenHint:"Generation window too short (≈TTFT only) — TPS unreliable",
        ttftSampleHint:(n,t)=>"From "+n+"/"+t+" requests with TTFT",
        ttftNoSampleHint:"No TTFT samples in this window",
        tpsSampleHint:(n,t)=>"From "+n+"/"+t+" requests with TTFT & gen≥50ms · TTFT excluded",
        tpsNoSampleHint:"No usable TPS samples (need TTFT and enough generation time)",
        kpiIn:"Input (uncached)", kpiOut:"Output tokens", kpiCache:"Cached input", kpiReason:"Reasoning", kpiImg:"Image tokens",
        chartDay:"Tokens over time", chartTokMix:"Token mix", chartModel:"Model distribution", chartAccount:"By account", chartKey:"By API key (total)",
        usageRange:"Range", usageGran:"Bucket",
        granAuto:"Auto", granMinute:"1m", gran5m:"5m", granHour:"1h", granDay:"1d",
        granMinuteLong:"minute", gran5mLong:"5 min", granHourLong:"hour", granDayLong:"day",
        usageRangeHint:(r,g,n)=>"Last "+r+" · by "+g+" · "+n+" buckets",
        chartKeyInOut:"By key · in / out",
        chartReq:"Requests", chartTok:"Total", chartIn:"Input (uncached)", chartOut:"Output", chartCache:"Cached input", chartReason:"Reasoning",
        unrouted:"Unrouted (failed)", noKeyLabel:"No key", noModel:"No model",
        clearLogs:"Clear logs", clearLogsConfirm:"Clear ALL request logs?", logsCleared:"Logs cleared",
        stripLogs:"Strip bodies", stripLogsConfirm:"Remove request/response bodies from historical logs (keep metadata + tokens). Continue?",
        logsStripped:(n,b)=>"Stripped "+n+" rows · saved ~"+b,
        logDetail:"Request detail", allDays:"All days", noLogs:"No request logs yet",
        colTime:"Time", colClient:"Client", colModel:"Model", colTokens:"Tokens", colLatency:"Latency", colTtft:"TTFT", colTps:"TPS",
        routing:"Routing", modeAuto:"Auto", modeManual:"Manual",
        accNamePh:"Account note (optional)", addAccount:"Add account",
        accSyncName:"Sync name",
        accSyncNameOk:"Name updated from email/username",
        accDonorNone:"No donor", accDonorLabel:"Donor",
        accAllowedLabel:"Extra members", accAllowedHint:"Donor always has access and cannot be removed. Clear extras only.",
        accAllowedClear:"Clear extras", accAllowedNone:"No users",
        accAllowedSearch:"Search full username or ID…", accAllowedEmptySearch:"No matches",
        userSearchPh:"Type full username…", userSearchEmpty:"No matches",
        accAllowedPicked:(n)=>n ? (n+" extra") : "No extras (donor always allowed)",
        accAllowedPickedNames:(n,s)=>n+" extra: "+s,
        accAllowedDonorLocked:"Donor (always allowed)",
        accEdit:"Edit", accEditTitle:"Edit account", accEditSub:"Visibility, donor and allowed users",
        accSaved:"Account updated",
        deviceHint:"Enter this Device Code on the verification page:",
        verifyUrl:"URL", waiting:"Waiting for auth…",
        colAccount:"Account", colStatus:"Status", colCredits:"Credits", colUses:"Uses", colLastUsed:"Last used", colActions:"Actions",
        colDonor:"Donor", colAllowed:"Members", colMembers:"Members", colPublic:"Public", colPrivate:"Private",
        visPublic:"Public pool", visPrivate:"Donor only", visRestricted:"Named members",
        memberDonor:"Donor (always)", memberExtra:"Extra member",
        membersTitle:"Allowed members", membersSub:"Three modes: public / named members / donor-only. You always have access; add by full username.",
        membersNone:"Donor only", membersCount:(n)=>n+" members",
        memberRevoke:"Revoke", memberRevokeOk:"Access revoked",
        memberRevokeConfirm:(n)=>"Revoke access for ["+n+"]?",
        memberDisabled:"Disabled / unavailable",
        memberAddLabel:"Add member", memberAddPh:"Full username…", memberAddBtn:"Add selected",
        memberAddHint:"Exact full username only (no prefix match)", memberAddOk:"Member added",
        memberAddEmpty:"Search and select users first", memberAlready:"Already on the list",
        memberAddClear:"Clear pick", memberAddNeedQ:"Enter the full username",
        memberAddNoHit:"User not found (full username required)", memberAddPicked:(n)=>n ? (n+" selected") : "None selected",
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
        statAccounts:"Accounts", statActive:"Active", statReqs:"Requests", statKeys:"API Keys",
        pageOf:(c,t,n)=>"Page "+c+" / "+t+" · "+n+" total", prev:"Prev", next:"Next",
        goPage:"Go", pageJumpPh:"page",
        diskInfo:(d,b)=>d+" days · "+b,
        navCommunity:"Community", navContribute:"Share", navLeaderboard:"Ranks",
        subContribute:"Link SuperGrok · grow shared capacity", subLeaderboard:"Community contribution ranking",
        qaContrib:"Link seats to the pool", qaLb:"Community ranking",
        contribKicker:"Community capacity", contribTitle:"Share your SuperGrok seat",
        contribSub:"Link an xAI account you own. Remaining credits join the shared pool — everyone gets more reliable access, and you climb the board.",
        contribCta:"Contribute an account",
        contribSeeLb:"View leaderboard",
        oauthOpenBrowser:"Open authorize URL", oauthRetry:"Retry OAuth", oauthReauth:"Re-authorize",
        oauthPhaseWaiting:"Waiting for auth", oauthPhaseFailed:"Failed",
        why1t:"Private to you", why1d:"Only you can see the accounts you linked — status, credits, and usage. Others never see your list.",
        why2t:"Power the pool", why2d:"Idle SuperGrok credits become shared capacity. Credit-aware routing picks healthy seats automatically.",
        why3t:"Climb the board", why3d:"Every successful link counts toward your rank. Admins are excluded — pure community scoreboard.",
        contribHow:"How it works", step1t:"Start OAuth", step1d:"We open an xAI device-code flow. No password is stored by us.",
        step2t:"Approve in browser", step2d:"Enter the code on accounts.x.ai and authorize SuperGrok access.",
        step3t:"Join the pool", step3d:"List shows live status. Seat becomes routable when active.",
        mineTitle:"My contributions", mineHint:"Visible only to you",
        statMine:"My seats", statExhausted:"Exhausted", statMyRank:"My rank",
        noContrib:"No contributions yet. Click above to link your first account.",
        contribOk:"Contribution added", contribRankUnranked:"Unranked",
        withdrawContrib:"Withdraw",
        withdrawContribConfirm:(n)=>"Withdraw contribution ["+n+"]? It will be removed from the shared pool.",
        withdrawContribOk:"Contribution withdrawn",
        routeTitle:"API routing", routeHint:"Applies to your API keys", saveRoute:"Save routing",
        routeScopeLabel:"Route mode", routeAccountLabel:"Pinned seat",
        routeAuto:"Auto", routePublic:"Public pool", routeMine:"My seats only", routeAccount:"Pin account",
        routeAutoHint:"Use every seat you can access: public, allowlisted, and your own donations.",
        routePublicHint:"Public seats only (admin + public contributions). Private seats never join public RR.",
        routeMineHint:"Only accounts you contributed. Requests fail if none are available.",
        routeAccountHint:"Always use the selected account (must be allowed for you).",
        routeSaved:"Routing preference saved",
        colVisibility:"Visibility", colOwner:"Owner",
        setPrivate:"Donor only", setPublic:"Public pool",
        privateOk:"Donor only (extras cleared)",
        publicOk:"Fully public pool (allowlist cleared)",
        restrictedOk:"Named-member mode (list kept)",
        membersSubPublic:"Public: joins shared pool for everyone.",
        membersSubPrivate:"Donor only: only you can use this seat.",
        membersSubRestricted:"Named members: only listed users (you always). Add or revoke members here.",
        membersClearForPublic:"Clear all extra members and make this seat fully public?",
        membersClearForPrivate:"Clear all extra members and set donor-only?",
        membersNeedExtras:"Named-member mode needs at least one extra user. Add a member by full username below first.",
        usePrivateBlocked:"Donor-only / named-member seats cannot be the public-pool current seat",
        usePendingBlocked:"OAuth not finished — cannot use this seat",
        useNotActiveBlocked:"Seat is not active — cannot set as current",
        visHintPublic:"Joins public round-robin",
        visHintPrivate:"Only the donor can use it",
        visHintRestricted:"Only listed members (incl. donor)",
        filterSearch:"Search…", filterAllStatus:"All status", filterAllRole:"All roles", filterAllVis:"All visibility",
        editKey:"Edit", editKeyTitle:"Edit API key", editKeySub:"Update alias, validity, or note. The secret is not rotated.",
        keyUpdated:"API key updated", save:"Save", never:"never",
        lbKicker:"Public ranking", lbTitle:"Contributor leaderboard",
        lbSub:"Two boards: total seats (public + private) and public-only seats. Admins are excluded.",
        lbCta:"Contribute now", lbYourRank:"Your rank", lbBoost:"Boost rank",
        lbTable:"Full ranking", lbEmpty:"No contributors yet. Be the first?",
        lbSeats:(n)=>n+" seats",
        lbSummary:(c,d,p,v)=>c+" contributors · "+d+" seats (public "+p+" / private "+v+")",
        lbUnranked:"Not ranked yet — contribute one account to join",
        lbTotalTitle:"Total board", lbTotalHint:"Public + private",
        lbPublicTitle:"Public board", lbPublicHint:"Shared pool only",
        lbTableTotal:"Total ranking", lbTablePublic:"Public ranking",
        colRank:"Rank", colSeats:"Seats", colActive:"Active",
        copyCode:"Copy code",
      }
    };

    let lang = localStorage.getItem("grok_api_lang") || (navigator.language.startsWith("zh") ? "zh" : "en");
    let view = PAGE;
    let sessionToken = localStorage.getItem("grok_api_session") || "";
    let currentUser = null; // { id, username, role }
        let routing = { mode: "auto", currentAccountId: null };
    let meta = { needsSetup: false, allowRegister: true, proxy: null, proxySource: "none", proxyConfigured: "", logRetentionDays: 7, logEnabled: true, logBodies: false, logBodiesOnError: true, allowRegisterSetting: true, xaiBaseUrl: "https://api.x.ai/v1", upstreamBaseUrlConfigured: "" };
    let pollTimer = null;
    let allUsers = [];
    let accountUsers = [];
    let curlEp = "chat";
    let proxyMode = "auto";
    let allAccounts = [];
    let myAccounts = [];
    let allKeys = [];
    let accPage = 1;
    let accEditId = null;
    let contribPage = 1;
    let contribPollTimer = null;
    let contribListWatchTimer = null;
    let leaderboardData = null;
    let keyPage = 1;
    let logPage = 1;
    let logTotal = 0;
    let logDays = [];
    let lastLogItems = [];
    let usageRange = "24h"; // 1h | 6h | 24h | 7d | 30d
    let usageGran = "auto"; // auto | minute | 5m | hour | day
    let charts = { day: null, model: null, account: null, key: null, overview: null, ovModel: null, ovReq: null, tokMix: null, keyInOut: null };
    let lastStats = null;

    const $ = (id) => document.getElementById(id);
    const t = (k, ...args) => {
      const v = I18N[lang][k];
      return typeof v === "function" ? v(...args) : (v ?? k);
    };

    function closeTopMenus() {
      document.querySelectorAll(".tb-menu.open").forEach((m) => m.classList.remove("open"));
      document.querySelectorAll(".tb-pop").forEach((p) => { p.hidden = true; });
      if ($("btnLang")) $("btnLang").setAttribute("aria-expanded", "false");
      if ($("userChip")) $("userChip").setAttribute("aria-expanded", "false");
    }
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
          if (name === "overview") {
            paintOverviewChrome();
            paintOverviewChart(lastStats);
          }
        } else if (name === "overview") {
          paintOverviewChrome();
        }
      }
      if (name === "users" && isAdmin()) loadUsers();
      if (name === "contribute" || name === "overview") {
        loadMyAccounts();
        if (name === "contribute") loadMyRouting();
        loadLeaderboardLite();
      }
      if (name === "leaderboard") loadLeaderboard();
    }

    function applyRoleNav() {
      const admin = isAdmin();
      document.querySelectorAll("[data-admin-only]").forEach((el) => {
        el.classList.toggle("hide", !admin);
      });
      const qa = $("quickActions");
      if (qa) qa.classList.toggle("user-only", !admin);
      document.querySelectorAll(".dt-logs").forEach((el) => el.classList.toggle("no-account", !admin));
      if (currentUser) {
        if ($("userMenu")) $("userMenu").style.display = "inline-flex";
        const roleTxt = currentUser.role === "admin" ? t("roleAdmin") : t("roleUser");
        const ch = (String(currentUser.username || "?").trim().charAt(0) || "?").toUpperCase();
        if ($("userName")) $("userName").textContent = currentUser.username;
        if ($("userRole")) $("userRole").textContent = roleTxt;
        if ($("userAvatar")) $("userAvatar").textContent = ch;
        if ($("userNameMenu")) $("userNameMenu").textContent = currentUser.username;
        if ($("userRoleMenu")) $("userRoleMenu").textContent = roleTxt;
        if ($("userAvatarMenu")) $("userAvatarMenu").textContent = ch;
        if ($("userChip")) $("userChip").title = currentUser.username + " · " + roleTxt;
      } else {
        if ($("userMenu")) $("userMenu").style.display = "none";
        closeTopMenus();
      }
      paintOverviewChrome();
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
      document.querySelectorAll("[data-check]").forEach((el) => {
        el.textContent = el.getAttribute("data-check") === lang ? "✓" : "";
      });
      document.querySelectorAll("#langPop [data-lang]").forEach((b) => {
        b.classList.toggle("on", b.dataset.lang === lang);
      });
      paintAdminExplain();
      paintProxyUI();
      paintCurl();
      paintMode();
      paintLogDaySelect();
      applyRoleNav();
      setView(view);
      enhanceAllSelects();
      document.querySelectorAll(".cselect").forEach((w) => { if (w._cselectRefresh) w._cselectRefresh(); });
      renderAccounts();
      renderKeys();
      renderMyAccounts();
      if (leaderboardData) {
        paintLeaderboard(leaderboardData);
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
      if ($("proxyActive")) $("proxyActive").textContent = t("proxyActive", meta.proxy || "");
      if ($("proxyHint")) $("proxyHint").textContent = t("proxyHintSrc", src);
      if ($("logEnabled")) $("logEnabled").checked = meta.logEnabled !== false;
      if ($("logBodies")) $("logBodies").checked = meta.logBodies === true;
      if ($("logBodiesOnError")) $("logBodiesOnError").checked = meta.logBodiesOnError !== false;
      if ($("logRetention") && !$("logRetention").matches(":focus")) $("logRetention").value = meta.logRetentionDays || 7;
      if ($("allowRegister")) $("allowRegister").checked = meta.allowRegisterSetting !== false;
      if ($("upstreamUrl") && !$("upstreamUrl").matches(":focus")) {
        $("upstreamUrl").value = meta.upstreamBaseUrlConfigured || "";
      }
      if ($("oauthBaseUrl") && !$("oauthBaseUrl").matches(":focus")) {
        $("oauthBaseUrl").value = meta.oauthBaseUrlConfigured || "";
      }
      if ($("billingBaseUrl") && !$("billingBaseUrl").matches(":focus")) {
        $("billingBaseUrl").value = meta.billingBaseUrlConfigured || "";
      }
      if ($("upstreamActive")) {
        $("upstreamActive").textContent = t("upstreamActive", meta.xaiBaseUrl || "https://api.x.ai/v1");
      }
      if ($("upstreamHint")) $("upstreamHint").textContent = t("upstreamHint");
      if ($("oauthBaseActive")) {
        $("oauthBaseActive").textContent = t("oauthBaseActive", meta.oauthBaseUrl || "https://auth.x.ai");
      }
      if ($("oauthBaseHint")) $("oauthBaseHint").textContent = t("oauthBaseHint");
      if ($("billingBaseActive")) {
        $("billingBaseActive").textContent = t(
          "billingBaseActive",
          meta.billingBaseUrl || "https://cli-chat-proxy.grok.com",
        );
      }
      if ($("billingBaseHint")) $("billingBaseHint").textContent = t("billingBaseHint");
    }

    function headers() {
      return sessionToken ? { Authorization: "Bearer " + sessionToken } : {};
    }
    function jsonHeaders() { return { "Content-Type": "application/json", ...headers() }; }
    let _confirmResolver = null;
    function closeConfirm(result) {
      const mask = $("confirmModal");
      if (mask) mask.classList.remove("show");
      const okBtn = $("confirmOk");
      if (okBtn) {
        okBtn.classList.remove("btn-danger");
        okBtn.textContent = t("confirmOk");
      }
      const r = _confirmResolver;
      _confirmResolver = null;
      if (r) r(!!result);
    }
    /**
     * Custom confirm dialog (replaces window.confirm).
     * @param {string} message
     * @param {{ title?: string, okText?: string, cancelText?: string, danger?: boolean }} [opts]
     * @returns {Promise<boolean>}
     */
    function confirmDialog(message, opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        // close any prior pending confirm as cancel
        if (_confirmResolver) {
          const prev = _confirmResolver;
          _confirmResolver = null;
          prev(false);
        }
        _confirmResolver = resolve;
        const title = opts.title != null ? opts.title : t("confirmTitle");
        const okText = opts.okText != null ? opts.okText : t("confirmOk");
        const cancelText = opts.cancelText != null ? opts.cancelText : t("cancel");
        if ($("confirmTitle")) $("confirmTitle").textContent = title;
        if ($("confirmMsg")) $("confirmMsg").textContent = message || "";
        if ($("confirmOk")) {
          $("confirmOk").textContent = okText;
          $("confirmOk").classList.toggle("btn-danger", !!opts.danger);
        }
        if ($("confirmCancel")) $("confirmCancel").textContent = cancelText;
        if ($("confirmModal")) $("confirmModal").classList.add("show");
        setTimeout(() => {
          try {
            const focusEl = $("confirmOk") || $("confirmCancel");
            if (focusEl) focusEl.focus();
          } catch {}
        }, 30);
      });
    }

    function toast(text, type) {
      const host = $("toastHost");
      if (!host || text == null || text === "") return;
      const el = document.createElement("div");
      el.className = "toast show" + (type ? " " + type : "");
      el.setAttribute("role", type === "err" ? "alert" : "status");
      el.textContent = String(text);
      host.appendChild(el);
      const ms = type === "err" ? 5200 : 3200;
      const hide = () => {
        el.classList.remove("show");
        setTimeout(() => { try { el.remove(); } catch {} }, 200);
      };
      el.addEventListener("click", hide);
      setTimeout(hide, ms);
    }
    function showMsg(_el, text, type) {
      toast(text, type);
    }
    function hideMsg(el) {
      if (!el) return;
      if (el._hideTimer) { clearTimeout(el._hideTimer); el._hideTimer = null; }
      el.className = el.classList.contains("toast") ? "toast" : "msg";
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

    function currentAccountLabel() {
      const id = routing.currentAccountId;
      if (!id) return "–";
      const a = allAccounts.find((x) => x.id === id);
      if (!a) return id;
      return a.email || a.name || a.xaiUsername || id;
    }

    function paintMode() {
      if (!$("modeSeg")) return;
      $("modeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.mode === routing.mode));
      if ($("currentLabel")) $("currentLabel").textContent = "Current: " + currentAccountLabel() + " · " + routing.mode;
    }

    function accountStatusRank(st) {
      if (st === "active") return 0;
      if (st === "pending") return 1;
      if (st === "exhausted") return 2;
      if (st === "error") return 3;
      if (st === "expired") return 4;
      return 5;
    }

    /** public → restricted (allowlist) → private (donor-only) */
    function accountVisRank(a) {
      const k = accVisKey(a);
      if (k === "public") return 0;
      if (k === "restricted") return 1;
      return 2;
    }

    function sortAccounts(list) {
      return [...list].sort((a, b) => {
        const ra = accountStatusRank(a.status);
        const rb = accountStatusRank(b.status);
        if (ra !== rb) return ra - rb;
        const va = accountVisRank(a);
        const vb = accountVisRank(b);
        if (va !== vb) return va - vb;
        const ta = a.createdAt || a.updatedAt || 0;
        const tb = b.createdAt || b.updatedAt || 0;
        return tb - ta;
      });
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
        '<div class="pager-jump">' +
        '<input class="pager-input" type="number" min="1" max="' + totalPages + '" value="' + page + '" aria-label="' + esc(t("pageJumpPh")) + '" />' +
        '<span class="pager-total">/ ' + totalPages + '</span>' +
        '<button class="btn btn-secondary btn-sm" type="button" data-go="1">' + esc(t("goPage")) + '</button>' +
        '</div>' +
        '<button class="btn btn-secondary btn-sm" type="button" data-dir="1"' + (page >= totalPages ? " disabled" : "") + '>' + esc(t("next")) + '</button>' +
        '</div>';
      const jumpTo = (raw) => {
        const n = Math.floor(Number(raw));
        if (!Number.isFinite(n)) return;
        const next = Math.min(totalPages, Math.max(1, n));
        if (next === page) return;
        onPage(next);
      };
      el.querySelectorAll("button[data-dir]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = page + Number(btn.getAttribute("data-dir"));
          if (next < 1 || next > totalPages) return;
          onPage(next);
        });
      });
      const inp = el.querySelector(".pager-input");
      const goBtn = el.querySelector("button[data-go]");
      if (goBtn) goBtn.addEventListener("click", () => jumpTo(inp && inp.value));
      if (inp) {
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); jumpTo(inp.value); }
        });
      }
      return page;
    }

    /** Custom dropdown UI for native <select class="select"> (skip multi-select) */
    function enhanceSelect(sel) {
      if (!sel || sel.tagName !== "SELECT" || sel.dataset.cselect === "1") return;
      if (sel.multiple) return;
      sel.dataset.cselect = "1";
      sel.classList.add("select-native");
      const searchable = sel.dataset.searchable === "1";
      const wrap = document.createElement("div");
      const full =
        sel.classList.contains("grow") ||
        sel.classList.contains("block") ||
        sel.style.width === "100%";
      wrap.className = "cselect" + (full ? " block" : "");
      if (sel.style.minWidth) wrap.style.minWidth = sel.style.minWidth;
      if (sel.style.width && sel.style.width !== "100%") wrap.style.width = sel.style.width;
      if (sel.style.maxWidth) wrap.style.maxWidth = sel.style.maxWidth;
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cselect-btn";
      btn.setAttribute("aria-haspopup", "listbox");
      btn.innerHTML =
        '<span class="cselect-label"></span>' +
        '<svg class="cselect-caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const menu = document.createElement("div");
      menu.className = "cselect-menu" + (searchable ? " searchable" : "");
      menu.setAttribute("role", "listbox");
      let searchInput = null;
      const optsBox = document.createElement("div");
      optsBox.className = "cselect-opts";
      if (searchable) {
        const searchWrap = document.createElement("div");
        searchWrap.className = "cselect-search";
        searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.className = "input";
        searchInput.autocomplete = "off";
        searchInput.placeholder = t("userSearchPh");
        searchInput.addEventListener("click", (e) => e.stopPropagation());
        searchInput.addEventListener("input", () => rebuildOptions());
        searchInput.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
          }
        });
        searchWrap.appendChild(searchInput);
        menu.appendChild(searchWrap);
      }
      menu.appendChild(optsBox);
      wrap.appendChild(btn);
      wrap.appendChild(menu);

      const labelEl = btn.querySelector(".cselect-label");

      function selectedText() {
        const opt = sel.options[sel.selectedIndex];
        return opt ? (opt.textContent || opt.value || "") : "";
      }
      function syncLabel() {
        labelEl.textContent = selectedText() || "–";
      }
      function closeMenu() {
        wrap.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        if (searchInput) searchInput.value = "";
      }
      function openMenu() {
        document.querySelectorAll(".cselect.open").forEach((w) => {
          if (w !== wrap) w.classList.remove("open");
        });
        if (searchInput) {
          searchInput.value = "";
          searchInput.placeholder = t("userSearchPh");
        }
        rebuildOptions();
        wrap.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        menu.classList.remove("drop-up");
        const rect = wrap.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 240 && rect.top > spaceBelow) menu.classList.add("drop-up");
        if (searchInput) setTimeout(() => { try { searchInput.focus(); } catch {} }, 0);
      }
      function optionSearchText(opt) {
        return ((opt.textContent || "") + " " + (opt.value || "")).toLowerCase();
      }
      function optionRank(opt, q) {
        if (!q) return 0;
        const name = String(opt.textContent || "").toLowerCase();
        const bare = name.replace(/\s*\(admin\)\s*$/i, "").trim();
        const id = String(opt.value || "").toLowerCase();
        if (bare === q || name === q || id === q) return 0;
        if (bare.startsWith(q) || name.startsWith(q) || id.startsWith(q)) return 1;
        if (name.includes(q) || id.includes(q)) return 2;
        return 9;
      }
      function rebuildOptions() {
        optsBox.innerHTML = "";
        const q = searchInput ? String(searchInput.value || "").trim().toLowerCase() : "";
        const all = Array.from(sel.options).map((opt, idx) => ({ opt, idx }));
        let items = all;
        if (q) {
          items = all
            .filter(({ opt }) => optionSearchText(opt).includes(q))
            .sort((a, b) => optionRank(a.opt, q) - optionRank(b.opt, q) || a.idx - b.idx);
        }
        if (!items.length) {
          const empty = document.createElement("div");
          empty.className = "cselect-empty";
          empty.textContent = t("userSearchEmpty");
          optsBox.appendChild(empty);
          return;
        }
        items.forEach(({ opt, idx }) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "cselect-opt" + (opt.selected ? " on" : "");
          b.setAttribute("role", "option");
          b.setAttribute("aria-selected", opt.selected ? "true" : "false");
          b.disabled = opt.disabled;
          b.textContent = opt.textContent || opt.value || "";
          b.dataset.value = opt.value;
          b.dataset.idx = String(idx);
          b.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (opt.disabled) return;
            const prev = sel.value;
            sel.selectedIndex = idx;
            syncLabel();
            closeMenu();
            if (sel.value !== prev) {
              sel.dispatchEvent(new Event("change", { bubbles: true }));
              sel.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });
          optsBox.appendChild(b);
        });
      }
      function refresh() {
        syncLabel();
        if (wrap.classList.contains("open")) rebuildOptions();
      }

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (wrap.classList.contains("open")) closeMenu();
        else openMenu();
      });
      sel.addEventListener("change", syncLabel);
      const mo = new MutationObserver(() => refresh());
      mo.observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
      wrap._cselectRefresh = refresh;
      syncLabel();
    }

    function enhanceAllSelects(root) {
      (root || document).querySelectorAll("select.select").forEach(enhanceSelect);
    }

    if (!window.__cselectDocBound) {
      window.__cselectDocBound = true;
      document.addEventListener("click", (e) => {
        document.querySelectorAll(".cselect.open").forEach((w) => {
          if (!w.contains(e.target)) w.classList.remove("open");
        });
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          document.querySelectorAll(".cselect.open").forEach((w) => w.classList.remove("open"));
        }
      });
    }

    function matchQ(hay, q) {
      if (!q) return true;
      return String(hay || "").toLowerCase().includes(q);
    }
    /** Rank user hits: exact username > prefix > contains (id last). Lower is better. */
    function userSearchRank(u, q) {
      if (!q) return 0;
      const name = String(u.username || "").toLowerCase();
      const id = String(u.id || "").toLowerCase();
      if (name === q) return 0;
      if (id === q) return 1;
      if (name.startsWith(q)) return 2;
      if (id.startsWith(q)) return 3;
      if (name.includes(q)) return 4;
      if (id.includes(q)) return 5;
      return 9;
    }
    function filterUsersByQ(users, qRaw) {
      const q = String(qRaw || "").trim().toLowerCase();
      if (!q) return users.slice();
      return users
        .filter((u) => matchQ(u.username, q) || matchQ(u.id, q))
        .sort((a, b) => userSearchRank(a, q) - userSearchRank(b, q));
    }

    function accIsRestricted(a) {
      return Array.isArray(a.allowedUserIds) && a.allowedUserIds.length > 0;
    }
    /** Effective visibility: restricted > private > public */
    function accVisKey(a) {
      if (accIsRestricted(a)) return "restricted";
      if (a.private === true) return "private";
      return "public";
    }
    function accIsPrivate(a) {
      return accVisKey(a) !== "public";
    }
    function accVisLabel(a) {
      const k = accVisKey(a);
      if (k === "restricted") return t("visRestricted");
      if (k === "private") return t("visPrivate");
      return t("visPublic");
    }
    function accVisHint(a) {
      const k = accVisKey(a);
      if (k === "restricted") return t("visHintRestricted");
      if (k === "private") return t("visHintPrivate");
      return t("visHintPublic");
    }
    function accVisBadgeClass(a) {
      const k = accVisKey(a);
      if (k === "restricted") return "exhausted";
      if (k === "private") return "expired";
      return "active";
    }
    function accDonorLabel(a) {
      if (a.donorUsername) return a.donorUsername;
      if (a.donorUserId) return a.donorUserId.slice(0, 8);
      return "–";
    }
    function accAllowedLabel(a) {
      if (Array.isArray(a.memberLabels) && a.memberLabels.length) {
        return a.memberLabels.join(", ");
      }
      const parts = [];
      if (a.donorUsername) parts.push(a.donorUsername + " (donor)");
      else if (a.donorUserId) parts.push(String(a.donorUserId).slice(0, 8) + " (donor)");
      if (Array.isArray(a.allowedUsernames) && a.allowedUsernames.length) {
        for (const n of a.allowedUsernames) {
          if (a.donorUsername && n === a.donorUsername) continue;
          parts.push(n);
        }
      } else if (Array.isArray(a.allowedUserIds) && a.allowedUserIds.length) {
        for (const id of a.allowedUserIds) {
          if (a.donorUserId && id === a.donorUserId) continue;
          parts.push(String(id).slice(0, 6));
        }
      }
      return parts.length ? parts.join(", ") : "–";
    }
    function myMembersLabel(a) {
      if (Array.isArray(a.members) && a.members.length) {
        return a.members.map((m) => m.username + (m.isDonor ? " ★" : "")).join(", ");
      }
      return t("membersNone");
    }
    function fillUserSelect(sel, opts) {
      if (!sel) return;
      const keep = opts && opts.keepValue !== false;
      const prev = keep ? sel.value : "";
      const withEmpty = !(opts && opts.noEmpty);
      const emptyLabel = (opts && opts.emptyLabel) || t("accDonorNone");
      const users = accountUsers.length ? accountUsers : allUsers;
      sel.innerHTML = (withEmpty ? '<option value="">' + esc(emptyLabel) + "</option>" : "") +
        users.map((u) => '<option value="' + esc(u.id) + '">' + esc(u.username) + (u.role === "admin" ? " (admin)" : "") + "</option>").join("");
      if (keep && prev) sel.value = prev;
      if (sel._cselectRefresh) sel._cselectRefresh();
    }
    let allowedSelected = new Set();
    let allowedFilterQ = "";
    let allowedDonorId = null;

    function allowedUsersSource() {
      return accountUsers.length ? accountUsers : allUsers;
    }
    function userLabel(u) {
      return (u.username || u.id) + (u.role === "admin" ? " (admin)" : "");
    }
    function positionAllowedPanel() {
      const btn = $("accEditAllowedBtn");
      const panel = $("accEditAllowedPanel");
      if (!btn || !panel || panel.hidden) return;
      // re-parent to body so modal overflow / stacking never clips the menu
      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
      const r = btn.getBoundingClientRect();
      const gap = 4;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(Math.max(r.width, 240), vw - 24);
      let left = r.left;
      if (left + width > vw - 12) left = Math.max(12, vw - 12 - width);
      if (left < 12) left = 12;
      const spaceBelow = vh - r.bottom - gap - 12;
      const spaceAbove = r.top - gap - 12;
      const preferBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove;
      const maxH = Math.min(320, Math.max(160, preferBelow ? spaceBelow : spaceAbove));
      panel.style.position = "fixed";
      panel.style.zIndex = "400";
      panel.style.width = width + "px";
      panel.style.maxHeight = maxH + "px";
      panel.style.left = left + "px";
      panel.style.right = "auto";
      if (preferBelow) {
        panel.style.top = (r.bottom + gap) + "px";
        panel.style.bottom = "auto";
      } else {
        panel.style.top = "auto";
        panel.style.bottom = (vh - r.top + gap) + "px";
      }
      const list = $("accEditAllowedList");
      if (list) {
        list.style.maxHeight = Math.max(100, maxH - 56) + "px";
        list.style.overflowY = "auto";
      }
    }
    function closeAllowedPanel() {
      const root = $("accEditAllowed");
      const panel = $("accEditAllowedPanel");
      const btn = $("accEditAllowedBtn");
      if (panel) {
        panel.hidden = true;
        panel.style.top = "";
        panel.style.bottom = "";
        panel.style.left = "";
        panel.style.right = "";
        panel.style.width = "";
        panel.style.maxHeight = "";
        // put panel back under msel for clean DOM when closed
        if (root && panel.parentElement !== root) root.appendChild(panel);
      }
      if (root) root.classList.remove("open");
      if (btn) btn.setAttribute("aria-expanded", "false");
      window.removeEventListener("resize", positionAllowedPanel);
      window.removeEventListener("scroll", positionAllowedPanel, true);
    }
    function openAllowedPanel() {
      const root = $("accEditAllowed");
      const panel = $("accEditAllowedPanel");
      const btn = $("accEditAllowedBtn");
      if (!panel) return;
      panel.hidden = false;
      if (root) root.classList.add("open");
      if (btn) btn.setAttribute("aria-expanded", "true");
      if ($("accEditAllowedQ")) {
        $("accEditAllowedQ").value = allowedFilterQ;
      }
      renderAllowedList();
      positionAllowedPanel();
      window.addEventListener("resize", positionAllowedPanel);
      window.addEventListener("scroll", positionAllowedPanel, true);
      setTimeout(() => { try { if ($("accEditAllowedQ")) $("accEditAllowedQ").focus(); } catch {} }, 0);
    }
    function toggleAllowedPanel() {
      const panel = $("accEditAllowedPanel");
      if (!panel || panel.hidden) openAllowedPanel();
      else closeAllowedPanel();
    }
    function fillAllowedSelect(_box, selectedIds, donorId) {
      allowedDonorId = donorId || null;
      // donor is always allowed — never stored / toggled as extra
      allowedSelected = new Set(
        (selectedIds || []).filter((id) => id && id !== allowedDonorId),
      );
      allowedFilterQ = "";
      if ($("accEditAllowedQ")) $("accEditAllowedQ").value = "";
      closeAllowedPanel();
      renderAllowedList();
      syncAllowedCount();
    }
    function renderAllowedList() {
      const list = $("accEditAllowedList");
      const empty = $("accEditAllowedEmpty");
      if (!list) return;
      const users = allowedUsersSource();
      // extras only — donor shown as locked row at top when present
      const extras = users.filter((u) => u.id !== allowedDonorId);
      const filtered = filterUsersByQ(extras, allowedFilterQ);
      const donor = allowedDonorId
        ? users.find((u) => u.id === allowedDonorId)
        : null;
      const donorRow = donor
        ? '<div class="msel-opt locked on" title="' + esc(t("accAllowedDonorLocked")) + '">' +
          '<input type="checkbox" checked disabled />' +
          '<span class="msel-name">' + esc(userLabel(donor)) +
          ' <span class="msel-tag">' + esc(t("accAllowedDonorLocked")) + "</span></span>" +
          "</div>"
        : (allowedDonorId
          ? '<div class="msel-opt locked on">' +
            '<input type="checkbox" checked disabled />' +
            '<span class="msel-name">' + esc(String(allowedDonorId).slice(0, 8)) +
            ' <span class="msel-tag">' + esc(t("accAllowedDonorLocked")) + "</span></span>" +
            "</div>"
          : "");

      if (!users.length && !allowedDonorId) {
        list.innerHTML = "";
        if (empty) {
          empty.hidden = false;
          empty.textContent = t("accAllowedNone");
        }
        return;
      }
      if (!filtered.length && !donorRow) {
        list.innerHTML = "";
        if (empty) {
          empty.hidden = false;
          empty.textContent = t("accAllowedEmptySearch");
        }
        return;
      }
      if (empty) empty.hidden = true;
      const MAX_SHOW = 200;
      const slice = filtered.slice(0, MAX_SHOW);
      list.innerHTML = donorRow + slice.map((u) => {
        const on = allowedSelected.has(u.id);
        return '<label class="msel-opt' + (on ? " on" : "") + '">' +
          '<input type="checkbox" value="' + esc(u.id) + '"' + (on ? " checked" : "") + " />" +
          '<span class="msel-name">' + esc(userLabel(u)) + "</span>" +
          "</label>";
      }).join("") +
        (filtered.length > MAX_SHOW
          ? '<div class="msel-more">' + esc("…" + (filtered.length - MAX_SHOW)) + "</div>"
          : "");
      list.querySelectorAll('input[type="checkbox"]:not([disabled])').forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.value;
          if (!id || id === allowedDonorId) return;
          if (cb.checked) allowedSelected.add(id);
          else allowedSelected.delete(id);
          const lab = cb.closest(".msel-opt");
          if (lab) lab.classList.toggle("on", cb.checked);
          syncAllowedCount();
        });
      });
      if ($("accEditAllowedPanel") && !$("accEditAllowedPanel").hidden) {
        requestAnimationFrame(positionAllowedPanel);
      }
    }
    function getAllowedSelectedIds() {
      // extras only; backend always grants donor separately
      return [...allowedSelected].filter((id) => id && id !== allowedDonorId);
    }
    function clearAllowedSelection() {
      allowedSelected = new Set();
      renderAllowedList();
      syncAllowedCount();
    }
    function syncAllowedCount() {
      const hint = $("accEditAllowedMeta");
      if (!hint) return;
      const ids = getAllowedSelectedIds();
      const n = ids.length;
      if (!n) {
        hint.textContent = t("accAllowedPicked", 0);
        return;
      }
      const users = allowedUsersSource();
      const names = ids
        .map((id) => {
          const u = users.find((x) => x.id === id);
          return u ? u.username : id.slice(0, 6);
        })
        .slice(0, 3);
      const extra = n > 3 ? " +" + (n - 3) : "";
      hint.textContent = t("accAllowedPickedNames", n, names.join(", ") + extra);
    }

    function filteredAccounts() {
      const q = (($("accFilterQ") && $("accFilterQ").value) || "").trim().toLowerCase();
      const st = ($("accFilterSt") && $("accFilterSt").value) || "";
      const vis = ($("accFilterVis") && $("accFilterVis").value) || "";
      const filtered = allAccounts.filter((a) => {
        if (st && a.status !== st) return false;
        if (vis && accVisKey(a) !== vis) return false;
        if (!q) return true;
        return matchQ(a.name, q) || matchQ(a.id, q) || matchQ(a.email, q) || matchQ(a.xaiUsername, q) ||
          matchQ(a.donorUserId, q) || matchQ(a.donorUsername, q) || matchQ(accAllowedLabel(a), q) ||
          matchQ(a.lastError, q);
      });
      return sortAccounts(filtered);
    }

    function statusLabel(st) {
      if (lang === "zh") {
        if (st === "active") return "可用";
        if (st === "exhausted") return "耗尽";
        if (st === "expired") return "过期";
        if (st === "error") return "错误";
        if (st === "pending") return "待授权";
      }
      return st;
    }

    function renderAccounts() {
      const tbody = $("tbody");
      if (!tbody) return;
      const list = filteredAccounts();
      if (!list.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(allAccounts.length ? t("noLogs") : t("noAccounts")) + "</div>";
        $("accPager").innerHTML = "";
        return;
      }
      accPage = renderPager($("accPager"), accPage, list.length, PAGE_SIZE, (p) => { accPage = p; renderAccounts(); });
      const start = (accPage - 1) * PAGE_SIZE;
      const slice = list.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((a) => {
        const cur = a.isCurrent;
        const err = a.lastError ? shortErr(a.lastError) : "";
        const isPriv = accIsPrivate(a);
        const pending = a.status === "pending" || !a.hasRefresh;
        let useTitle = "";
        if (pending) useTitle = t("usePendingBlocked");
        else if (a.status !== "active") useTitle = t("useNotActiveBlocked");
        else if (isPriv) useTitle = t("usePrivateBlocked");
        const useDisabled = useTitle ? (" disabled title='" + esc(useTitle) + "'") : "";
        const identity = a.email || a.xaiUsername || "";
        return '<div class="dt-row' + (cur ? " current" : "") + (isPriv ? " is-private" : "") + '">' +
          '<div><div class="name">' + esc(a.name) + '</div>' +
          '<div class="mono">' + esc(a.id) + "</div>" +
          (identity && identity !== a.name ? '<div class="mono" style="font-size:11px">' + esc(identity) + "</div>" : "") +
          ((cur || a.donorUserId)
            ? '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">' +
              (cur ? '<span class="badge current">' + esc(t("current")) + "</span>" : "") +
              (a.donorUserId ? '<span class="badge" title="donor">' + esc("contrib") + "</span>" : "") +
              "</div>"
            : "") +
          (err ? '<div class="acc-err" title="' + esc(a.lastError) + '">' + esc(err) + "</div>" : "") +
          "</div>" +
          '<div title="' + esc(a.status) + '"><span class="badge ' + esc(a.status) + '">' + esc(statusLabel(a.status)) + "</span></div>" +
          '<div title="' + esc(accVisHint(a)) + '"><span class="badge ' + accVisBadgeClass(a) + '">' + esc(accVisLabel(a)) + "</span></div>" +
          '<div><div class="name">' + esc(accDonorLabel(a)) + '</div>' +
          (a.donorUserId ? '<div class="mono" style="font-size:11px">' + esc(a.donorUserId.slice(0, 8)) + "</div>" : "") +
          "</div>" +
          '<div class="mono" style="font-size:12px;line-height:1.35;word-break:break-word">' + esc(accAllowedLabel(a)) + "</div>" +
          "<div>" + creditCell(a) + "</div>" +
          '<div class="mono">' + a.useCount + "</div>" +
          '<div class="dt-time">' + fmtTime(a.lastUsedAt) + "</div>" +
          '<div class="dt-actions">' +
          (a.status === "expired" || a.status === "pending" || a.status === "error"
            ? '<button class="btn btn-sm" type="button" data-act="reauth" data-id="' + esc(a.id) + '">' + esc(t("oauthReauth")) + "</button>"
            : "") +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="use" data-id="' + esc(a.id) + '"' + useDisabled + '>' + esc(t("use")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="edit" data-id="' + esc(a.id) + '">' + esc(t("accEdit")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="credits" data-id="' + esc(a.id) + '">' + esc(t("credits")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="syncname" data-id="' + esc(a.id) + '">' + esc(t("accSyncName")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="reset" data-id="' + esc(a.id) + '">' + esc(t("reset")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="del" data-id="' + esc(a.id) + '">' + esc(t("del")) + "</button>" +
          "</div></div>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "use") useAcc(id);
          if (act === "edit") openAccEdit(id);
          if (act === "credits") checkCredits(id);
          if (act === "syncname") refreshAccProfile(id);
          if (act === "reset") resetAcc(id);
          if (act === "del") delAcc(id);
          if (act === "reauth") reauthAdminAcc(id);
        });
      });
    }

    function keyStatus(k) {
      return !k.enabled ? "disabled" : k.expired ? "expired" : "active";
    }

    function filteredKeys() {
      const q = (($("keyFilterQ") && $("keyFilterQ").value) || "").trim().toLowerCase();
      const st = ($("keyFilterSt") && $("keyFilterSt").value) || "";
      return allKeys.filter((k) => {
        if (st && keyStatus(k) !== st) return false;
        if (!q) return true;
        return matchQ(k.alias, q) || matchQ(k.keyPrefix, q) || matchQ(k.note, q) ||
          matchQ(k.username, q) || matchQ(k.userId, q);
      });
    }

    function renderKeys() {
      const tbody = $("tbodyKeys");
      if (!tbody) return;
      const showOwner = isAdmin();
      const root = tbody.closest(".dt-keys");
      if (root) root.classList.toggle("has-owner", showOwner);
      const list = filteredKeys();
      if (!list.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(allKeys.length ? t("noLogs") : t("noKeys")) + "</div>";
        $("keyPager").innerHTML = "";
        return;
      }
      keyPage = renderPager($("keyPager"), keyPage, list.length, PAGE_SIZE, (p) => { keyPage = p; renderKeys(); });
      const start = (keyPage - 1) * PAGE_SIZE;
      const slice = list.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((k) => {
        const st = keyStatus(k);
        const owner = k.username || k.userId || "–";
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(k.alias) + '</div><div class="mono">' + esc(k.note || "") + "</div></div>" +
          '<div class="mono">' + esc(k.keyPrefix) + "</div>" +
          (showOwner ? '<div><div class="name">' + esc(owner) + '</div><div class="mono">' + esc(k.userId || "") + "</div></div>" : "") +
          '<div><span class="badge ' + (st === "active" ? "active" : "error") + '">' + st + "</span></div>" +
          '<div class="dt-time">' + (k.expiresAt ? fmtTime(k.expiresAt) : t("never")) + "</div>" +
          '<div class="mono dt-num" title="' + esc(String(k.useCount ?? 0)) + '">' + esc(fmtNum(k.useCount ?? 0)) + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="editkey" data-id="' + esc(k.id) + '">' + esc(t("editKey")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="toggle" data-id="' + esc(k.id) + '" data-en="' + (k.enabled ? "0" : "1") + '">' +
          esc(k.enabled ? t("disable") : t("enable")) + "</button>" +
          '<button class="btn btn-danger btn-sm" type="button" data-act="delkey" data-id="' + esc(k.id) + '">' + esc(t("del")) + "</button>" +
          "</div></div>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "editkey") openKeyEdit(id);
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
      enhanceSelect(sel);
      if (sel.parentElement && sel.parentElement._cselectRefresh) sel.parentElement._cselectRefresh();
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
    /** Generated tokens for TPS: completion (output) + reasoning */
    function logGenTokens(u) {
      if (!u) return 0;
      const out = Number(u.completionTokens) || 0;
      const reason = Number(u.reasoningTokens) || 0;
      return out + reason;
    }
    /** Min post-TTFT duration for reliable TPS (matches server MIN_GEN_MS_FOR_TPS) */
    const MIN_GEN_MS_FOR_TPS = 50;
    /** Generation ms excluding TTFT when firstTokenMs is present */
    function logGenLatencyMs(r) {
      const lat = r && r.latencyMs != null ? Number(r.latencyMs) : 0;
      if (!(lat > 0)) return 0;
      const ttft = r && r.firstTokenMs != null ? Number(r.firstTokenMs) : NaN;
      if (!Number.isFinite(ttft) || ttft < 0) return lat;
      return Math.max(0, lat - Math.min(ttft, lat));
    }
    function hasLogTtft(r) {
      return r && r.firstTokenMs != null && Number.isFinite(Number(r.firstTokenMs));
    }
    function fmtTtft(r) {
      if (!hasLogTtft(r)) return "–";
      return Math.round(Number(r.firstTokenMs)) + "ms";
    }
    /**
     * Per-request TPS:
     * - with TTFT and gen≥50ms: (completion+reasoning) / (latency − TTFT)
     * - legacy (no TTFT): (completion+reasoning) / full latency
     * - TTFT≈latency (tiny gen window): "–" (unreliable)
     */
    function fmtReqTps(r) {
      const tok = logGenTokens(r && r.usage);
      if (!(tok > 0)) return "–";
      let ms;
      if (hasLogTtft(r)) {
        ms = logGenLatencyMs(r);
        if (ms < MIN_GEN_MS_FOR_TPS) return "–";
      } else {
        ms = r && r.latencyMs != null ? Number(r.latencyMs) : 0;
      }
      if (!(ms > 0)) return "–";
      const tps = tok / (ms / 1000);
      if (!Number.isFinite(tps)) return "–";
      return (tps >= 100 ? Math.round(tps) : Math.round(tps * 10) / 10) + "";
    }
    function fmtTpsCell(r) {
      const v = fmtReqTps(r);
      if (v === "–") {
        if (hasLogTtft(r) && logGenLatencyMs(r) < MIN_GEN_MS_FOR_TPS) {
          return '<span class="mute" title="' + esc(t("tpsTinyGenHint")) + '">–</span>';
        }
        return "–";
      }
      if (!hasLogTtft(r)) {
        return '<span title="' + esc(t("tpsLegacyHint")) + '">' + esc(v) + "</span>";
      }
      return esc(v);
    }
    function fmtTtftCell(r) {
      if (!hasLogTtft(r)) {
        return '<span class="mute" title="' + esc(t("ttftLegacyHint")) + '">' + esc(t("ttftLegacyShort")) + "</span>";
      }
      const txt = fmtTtft(r);
      return '<span title="' + esc(txt) + '">' + esc(txt) + "</span>";
    }
    function fmtRate(n, digits) {
      if (n == null || !Number.isFinite(Number(n)) || Number(n) <= 0) return "–";
      const v = Number(n);
      const d = digits != null ? digits : (v >= 100 ? 0 : 2);
      return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toString();
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
        const latTxt = r.latencyMs != null ? r.latencyMs + "ms" : "–";
        const accTxt = r.accountName || r.accountId || "–";
        const keyTxt = r.apiKeyAlias || r.apiKeyId || "–";
        return '<div class="dt-row clickable" data-id="' + esc(r.id) + '">' +
          '<div class="dt-time"><div class="dt-time-main">' + esc(fmtTime(r.ts)) + "</div>" +
          (r.stream ? '<span class="badge">stream</span>' : "") + "</div>" +
          '<div' + uaTip + '><div class="name">' + esc(client) + '</div>' +
          (r.userAgent && r.client && r.userAgent !== r.client ? '<div class="mono" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.userAgent) + "</div>" : "") +
          "</div>" +
          '<div><div class="name">' + esc(r.model || "–") + '</div><div class="mono">' + esc(r.mode) + "</div></div>" +
          '<div><span class="badge ' + stCls + '">' + esc(r.status) + "</span></div>" +
          '<div class="mono" style="white-space:nowrap" title="' + esc(tok) + '">' + tok + "</div>" +
          '<div class="mono dt-num" title="' + esc(latTxt) + '">' + esc(latTxt) + "</div>" +
          '<div class="mono dt-num">' + fmtTtftCell(r) + "</div>" +
          '<div class="mono dt-num">' + fmtTpsCell(r) + "</div>" +
          (showAcc ? '<div class="mono" title="' + esc(accTxt) + '">' + esc(accTxt) + "</div>" : "") +
          '<div class="mono" title="' + esc(keyTxt) + '">' + esc(keyTxt) + "</div>" +
          "</div>";
      }).join("");
      tbody.querySelectorAll(".dt-row[data-id]").forEach((tr) => {
        tr.addEventListener("click", () => openLogDetail(tr.getAttribute("data-id")));
      });
    }

    function paintOverviewChrome() {
      const name = currentUser && currentUser.username ? currentUser.username : "";
      if ($("ovHello")) $("ovHello").textContent = name ? t("ovHelloNamed", name) : t("ovHello");
      if ($("ovHelloSub")) $("ovHelloSub").textContent = t("ovHelloSub");
      if ($("ovUserPill")) {
        if (currentUser) {
          $("ovUserPill").textContent =
            currentUser.username + (currentUser.role === "admin" ? " · admin" : "");
        } else {
          $("ovUserPill").textContent = "–";
        }
      }
      if ($("ovRangePill")) $("ovRangePill").textContent = t("ovUsageSub", usageRange || "24h");
      if ($("ovUsageSub")) $("ovUsageSub").textContent = t("ovUsageSub", usageRange || "24h");
    }

    function renderOverviewRecent(items) {
      const el = $("ovRecent");
      if (!el) return;
      if (!items || !items.length) {
        el.innerHTML = '<div class="ov-empty">' + esc(t("noLogs")) + "</div>";
        return;
      }
      el.innerHTML = items.slice(0, 6).map((r) => {
        const st = r.ok ? "active" : "error";
        const client = clientLabel(r);
        return '<div class="quick-row clickable" data-id="' + esc(r.id) + '">' +
          '<div class="ov-recent-main">' +
          '<div class="name">' + esc(r.model || "–") + '</div>' +
          '<div class="mono">' + esc(client) + " · " + esc(fmtTime(r.ts)) + "</div>" +
          "</div>" +
          '<div class="ov-recent-side">' +
          '<span class="badge ' + st + '">' + esc(r.status) + "</span>" +
          '<div class="mono">' + (r.usage ? fmtUsageShort(r.usage) : ((r.latencyMs || 0) + "ms")) + "</div>" +
          "</div></div>";
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
         font: { size: 12, family: "Geist, Noto Sans SC, system-ui, sans-serif", weight: "500" }
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
    /** Cache hit rate = cached input / total input (prompt). null when no input. */
    function cacheHitRate(b) {
      const prompt = (b && (b.promptTokens || 0)) || 0;
      if (!(prompt > 0)) return null;
      const cached = Math.min((b.cachedTokens || 0), prompt);
      return Math.round((cached / prompt) * 1000) / 10; // one decimal
    }
    function fmtCacheHitPct(rate) {
      if (rate == null || !Number.isFinite(rate)) return null;
      return (rate % 1 === 0 ? String(Math.round(rate)) : rate.toFixed(1));
    }
    function paintCacheHitMeta(elId, rowsOrBucket) {
      const el = $(elId);
      if (!el) return;
      let prompt = 0;
      let cached = 0;
      if (Array.isArray(rowsOrBucket)) {
        for (const b of rowsOrBucket) {
          const p = b.promptTokens || 0;
          prompt += p;
          cached += Math.min(b.cachedTokens || 0, p);
        }
      } else if (rowsOrBucket) {
        prompt = rowsOrBucket.promptTokens || 0;
        cached = Math.min(rowsOrBucket.cachedTokens || 0, prompt);
      }
      if (!(prompt > 0)) {
        el.textContent = t("cacheHitNone");
        el.classList.remove("on");
        el.removeAttribute("title");
        return;
      }
      const pct = Math.round((cached / prompt) * 1000) / 10;
      const pctTxt = fmtCacheHitPct(pct);
      el.textContent = t("cacheHitLabel", pctTxt);
      el.classList.toggle("on", pct > 0);
      el.title = t("cacheHitTip", fmtNum(cached), fmtNum(prompt));
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

    function timeSeriesLabels(stats) {
      const gran = stats.granularity || "day";
      return (stats.byDay || []).map((d) => {
        if (d.label && d.label !== d.key) return d.label;
        // fallback for older payloads: day key YYYY-MM-DD
        if (gran === "day" && d.key && d.key.length >= 10) return d.key.slice(5);
        return d.label || d.key || "";
      });
    }

    function paintOverviewChart(stats) {
      if (typeof Chart === "undefined") return;
      const dayLabels = timeSeriesLabels(stats);
      const tip = { backgroundColor: "#171717", cornerRadius: 8, padding: 8, usePointStyle: true, boxWidth: 8, boxHeight: 8 };
      const miniLegend = {
        position: "right",
        labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 8, color: "#4d4d4d", font: { size: 10 } },
      };

      if ($("chartOverview")) {
        destroyChart("overview");
        charts.overview = new Chart($("chartOverview"), {
          type: "bar",
          data: { labels: dayLabels, datasets: stackedTokDatasets(stats.byDay, false) },
          options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            layout: { padding: { top: 2, bottom: 0, left: 0, right: 2 } },
            plugins: {
              legend: {
                display: true, position: "top", align: "end",
                labels: { ...(legendOpts.labels || {}), boxWidth: 7, boxHeight: 7, padding: 8, font: { size: 10 } },
              },
              tooltip: tip,
            },
            scales: {
              y: {
                stacked: true, display: true, beginAtZero: true,
                grid: { color: "rgba(0,0,0,.04)", drawBorder: false },
                ticks: { font: { size: 10 }, color: "#888", maxTicksLimit: 4, padding: 2 },
              },
              x: {
                stacked: true, grid: { display: false },
                ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8, color: "#888", padding: 0 },
              },
            },
          },
        });
      }

      // Model mix doughnut
      if ($("chartOvModel")) {
        destroyChart("ovModel");
        const models = (stats.byModel || []).slice(0, 6);
        const hasModel = models.length > 0;
        charts.ovModel = new Chart($("chartOvModel"), {
          type: "doughnut",
          data: {
            labels: hasModel ? models.map((m) => localBucketLabel(m.label)) : [t("noModel")],
            datasets: [{
              data: hasModel ? models.map((m) => m.requests || 0) : [1],
              backgroundColor: hasModel
                ? models.map((_, i) => PALETTE[i % PALETTE.length])
                : ["#e5e5e5"],
              borderWidth: 2, borderColor: "#fff", hoverOffset: 3,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: "62%",
            plugins: {
              legend: miniLegend,
              tooltip: tip,
            },
          },
        });
      }

      // Requests + success rate over time
      if ($("chartOvReq")) {
        destroyChart("ovReq");
        const rows = stats.byDay || [];
        charts.ovReq = new Chart($("chartOvReq"), {
          type: "bar",
          data: {
            labels: dayLabels,
            datasets: [
              {
                type: "bar",
                label: t("ovOk"),
                data: rows.map((d) => d.ok || 0),
                backgroundColor: "rgba(10,122,62,.75)",
                borderWidth: 0,
                stack: "r",
                yAxisID: "y",
                order: 2,
                barPercentage: 0.72,
                categoryPercentage: 0.8,
              },
              {
                type: "bar",
                label: t("ovFail"),
                data: rows.map((d) => d.fail || 0),
                backgroundColor: "rgba(238,0,0,.55)",
                borderWidth: 0,
                stack: "r",
                yAxisID: "y",
                order: 2,
                barPercentage: 0.72,
                categoryPercentage: 0.8,
              },
              {
                type: "line",
                label: t("kpiOk"),
                data: rows.map((d) => {
                  const n = (d.ok || 0) + (d.fail || 0);
                  return n ? Math.round(((d.ok || 0) / n) * 100) : null;
                }),
                borderColor: "#171717",
                backgroundColor: "#171717",
                tension: 0.35,
                yAxisID: "y1",
                pointRadius: 2.5,
                pointHoverRadius: 4,
                pointBackgroundColor: "#fff",
                borderWidth: 2,
                order: 1,
                spanGaps: true,
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            layout: { padding: { top: 2, bottom: 0, left: 0, right: 2 } },
            plugins: {
              legend: {
                display: true, position: "top", align: "end",
                labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, boxHeight: 7, padding: 8, color: "#4d4d4d", font: { size: 10 } },
              },
              tooltip: tip,
            },
            scales: {
              y: {
                stacked: true, beginAtZero: true, position: "left",
                grid: { color: "rgba(0,0,0,.04)", drawBorder: false },
                ticks: { font: { size: 10 }, color: "#888", maxTicksLimit: 4, padding: 2 },
              },
              y1: {
                position: "right", min: 0, max: 100,
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 10 }, color: "#888", maxTicksLimit: 4, callback: (v) => v + "%" },
              },
              x: {
                stacked: true, grid: { display: false },
                ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6, color: "#888" },
              },
            },
          },
        });
      }
    }

    function paintCharts(stats) {
      if (typeof Chart === "undefined" || !$("chartDay")) return;
      const dayLabels = timeSeriesLabels(stats);
      const s = stats.summary;
      const tip = { backgroundColor: "#171717", cornerRadius: 8, padding: 10, usePointStyle: true, boxWidth: 8, boxHeight: 8 };
      /** Append cache hit only on Cached-input series — never on uncached in / out / reason. */
      const cacheHitOnLabel = (buckets) => (ctx) => {
        const dsLabel = ctx.dataset && ctx.dataset.label ? String(ctx.dataset.label) : "";
        // Always read raw dataset value: for indexAxis:y, parsed.y is the category index (0,1,…)
        let val = null;
        if (ctx.dataset && Array.isArray(ctx.dataset.data) && ctx.dataIndex != null) {
          const d = ctx.dataset.data[ctx.dataIndex];
          if (typeof d === "number" && Number.isFinite(d)) val = d;
        }
        let line = (dsLabel ? dsLabel + ": " : "") + (val != null ? fmtNum(val) : "–");
        if (dsLabel === t("chartCache") && Array.isArray(buckets)) {
          const b = buckets[ctx.dataIndex];
          const rate = b ? cacheHitRate(b) : null;
          if (rate != null) line += " · " + t("cacheHitLabel", fmtCacheHitPct(rate));
        }
        return line;
      };
      const bucketTip = (buckets) => ({
        ...tip,
        callbacks: { label: cacheHitOnLabel(buckets) },
      });
      const hBarFor = (buckets) => ({
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, ...legendOpts }, tooltip: bucketTip(buckets) },
        scales: {
          x: { stacked: true, grid: { color: "rgba(0,0,0,.04)", drawBorder: false }, ticks: { font: { size: 10 }, color: "#888" } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, color: "#4d4d4d" } }
        }
      });
      const xTickLimit = (stats.byDay || []).length > 48 ? 16 : (stats.byDay || []).length > 24 ? 12 : 24;

      paintCacheHitMeta("cacheHitDay", stats.byDay);
      paintCacheHitMeta("cacheHitMix", s);

      destroyChart("day");
      charts.day = new Chart($("chartDay"), {
        type: "bar",
        data: { labels: dayLabels, datasets: stackedTokDatasets(stats.byDay, true) },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: true, ...legendOpts }, tooltip: bucketTip(stats.byDay || []) },
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
            x: {
              stacked: true, grid: { display: false },
              ticks: { font: { size: 10 }, color: "#888", maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: xTickLimit }
            }
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
            tooltip: {
              ...tip,
              callbacks: {
                label: (ctx) => {
                  const lab = ctx.label || "";
                  const val = ctx.parsed;
                  let line = lab + ": " + (val != null ? fmtNum(val) : "–");
                  // doughnut index 1 = cached input only
                  if (ctx.dataIndex === 1) {
                    const rate = cacheHitRate(s);
                    if (rate != null) line += " · " + t("cacheHitLabel", fmtCacheHitPct(rate));
                  }
                  return line;
                },
              },
            }
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
        paintCacheHitMeta("cacheHitAcc", accs);
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
          options: hBarFor(accs)
        });
      } else {
        paintCacheHitMeta("cacheHitAcc", null);
      }

      destroyChart("key");
      const keys = [...stats.byKey].sort((a, b) => {
        if (a.key === "__no_key__") return 1;
        if (b.key === "__no_key__") return -1;
        return b.totalTokens - a.totalTokens;
      }).slice(0, 8);
      paintCacheHitMeta("cacheHitKey", keys);
      paintCacheHitMeta("cacheHitKeyIO", keys);
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
        options: hBarFor(keys)
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
      allAccounts = data.accounts || [];
      accountUsers = data.users || accountUsers;
      paintMode();
      if ($("sTotal")) $("sTotal").textContent = data.stats.total;
      if ($("sActive")) $("sActive").textContent = data.stats.active;
      fillUserSelect($("accDonor"));
      const maxPage = Math.max(1, Math.ceil(allAccounts.length / PAGE_SIZE));
      if (accPage > maxPage) accPage = maxPage;
      renderAccounts();
    }

    function openAccEdit(id) {
      const a = allAccounts.find((x) => x.id === id);
      if (!a) return;
      accEditId = id;
      fillUserSelect($("accEditDonor"), { emptyLabel: t("accDonorNone") });
      if ($("accEditName")) $("accEditName").value = a.name || "";
      if ($("accEditPrivate")) $("accEditPrivate").value = a.private === true ? "private" : "public";
      if ($("accEditDonor")) {
        $("accEditDonor").value = a.donorUserId || "";
        if ($("accEditDonor")._cselectRefresh) $("accEditDonor")._cselectRefresh();
        if ($("accEditDonor").parentElement && $("accEditDonor").parentElement._cselectRefresh) {
          $("accEditDonor").parentElement._cselectRefresh();
        }
      }
      if ($("accEditPrivate") && $("accEditPrivate").parentElement && $("accEditPrivate").parentElement._cselectRefresh) {
        $("accEditPrivate").parentElement._cselectRefresh();
      }
      // donor always locked; allowlist is extras only
      fillAllowedSelect($("accEditAllowed"), a.allowedUserIds || [], a.donorUserId || null);
      if ($("accModal")) $("accModal").classList.add("show");
      applyI18n();
      syncAllowedCount();
    }

    function closeAccEdit() {
      accEditId = null;
      closeAllowedPanel();
      if ($("accModal")) $("accModal").classList.remove("show");
    }

    async function saveAccEdit() {
      if (!accEditId) return;
      try {
        const donorId = ($("accEditDonor") && $("accEditDonor").value) || null;
        // extras only; donor always granted by server and stripped from list
        const allowed = getAllowedSelectedIds().filter((id) => id !== donorId);
        const body = {
          name: ($("accEditName") && $("accEditName").value.trim()) || undefined,
          private: $("accEditPrivate") && $("accEditPrivate").value === "private",
          donorUserId: donorId,
          allowedUserIds: allowed,
        };
        const res = await fetch("/api/admin/accounts/" + accEditId, {
          method: "PATCH",
          headers: jsonHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msg"), t("accSaved"), "ok");
        closeAccEdit();
        await loadAccounts();
      } catch (e) {
        showMsg($("msg"), e.message || String(e), "err");
      }
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
    let pwdEditId = null;
    let nameEditId = null;

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

    function openPwdModal(u) {
      pwdEditId = u.id;
      $("pwdUserHint").textContent = u.username + " · " + u.id;
      $("pwdInput").value = "";
      $("pwdInput2").value = "";
      $("pwdModal").classList.add("show");
      $("pwdInput").focus();
    }

    function closePwdModal() {
      pwdEditId = null;
      $("pwdModal").classList.remove("show");
      if ($("pwdInput")) $("pwdInput").value = "";
      if ($("pwdInput2")) $("pwdInput2").value = "";
    }

    function openNameModal(u) {
      nameEditId = u.id;
      $("nameUserHint").textContent = u.username + " · " + u.id;
      $("nameInput").value = u.username || "";
      $("nameModal").classList.add("show");
      $("nameInput").focus();
      try { $("nameInput").select(); } catch {}
    }

    function closeNameModal() {
      nameEditId = null;
      $("nameModal").classList.remove("show");
      if ($("nameInput")) $("nameInput").value = "";
    }

    function filteredUsers() {
      const q = (($("userFilterQ") && $("userFilterQ").value) || "").trim().toLowerCase();
      const role = ($("userFilterRole") && $("userFilterRole").value) || "";
      const st = ($("userFilterSt") && $("userFilterSt").value) || "";
      return allUsers.filter((u) => {
        if (role && u.role !== role) return false;
        if (st === "active" && !u.enabled) return false;
        if (st === "disabled" && u.enabled) return false;
        if (!q) return true;
        return matchQ(u.username, q) || matchQ(u.id, q);
      });
    }

    async function loadUsers() {
      if (!isAdmin()) return;
      const res = await fetch("/api/admin/users", { headers: headers() });
      if (!res.ok) return;
      const data = await res.json();
      allUsers = data.users || [];
      const tbody = $("tbodyUsers");
      const list = filteredUsers();
      if (!list.length) {
        tbody.innerHTML = '<div class="dt-empty">–</div>';
        return;
      }
      tbody.innerHTML = list.map((u) => {
        const qCls = u.tokenQuota != null && (u.tokenUsed ?? 0) >= u.tokenQuota ? " error" : "";
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(u.username) + '</div><div class="mono">' + esc(u.id) + "</div></div>" +
          '<div><span class="badge ' + (u.role === "admin" ? "current" : "") + '">' + esc(u.role === "admin" ? t("roleAdmin") : t("roleUser")) + "</span></div>" +
          '<div><span class="badge ' + (u.enabled ? "active" : "error") + '">' + (u.enabled ? "active" : "disabled") + "</span></div>" +
          '<div class="mono' + qCls + '">' + esc(fmtQuota(u)) + "</div>" +
          '<div class="dt-time">' + fmtTime(u.lastLoginAt) + "</div>" +
          '<div class="dt-actions">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="quota-user" data-id="' + esc(u.id) + '">' + esc(t("setQuota")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="name-user" data-id="' + esc(u.id) + '">' + esc(t("renameUser")) + "</button>" +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="pwd-user" data-id="' + esc(u.id) + '">' + esc(t("resetPwd")) + "</button>" +
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
            if (act === "name-user") {
              const u = allUsers.find((x) => x.id === id);
              if (u) openNameModal(u);
              return;
            }
            if (act === "pwd-user") {
              const u = allUsers.find((x) => x.id === id);
              if (u) openPwdModal(u);
              return;
            }
            if (act === "toggle-user") {
              await fetch("/api/admin/users/" + id, { method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ enabled: btn.getAttribute("data-en") === "1" }) });
            }
            if (act === "del-user") {
              if (!(await confirmDialog(t("confirmDelete") + " · " + id, { danger: true }))) return;
              await fetch("/api/admin/users/" + id, { method: "DELETE", headers: headers() });
            }
            await loadUsers();
          } catch (e) { showMsg($("msgUsers"), e.message, "err"); }
        });
      });
    }

    function usageQueryParams() {
      const qs = new URLSearchParams();
      const map = { "1h": 1, "6h": 6, "24h": 24, "7d": 7 * 24, "30d": 30 * 24 };
      const hours = map[usageRange] != null ? map[usageRange] : 24;
      qs.set("hours", String(hours));
      if (usageGran && usageGran !== "auto") qs.set("granularity", usageGran);
      return qs;
    }
    function paintUsageControls(stats) {
      if ($("rangeSeg")) {
        $("rangeSeg").querySelectorAll("button[data-range]").forEach((b) => {
          b.classList.toggle("on", b.getAttribute("data-range") === usageRange);
        });
      }
      if ($("granSeg")) {
        $("granSeg").querySelectorAll("button[data-gran]").forEach((b) => {
          b.classList.toggle("on", b.getAttribute("data-gran") === usageGran);
        });
      }
      if ($("usageRangeHint") && stats) {
        const granKey = stats.granularity === "minute" ? "granMinuteLong"
          : stats.granularity === "5m" ? "gran5mLong"
          : stats.granularity === "hour" ? "granHourLong" : "granDayLong";
        const n = (stats.byDay && stats.byDay.length) || 0;
        $("usageRangeHint").textContent = t("usageRangeHint", usageRange, t(granKey), n);
      }
    }

    async function loadUsage() {
      try {
        const res = await fetch(apiUsagePath() + "?" + usageQueryParams().toString(), { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        lastStats = data.stats;
        const s = data.stats.summary;
        const seg = tokenSegments(s);
        if ($("uReq")) $("uReq").textContent = fmtNum(s.requests);
        if ($("uIn")) $("uIn").textContent = fmtNum(seg.uncachedIn);
        if ($("uCache")) $("uCache").textContent = fmtNum(seg.cached);
        if ($("uCacheHit")) {
          const rate = cacheHitRate(s);
          $("uCacheHit").textContent = rate == null ? "–" : fmtCacheHitPct(rate) + "%";
          $("uCacheHit").title = rate == null
            ? ""
            : t("cacheHitTip", fmtNum(seg.cached), fmtNum(seg.prompt));
        }
        if ($("uOut")) $("uOut").textContent = fmtNum(s.completionTokens);
        if ($("uReason")) $("uReason").textContent = fmtNum(s.reasoningTokens);
        if ($("uTok")) $("uTok").textContent = fmtNum(s.totalTokens);
        if ($("uOk")) $("uOk").textContent = s.requests ? Math.round((s.ok / s.requests) * 100) + "%" : "–";
        if ($("uLat")) $("uLat").textContent = s.avgLatencyMs != null ? s.avgLatencyMs + "ms" : "–";
        if ($("uTtft")) {
          $("uTtft").textContent =
            s.avgFirstTokenMs != null && s.avgFirstTokenMs > 0 ? s.avgFirstTokenMs + "ms" : "–";
          $("uTtft").title =
            s.tpsSampleCount > 0
              ? t("ttftSampleHint", s.tpsSampleCount, s.requests)
              : t("ttftNoSampleHint");
        }
        if ($("uTps")) {
          $("uTps").textContent = fmtRate(s.avgTps != null ? s.avgTps : s.avgReqTps);
          $("uTps").title =
            s.tpsSampleCount > 0
              ? t("tpsSampleHint", s.tpsSampleCount, s.requests)
              : t("tpsNoSampleHint");
        }
        if ($("uImg")) $("uImg").textContent = fmtNum(s.imageTokens);
        paintUsageControls(data.stats);

        if ($("sReq")) $("sReq").textContent = fmtNum(s.requests);
        if ($("ovTok")) $("ovTok").textContent = fmtNum(s.totalTokens);
        if ($("ovIn")) $("ovIn").textContent = fmtNum(seg.uncachedIn);
        if ($("ovOut")) $("ovOut").textContent = fmtNum(s.completionTokens);
        if ($("ovCache")) $("ovCache").textContent = fmtNum(seg.cached);
        if ($("ovReason")) $("ovReason").textContent = fmtNum(s.reasoningTokens || 0);
        if ($("ovOkRate")) {
          $("ovOkRate").textContent = s.requests
            ? t("ovOkRate", Math.round((s.ok / s.requests) * 100))
            : "–";
        }
        if ($("ovLat")) {
          $("ovLat").textContent = s.avgLatencyMs != null ? t("ovLat", s.avgLatencyMs) : "–";
        }
        paintOverviewChrome();

        if (view === "usage") paintCharts(data.stats);
        if (view === "overview") paintOverviewChart(data.stats);
      } catch {}
    }

    async function loadLogs() {
      try {
        const day = $("logDay").value;
        const ok = $("logOk").value;
        const q = (($("logFilterQ") && $("logFilterQ").value) || "").trim();
        const qs = new URLSearchParams({ page: String(logPage), limit: String(LOG_PAGE) });
        if (day) qs.set("day", day);
        if (ok) qs.set("ok", ok);
        if (q) qs.set("q", q);
        const res = await fetch(apiLogsPath() + "?" + qs.toString(), { headers: headers() });
        if (!res.ok) { showMsg($("msgLogs"), "HTTP " + res.status, "err"); return; }
        const data = await res.json();
        logTotal = data.total || 0;
        logDays = data.days || [];
        lastLogItems = data.items || [];
        paintLogDaySelect();
        if (data.disk && $("logDisk")) $("logDisk").textContent = t("diskInfo", data.disk.days, fmtBytes(data.disk.bytes));
        renderLogs(lastLogItems);
        if (view === "overview" || !day) renderOverviewRecent(lastLogItems);
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
          '<div><div class="k">ttft</div><div class="v">' +
          (hasLogTtft(log)
            ? esc(fmtTtft(log))
            : '<span class="mute">' + esc(t("ttftLegacyHint")) + "</span>") +
          "</div></div>" +
          '<div><div class="k">tps</div><div class="v">' +
          (function () {
            const v = fmtReqTps(log);
            if (hasLogTtft(log)) {
              if (v === "–") {
                return '<span class="mute">' + esc(t("tpsTinyGenHint")) + "</span>";
              }
              return esc(v) + ' <span class="mute">(ex TTFT)</span>';
            }
            return esc(v) + ' <span class="mute">(' + esc(t("tpsLegacyHint")) + ")</span>";
          })() +
          "</div></div>" +
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
            : '<div class="hint" style="margin:8px 0">response body not stored</div>');
        $("logModal").classList.add("show");
      } catch (e) {
        showMsg($("msgLogs"), e.message, "err");
      }
    }

    function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    function stopContribPoll() {
      if (contribPollTimer) { clearInterval(contribPollTimer); contribPollTimer = null; }
    }

    function stopContribListWatch() {
      if (contribListWatchTimer) { clearInterval(contribListWatchTimer); contribListWatchTimer = null; }
    }

    function ensureContribListWatch() {
      const busy = myAccounts.some((a) => a.status === "pending" || (a.oauth && a.oauth.phase === "waiting_user"));
      if (busy && !contribListWatchTimer) {
        contribListWatchTimer = setInterval(() => { loadMyAccounts(); }, 2500);
      } else if (!busy) {
        stopContribListWatch();
      }
    }

    function oauthPhaseLabel(a) {
      const p = a.oauth && a.oauth.phase;
      if (p === "failed") return t("oauthPhaseFailed");
      if (p === "waiting_user") return t("oauthPhaseWaiting");
      if (a.status === "pending") return t("oauthPhaseWaiting");
      return "";
    }

    function filteredMyAccounts() {
      const q = (($("contribFilterQ") && $("contribFilterQ").value) || "").trim().toLowerCase();
      const st = ($("contribFilterSt") && $("contribFilterSt").value) || "";
      const vis = ($("contribFilterVis") && $("contribFilterVis").value) || "";
      return myAccounts.filter((a) => {
        if (st && a.status !== st) return false;
        if (vis && accVisKey(a) !== vis) return false;
        if (!q) return true;
        return matchQ(a.name, q) || matchQ(a.id, q) || matchQ(a.lastError, q) || matchQ(myMembersLabel(a), q) || matchQ(a.oauth && a.oauth.lastMessage, q);
      });
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
      const list = filteredMyAccounts();
      if (!list.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("noLogs")) + "</div>";
        if ($("contribPager")) $("contribPager").innerHTML = "";
        return;
      }
      contribPage = renderPager($("contribPager"), contribPage, list.length, PAGE_SIZE, (pg) => { contribPage = pg; renderMyAccounts(); });
      const start = (contribPage - 1) * PAGE_SIZE;
      const slice = list.slice(start, start + PAGE_SIZE);
      tbody.innerHTML = slice.map((a) => {
        const err = a.lastError ? shortErr(a.lastError) : "";
        const phase = oauthPhaseLabel(a);
        const oauthMsg = (a.oauth && a.oauth.lastMessage) ? shortErr(a.oauth.lastMessage) : "";
        const membersTxt = myMembersLabel(a);
        const mCount = Array.isArray(a.members) ? a.members.length : 1;
        const canManual = a.status === "pending" || a.status === "error" || a.status === "expired" || (a.oauth && a.oauth.phase === "failed");
        const hasUrl = a.oauth && (a.oauth.verificationUriComplete || a.oauth.verificationUri);
        let acts = "";
        if (canManual && hasUrl) {
          acts += '<button class="btn btn-sm" type="button" data-act="c-open" data-id="' + esc(a.id) + '">' + esc(t("oauthOpenBrowser")) + "</button>";
        }
        if (canManual) {
          acts += '<button class="btn btn-secondary btn-sm" type="button" data-act="c-retry" data-id="' + esc(a.id) + '">' +
            esc(a.status === "expired" ? t("oauthReauth") : t("oauthRetry")) + "</button>";
        }
        if (a.status === "active" || a.status === "exhausted" || a.status === "expired") {
          acts += '<button class="btn btn-secondary btn-sm" type="button" data-act="c-members" data-id="' + esc(a.id) + '">' + esc(t("membersTitle")) + "</button>";
          acts += '<button class="btn btn-secondary btn-sm" type="button" data-act="c-credits" data-id="' + esc(a.id) + '">' + esc(t("credits")) + "</button>";
        }
        acts += '<button class="btn btn-danger btn-sm" type="button" data-act="c-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name || a.id) + '">' + esc(t("withdrawContrib")) + "</button>";
        return '<div class="dt-row">' +
          '<div><div class="name">' + esc(a.name) + '</div><div class="mono">' + esc(a.id) + "</div>" +
          (phase ? '<div class="oauth-phase">' + esc(phase) + (oauthMsg ? " · " + esc(oauthMsg) : "") + "</div>" : "") +
          (err && !oauthMsg ? '<div class="acc-err" title="' + esc(a.lastError) + '">' + esc(err) + "</div>" : "") +
          "</div>" +
          '<div><span class="badge ' + esc(a.status) + '">' + esc(a.status) + "</span></div>" +
          "<div>" + creditCell(a) + "</div>" +
          '<div class="mono">' + a.useCount + "</div>" +
          '<div title="' + esc(accVisHint(a)) + '"><span class="badge ' + accVisBadgeClass(a) + '">' + esc(accVisLabel(a)) + "</span></div>" +
          '<div class="members-cell" title="' + esc(membersTxt) + '">' +
          '<div class="mono">' + esc(t("membersCount", mCount)) + "</div>" +
          '<div class="members-preview">' + esc(membersTxt) + "</div>" +
          "</div>" +
          '<div class="dt-time">' + fmtTime(a.lastUsedAt) + "</div>" +
          '<div class="dt-actions">' + acts + "</div></div>";
      }).join("");
      tbody.querySelectorAll("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          if (act === "c-credits") checkMyCredits(id);
          if (act === "c-del") delMyAcc(id, btn.getAttribute("data-name") || id);
          if (act === "c-members") openMyMembers(id);
          if (act === "c-open") openPendingOAuth(id);
          if (act === "c-retry") retryPendingOAuth(id);
        });
      });
      paintRouteAccountSelect();
      ensureContribListWatch();
    }

    let myMembersAccId = null;
    let myMemberPick = new Set();
    let myMemberSearchHits = [];
    let myMemberSearchTimer = null;
    let myMemberSearchSeq = 0;

    function myMemberExistingIds() {
      const a = myAccounts.find((x) => x.id === myMembersAccId);
      const ids = new Set();
      if (!a) return ids;
      if (currentUser && currentUser.id) ids.add(currentUser.id);
      if (a.donorUserId) ids.add(a.donorUserId);
      for (const id of a.allowedUserIds || []) if (id) ids.add(id);
      for (const m of a.members || []) if (m && m.id) ids.add(m.id);
      return ids;
    }
    function syncMyMemberPickMeta() {
      const meta = $("myMembersAddMeta");
      if (!meta) return;
      const n = myMemberPick.size;
      meta.textContent = n ? t("memberAddPicked", n) : "";
    }
    function renderMyMemberSearchList() {
      const list = $("myMembersSearchList");
      const empty = $("myMembersSearchEmpty");
      if (!list) return;
      const q = (($("myMembersAddQ") && $("myMembersAddQ").value) || "").trim();
      if (!q) {
        list.innerHTML = "";
        list.classList.remove("has-items");
        if (empty) { empty.hidden = true; empty.textContent = ""; }
        return;
      }
      const existing = myMemberExistingIds();
      const hits = myMemberSearchHits.filter((u) => u && u.id && !existing.has(u.id));
      if (!hits.length) {
        list.innerHTML = "";
        list.classList.remove("has-items");
        if (empty) {
          empty.hidden = false;
          empty.textContent = t("memberAddNoHit");
        }
        return;
      }
      if (empty) { empty.hidden = true; empty.textContent = ""; }
      list.classList.add("has-items");
      list.innerHTML = hits.map((u) => {
        const on = myMemberPick.has(u.id);
        return '<label class="msel-opt' + (on ? " on" : "") + '">' +
          '<input type="checkbox" value="' + esc(u.id) + '"' + (on ? " checked" : "") + " />" +
          '<span class="msel-name">' + esc(userLabel(u)) + "</span>" +
          "</label>";
      }).join("");
      list.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.value;
          if (!id) return;
          if (cb.checked) myMemberPick.add(id);
          else myMemberPick.delete(id);
          const lab = cb.closest(".msel-opt");
          if (lab) lab.classList.toggle("on", cb.checked);
          syncMyMemberPickMeta();
        });
      });
    }
    async function runMyMemberSearch() {
      const q = (($("myMembersAddQ") && $("myMembersAddQ").value) || "").trim();
      if (!q) {
        myMemberSearchHits = [];
        renderMyMemberSearchList();
        return;
      }
      const seq = ++myMemberSearchSeq;
      try {
        const res = await fetch("/api/me/users/search?q=" + encodeURIComponent(q), { headers: headers() });
        const data = await res.json().catch(() => ({}));
        if (seq !== myMemberSearchSeq) return;
        if (!res.ok) throw new Error(data.error || res.statusText);
        myMemberSearchHits = data.users || [];
        // drop picks no longer in hits
        const hitIds = new Set(myMemberSearchHits.map((u) => u.id));
        for (const id of [...myMemberPick]) {
          if (!hitIds.has(id)) myMemberPick.delete(id);
        }
        renderMyMemberSearchList();
        syncMyMemberPickMeta();
      } catch (e) {
        if (seq !== myMemberSearchSeq) return;
        myMemberSearchHits = [];
        renderMyMemberSearchList();
        showMsg(null, e.message || String(e), "err");
      }
    }
    function scheduleMyMemberSearch() {
      if (myMemberSearchTimer) clearTimeout(myMemberSearchTimer);
      myMemberSearchTimer = setTimeout(() => { runMyMemberSearch(); }, 220);
    }
    function clearMyMemberPick() {
      myMemberPick = new Set();
      renderMyMemberSearchList();
      syncMyMemberPickMeta();
    }

    function openMyMembers(id) {
      const a = myAccounts.find((x) => x.id === id);
      if (!a) return;
      myMembersAccId = id;
      myMemberPick = new Set();
      myMemberSearchHits = [];
      if ($("myMembersAddQ")) $("myMembersAddQ").value = "";
      paintMyMembersModal(a);
      renderMyMemberSearchList();
      syncMyMemberPickMeta();
      if ($("myMembersModal")) $("myMembersModal").classList.add("show");
      applyI18n();
      setTimeout(() => { try { if ($("myMembersAddQ")) $("myMembersAddQ").focus(); } catch {} }, 0);
    }
    function paintMyMembersModal(a) {
      const members = Array.isArray(a.members) ? a.members : [];
      const body = $("myMembersBody");
      const title = $("myMembersTitle");
      if (title) title.textContent = t("membersTitle") + " · " + (a.name || a.id);
      const visKey = accVisKey(a);
      if ($("myMembersSub")) {
        $("myMembersSub").textContent =
          visKey === "public" ? t("membersSubPublic")
            : visKey === "private" ? t("membersSubPrivate")
            : t("membersSubRestricted");
      }
      if ($("myMembersVisSeg")) {
        $("myMembersVisSeg").querySelectorAll("button").forEach((b) => {
          b.classList.toggle("on", b.getAttribute("data-mvis") === visKey);
        });
      }
      if ($("myMembersVisHint")) {
        const hints = {
          public: t("visHintPublic"),
          private: t("visHintPrivate"),
          restricted: t("visHintRestricted"),
        };
        $("myMembersVisHint").textContent = hints[visKey] || "";
        $("myMembersVisHint").style.display = "";
      }
      if (body) {
        if (!members.length) {
          body.innerHTML = '<div class="allowed-empty">' + esc(t("membersNone")) + "</div>";
        } else {
          body.innerHTML = members.map((m) => {
            return '<div class="member-row' + (m.isDonor ? " donor" : "") + '">' +
              '<div class="member-main">' +
              '<div class="name">' + esc(m.username) + "</div>" +
              '<div class="mono">' + esc(m.id.slice(0, 10)) + (m.role === "admin" ? " · admin" : "") + "</div>" +
              "</div>" +
              (m.isDonor
                ? '<span class="badge current">' + esc(t("memberDonor")) + "</span>"
                : ('<button class="btn btn-danger btn-sm" type="button" data-revoke="' + esc(m.id) + '" data-name="' + esc(m.username) + '">' +
                  esc(t("memberRevoke")) + "</button>")) +
              "</div>";
          }).join("");
          body.querySelectorAll("button[data-revoke]").forEach((btn) => {
            btn.addEventListener("click", () => {
              revokeMyMember(btn.getAttribute("data-revoke"), btn.getAttribute("data-name") || "");
            });
          });
        }
      }
      renderMyMemberSearchList();
      syncMyMemberPickMeta();
    }
    function closeMyMembers() {
      myMembersAccId = null;
      myMemberPick = new Set();
      myMemberSearchHits = [];
      if (myMemberSearchTimer) { clearTimeout(myMemberSearchTimer); myMemberSearchTimer = null; }
      if ($("myMembersAddQ")) $("myMembersAddQ").value = "";
      if ($("myMembersModal")) $("myMembersModal").classList.remove("show");
    }
    async function addMyMembersSelected() {
      if (!myMembersAccId) return;
      const ids = [...myMemberPick].filter(Boolean);
      if (!ids.length) {
        showMsg(null, t("memberAddEmpty"), "err");
        return;
      }
      const existing = myMemberExistingIds();
      const addIds = ids.filter((id) => !existing.has(id));
      if (!addIds.length) {
        showMsg(null, t("memberAlready"), "err");
        return;
      }
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(myMembersAccId), {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ addUserIds: addIds }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        myMemberPick = new Set();
        if ($("myMembersAddQ")) $("myMembersAddQ").value = "";
        myMemberSearchHits = [];
        if (data.account) {
          const idx = myAccounts.findIndex((x) => x.id === myMembersAccId);
          if (idx >= 0) myAccounts[idx] = { ...myAccounts[idx], ...data.account };
        }
        await loadMyAccounts();
        const fresh = myAccounts.find((x) => x.id === myMembersAccId);
        if (fresh) paintMyMembersModal(fresh);
        else renderMyMemberSearchList();
        syncMyMemberPickMeta();
        showMsg(null, t("memberAddOk"), "ok");
      } catch (e) {
        showMsg(null, e.message || String(e), "err");
      }
    }
    /**
     * Three modes:
     * - public: private=false, clear allowlist → fully public pool
     * - private: private=true, clear allowlist → donor only
     * - restricted: keep (or require) allowlist; private=false (allowlist wins)
     */
    async function setMyMembersVis(mode) {
      if (!myMembersAccId) return;
      const a = myAccounts.find((x) => x.id === myMembersAccId);
      if (!a) return;
      const cur = accVisKey(a);
      if (mode === cur) return;
      const extras = Array.isArray(a.allowedUserIds) ? a.allowedUserIds.filter(Boolean) : [];
      const extraCount = extras.length || (Array.isArray(a.members) ? a.members.filter((m) => !m.isDonor).length : 0);

      let body;
      let okMsg;
      if (mode === "public") {
        if (extraCount > 0 && !(await confirmDialog(t("membersClearForPublic"), { danger: true }))) return;
        body = { private: false, allowedUserIds: null };
        okMsg = t("publicOk");
      } else if (mode === "private") {
        if (extraCount > 0 && !(await confirmDialog(t("membersClearForPrivate"), { danger: true }))) return;
        body = { private: true, allowedUserIds: null };
        okMsg = t("privateOk");
      } else if (mode === "restricted") {
        if (extraCount === 0) {
          showMsg(null, t("membersNeedExtras"), "err");
          if ($("myMembersAddQ")) $("myMembersAddQ").focus();
          renderMyMemberSearchList();
          return;
        }
        // keep existing allowlist; ensure not private so UI shows restricted
        body = { private: false };
        okMsg = t("restrictedOk");
      } else {
        return;
      }
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(myMembersAccId), {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgContrib"), okMsg, "ok");
        if (data.account) {
          const idx = myAccounts.findIndex((x) => x.id === myMembersAccId);
          if (idx >= 0) myAccounts[idx] = { ...myAccounts[idx], ...data.account };
        }
        await loadMyAccounts();
        const fresh = myAccounts.find((x) => x.id === myMembersAccId);
        if (fresh) paintMyMembersModal(fresh);
      } catch (e) {
        showMsg($("msgContrib"), e.message || String(e), "err");
      }
    }
    async function revokeMyMember(userId, name) {
      if (!myMembersAccId || !userId) return;
      if (!(await confirmDialog(t("memberRevokeConfirm", name || userId), { danger: true }))) return;
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(myMembersAccId), {
          method: "PATCH", headers: jsonHeaders(),
          body: JSON.stringify({ revokeUserIds: [userId] }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgContrib"), t("memberRevokeOk"), "ok");
        // merge response into list if present
        if (data.account) {
          const idx = myAccounts.findIndex((x) => x.id === myMembersAccId);
          if (idx >= 0) myAccounts[idx] = { ...myAccounts[idx], ...data.account };
        }
        await loadMyAccounts();
        const a = myAccounts.find((x) => x.id === myMembersAccId);
        if (a) paintMyMembersModal(a);
        else closeMyMembers();
      } catch (e) {
        showMsg($("msgContrib"), e.message || String(e), "err");
      }
    }

    async function loadMyAccounts() {
      try {
        const res = await fetch("/api/me/accounts", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        myAccounts = data.accounts || [];
        const st = data.stats || {};
        const contributed =
          st.contributed ??
          myAccounts.filter((a) => a.status !== "pending" && a.status !== "error" && a.hasRefresh).length;
        if ($("cTotal")) $("cTotal").textContent = contributed;
        if ($("cActive")) $("cActive").textContent = st.active ?? 0;
        if ($("cExhausted")) $("cExhausted").textContent = st.exhausted ?? 0;
        if ($("contribMineCount")) $("contribMineCount").textContent = t("lbSeats", contributed);
        if ($("ovMine")) $("ovMine").textContent = String(contributed);
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
        if ($("ovRank")) {
          $("ovRank").textContent = t("ovRankLine", data.me ? ("#" + data.me.rank) : "");
        }
      } catch {}
    }

    function paintLeaderboard(data) {
      if (!data) return;
      if ($("lbSummary")) {
        $("lbSummary").textContent = t(
          "lbSummary",
          data.totalContributors || 0,
          data.totalDonated || 0,
          data.totalPublic || 0,
          data.totalPrivate || 0,
        );
      }
      // total board me
      if (data.me) {
        if ($("lbMeRank")) $("lbMeRank").textContent = "#" + data.me.rank;
        if ($("lbMeMeta")) {
          $("lbMeMeta").textContent =
            data.me.username + " · " + t("lbSeats", data.me.count) +
            " (" + t("colPublic") + " " + (data.me.publicCount || 0) +
            " / " + t("colPrivate") + " " + (data.me.privateCount || 0) + ")";
        }
        if ($("lbMeCount")) $("lbMeCount").textContent = t("lbSeats", data.me.count);
      } else {
        if ($("lbMeRank")) $("lbMeRank").textContent = "–";
        if ($("lbMeMeta")) $("lbMeMeta").textContent = t("lbUnranked");
        if ($("lbMeCount")) $("lbMeCount").textContent = t("lbSeats", 0);
      }
      // public board me
      if (data.publicMe) {
        if ($("lbPubMeRank")) $("lbPubMeRank").textContent = "#" + data.publicMe.rank;
        if ($("lbPubMeMeta")) {
          $("lbPubMeMeta").textContent =
            data.publicMe.username + " · " + t("colPublic") + " " + (data.publicMe.publicCount || 0);
        }
        if ($("lbPubMeCount")) $("lbPubMeCount").textContent = t("lbSeats", data.publicMe.publicCount || 0);
      } else {
        if ($("lbPubMeRank")) $("lbPubMeRank").textContent = "–";
        if ($("lbPubMeMeta")) $("lbPubMeMeta").textContent = t("lbUnranked");
        if ($("lbPubMeCount")) $("lbPubMeCount").textContent = t("lbSeats", 0);
      }
      if ($("cRank")) $("cRank").textContent = data.me ? ("#" + data.me.rank) : t("contribRankUnranked");
      paintPodium($("lbPodium"), data.entries || [], "count");
      paintPodium($("lbPubPodium"), data.publicEntries || [], "publicCount");
      paintLbTable($("tbodyLb"), data.entries || [], "total");
      paintLbTable($("tbodyLbPub"), data.publicEntries || [], "public");
    }

    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        leaderboardData = data;
        paintLeaderboard(data);
      } catch {}
    }

    function paintPodium(el, entries, scoreKey) {
      if (!el) return;
      const key = scoreKey || "count";
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
        const score = key === "publicCount" ? (e.publicCount || 0) : e.count;
        return '<div class="pod ' + cls[i] + (e.isMe ? " me" : "") + '">' +
          '<div class="place">' + place[i] + '</div>' +
          '<div class="uname">' + esc(e.username) + (e.isMe ? ' · me' : '') + '</div>' +
          '<div class="cnt">' + score + '</div>' +
          '<div class="lbl">' + esc(key === "publicCount" ? t("colPublic") : t("colSeats")) +
          ' · ' + e.activeCount + ' ' + esc(t("statActive")).toLowerCase() + '</div>' +
          '</div>';
      }).join("");
    }

    function paintLbTable(tbody, entries, mode) {
      if (!tbody) return;
      if (!entries.length) {
        tbody.innerHTML = '<div class="dt-empty">' + esc(t("lbEmpty")) + "</div>";
        return;
      }
      tbody.innerHTML = entries.map((e) => {
        const rb = e.rank === 1 ? "top1" : e.rank === 2 ? "top2" : e.rank === 3 ? "top3" : "";
        if (mode === "public") {
          return '<div class="dt-row' + (e.isMe ? " me lb-row" : "") + '">' +
            '<div><span class="rank-badge ' + rb + '">#' + e.rank + "</span></div>" +
            '<div><div class="name">' + esc(e.username) + (e.isMe ? ' <span class="badge current">me</span>' : "") + '</div></div>' +
            '<div class="mono">' + (e.publicCount || 0) + "</div>" +
            '<div class="mono">' + e.activeCount + "</div>" +
            "</div>";
        }
        return '<div class="dt-row' + (e.isMe ? " me lb-row" : "") + '">' +
          '<div><span class="rank-badge ' + rb + '">#' + e.rank + "</span></div>" +
          '<div><div class="name">' + esc(e.username) + (e.isMe ? ' <span class="badge current">me</span>' : "") + '</div></div>' +
          '<div class="mono">' + e.count + "</div>" +
          '<div class="mono">' + (e.publicCount || 0) + "</div>" +
          '<div class="mono">' + (e.privateCount || 0) + "</div>" +
          '<div class="mono">' + e.activeCount + "</div>" +
          "</div>";
      }).join("");
    }

    function setContribBusy(busy) {
      if ($("btnContribAdd")) $("btnContribAdd").disabled = busy;
      if ($("btnContribStart")) $("btnContribStart").disabled = busy;
    }

    async function startContribute(opts) {
      opts = opts || {};
      const accountId = opts.accountId || undefined;
      hideMsg($("msgContrib"));
      stopContribPoll();
      setContribBusy(true);
      if ($("contribStage") && !accountId) $("contribStage").classList.remove("show");
      try {
        const body = {
          name: ($("contribName") && $("contribName").value) || undefined,
          openBrowser: false,
        };
        if (accountId) body.accountId = accountId;
        const res = await fetch("/api/me/accounts/oauth", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const url = data.verificationUriComplete || data.verificationUri;
        if ($("contribUserCode")) $("contribUserCode").textContent = data.userCode;
        if ($("contribVerifyLink")) {
          $("contribVerifyLink").textContent = data.verificationUri;
          $("contribVerifyLink").href = url;
        }
        if ($("contribPollStatus")) $("contribPollStatus").textContent = t("waiting");
        if ($("contribStage")) $("contribStage").classList.add("show");
        try { window.open(url, "_blank", "noopener,noreferrer"); } catch {}
        await loadMyAccounts();
        const sessionId = data.sessionId;
        contribPollTimer = setInterval(async () => {
          try {
            const pr = await fetch("/api/me/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
            const result = await pr.json().catch(() => ({}));
            await loadMyAccounts();
            if (result.ok) {
              stopContribPoll();
              if ($("contribStage")) $("contribStage").classList.remove("show");
              showMsg($("msgContrib"), t("contribOk") + ": " + (result.account?.name || result.account?.id), "ok");
              if ($("contribName")) $("contribName").value = "";
              setContribBusy(false);
              await Promise.all([loadMyAccounts(), loadLeaderboardLite()]);
              return;
            }
            if (result.pending) {
              if ($("contribPollStatus")) $("contribPollStatus").textContent = t("waiting") + " " + new Date().toLocaleTimeString();
              return;
            }
            stopContribPoll();
            setContribBusy(false);
            if (result.error) showMsg($("msgContrib"), result.error, "err");
          } catch {
            if ($("contribPollStatus")) $("contribPollStatus").textContent = t("waiting");
          }
        }, 2000);
      } catch (e) {
        showMsg($("msgContrib"), e.message, "err");
        setContribBusy(false);
      }
    }

    async function openPendingOAuth(id) {
      try {
        const res = await fetch("/api/me/accounts/" + encodeURIComponent(id) + "/oauth/open", {
          method: "POST", headers: headers(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        if (data.url) {
          try { window.open(data.url, "_blank", "noopener,noreferrer"); } catch {}
        }
        if (data.userCode && $("contribUserCode")) {
          $("contribUserCode").textContent = data.userCode;
          if ($("contribVerifyLink")) {
            $("contribVerifyLink").textContent = data.url || "";
            $("contribVerifyLink").href = data.url || "#";
          }
          if ($("contribStage")) $("contribStage").classList.add("show");
        }
        if (data.sessionId) {
          stopContribPoll();
          const sessionId = data.sessionId;
          contribPollTimer = setInterval(async () => {
            try {
              const pr = await fetch("/api/me/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
              const result = await pr.json().catch(() => ({}));
              await loadMyAccounts();
              if (result.ok) {
                stopContribPoll();
                if ($("contribStage")) $("contribStage").classList.remove("show");
                showMsg($("msgContrib"), t("contribOk") + ": " + (result.account?.name || result.account?.id), "ok");
                await loadLeaderboardLite();
              } else if (!result.pending) {
                stopContribPoll();
                if (result.error) showMsg($("msgContrib"), result.error, "err");
              }
            } catch {}
          }, 2000);
        }
        await loadMyAccounts();
      } catch (e) {
        showMsg($("msgContrib"), e.message || String(e), "err");
      }
    }

    async function retryPendingOAuth(id) {
      await startContribute({ accountId: id });
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
          body: JSON.stringify({ private: !!priv, allowedUserIds: null }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msgContrib"), priv ? t("privateOk") : t("publicOk"), "ok");
        await loadMyAccounts();
      } catch (e) { showMsg($("msgContrib"), e.message || String(e), "err"); }
    }

    let routeScope = "auto";

    function paintRouteScopeUI() {
      if (!$("routeScopeSeg")) return;
      $("routeScopeSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.rscope === routeScope));
      if ($("routeAccountWrap")) $("routeAccountWrap").style.display = routeScope === "account" ? "" : "none";
      if ($("routeScopeHint")) {
        $("routeScopeHint").textContent =
          routeScope === "mine" ? t("routeMineHint") :
          routeScope === "account" ? t("routeAccountHint") :
          routeScope === "public" ? t("routePublicHint") : t("routeAutoHint");
      }
    }

    function paintRouteAccountSelect() {
      const sel = $("routeAccountSel");
      if (!sel) return;
      const cur = sel.value || (currentUser && currentUser.routeAccountId) || "";
      const opts = myAccounts.filter((a) => a.status === "active" || a.status === "exhausted");
      sel.innerHTML = opts.map((a) =>
        '<option value="' + esc(a.id) + '"' + (a.id === cur ? " selected" : "") + ">" +
        esc(a.name) + (accVisKey(a) !== "public" ? " · " + accVisLabel(a) : "") + "</option>"
      ).join("") || '<option value="">–</option>';
    }

    async function loadMyRouting() {
      try {
        const res = await fetch("/api/me/routing", { headers: headers() });
        if (!res.ok) return;
        const data = await res.json();
        routeScope = data.routeScope || "auto";
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
      if (!(await confirmDialog(t("withdrawContribConfirm", name || id), { danger: true }))) return;
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
        const donorUserId = ($("accDonor") && $("accDonor").value) || null;
        const isPrivate = $("accPrivate") && $("accPrivate").value === "private";
        const res = await fetch("/api/admin/accounts/oauth", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({
            name: $("accName").value || undefined,
            openBrowser: true,
            donorUserId: donorUserId || undefined,
            private: isPrivate,
          }),
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
              $("accName").value = "";
              if ($("accDonor")) $("accDonor").value = "";
              if ($("accPrivate")) $("accPrivate").value = "public";
              $("btnAdd").disabled = false; await loadAccounts(); return;
            }
            if (result.pending) { $("pollStatus").textContent = t("waiting") + " " + new Date().toLocaleTimeString(); return; }
            stopPoll(); $("btnAdd").disabled = false; showMsg($("msg"), result.error || "failed", "err");
          } catch { $("pollStatus").textContent = t("waiting"); }
        }, 2000);
      } catch (e) {
        showMsg($("msg"), e.message, "err"); $("btnAdd").disabled = false;
      }
    }

    async function reauthAdminAcc(id) {
      hideMsg($("msg")); stopPoll();
      if ($("btnAdd")) $("btnAdd").disabled = true;
      $("codeBox").classList.remove("show");
      try {
        const acc = allAccounts.find((a) => a.id === id);
        const res = await fetch("/api/admin/accounts/oauth", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({
            accountId: id,
            name: acc?.name,
            openBrowser: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        const url = data.verificationUriComplete || data.verificationUri;
        $("userCode").textContent = data.userCode;
        $("verifyLink").textContent = data.verificationUri;
        $("verifyLink").href = url;
        $("pollStatus").textContent = t("waiting");
        $("codeBox").classList.add("show");
        await loadAccounts();
        const sessionId = data.sessionId;
        pollTimer = setInterval(async () => {
          try {
            const pr = await fetch("/api/admin/accounts/oauth/poll?sessionId=" + encodeURIComponent(sessionId), { headers: headers() });
            const result = await pr.json();
            if (result.ok) {
              stopPoll(); $("codeBox").classList.remove("show");
              showMsg($("msg"), t("addOk") + ": " + (result.account?.name || result.account?.id), "ok");
              if ($("btnAdd")) $("btnAdd").disabled = false;
              await loadAccounts();
              return;
            }
            if (result.pending) {
              $("pollStatus").textContent = t("waiting") + " " + new Date().toLocaleTimeString();
              return;
            }
            stopPoll();
            if ($("btnAdd")) $("btnAdd").disabled = false;
            showMsg($("msg"), result.error || "failed", "err");
            await loadAccounts();
          } catch {
            $("pollStatus").textContent = t("waiting");
          }
        }, 2000);
      } catch (e) {
        showMsg($("msg"), e.message || String(e), "err");
        if ($("btnAdd")) $("btnAdd").disabled = false;
        await loadAccounts();
      }
    }

    async function useAcc(id) {
      try {
        const acc = allAccounts.find((a) => a.id === id);
        if (acc && (acc.status === "pending" || !acc.hasRefresh)) {
          throw new Error(t("usePendingBlocked"));
        }
        if (acc && acc.status !== "active") {
          throw new Error(t("useNotActiveBlocked"));
        }
        if (acc && accIsPrivate(acc)) throw new Error(t("usePrivateBlocked"));
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
      if (!(await confirmDialog(t("confirmDelete") + " · " + id, { danger: true }))) return;
      await fetch("/api/admin/accounts/" + id, { method: "DELETE", headers: headers() });
      await loadAccounts();
    }

    async function refreshAccProfile(id) {
      try {
        const res = await fetch("/api/admin/accounts/" + encodeURIComponent(id) + "/profile", {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify({ rename: true }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || res.statusText);
        showMsg($("msg"), t("accSyncNameOk") + (data.account?.name ? ": " + data.account.name : ""), "ok");
        await loadAccounts();
      } catch (e) {
        showMsg($("msg"), e.message || String(e), "err");
      }
    }
    async function resetAcc(id) {
      await fetch("/api/admin/accounts/" + id + "/reset", { method: "POST", headers: headers() });
      await loadAccounts();
    }

    let keyEditId = null;

    function openKeyModal() {
      keyEditId = null;
      $("keyModal").classList.add("show");
      $("keyForm").style.display = "block"; $("keyReveal").style.display = "none";
      $("keySubmit").style.display = "";
      $("keyAlias").value = ""; $("keyDays").value = ""; $("keyNote").value = "";
      if ($("keyModalTitle")) $("keyModalTitle").textContent = t("createKey");
      if ($("keyModalSub")) $("keyModalSub").textContent = t("keyOnce");
      if ($("keySubmit")) $("keySubmit").textContent = t("create");
      applyI18n();
    }
    function openKeyEdit(id) {
      const k = allKeys.find((x) => x.id === id);
      if (!k) return;
      keyEditId = id;
      $("keyModal").classList.add("show");
      $("keyForm").style.display = "block"; $("keyReveal").style.display = "none";
      $("keySubmit").style.display = "";
      $("keyAlias").value = k.alias || "";
      $("keyNote").value = k.note || "";
      if (k.expiresAt) {
        const days = Math.max(1, Math.ceil((k.expiresAt - Date.now()) / 86400_000));
        $("keyDays").value = String(days);
      } else {
        $("keyDays").value = "";
      }
      if ($("keyModalTitle")) $("keyModalTitle").textContent = t("editKeyTitle");
      if ($("keyModalSub")) $("keyModalSub").textContent = t("editKeySub");
      if ($("keySubmit")) $("keySubmit").textContent = t("save");
    }
    function closeKeyModal() { keyEditId = null; $("keyModal").classList.remove("show"); }
    if ($("btnCreateKey")) $("btnCreateKey").onclick = openKeyModal;
    if ($("confirmOk")) $("confirmOk").onclick = () => closeConfirm(true);
    if ($("confirmCancel")) $("confirmCancel").onclick = () => closeConfirm(false);
    if ($("confirmModal")) {
      $("confirmModal").addEventListener("click", (e) => {
        if (e.target === $("confirmModal")) closeConfirm(false);
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("confirmModal") && $("confirmModal").classList.contains("show")) {
        e.preventDefault();
        closeConfirm(false);
      }
    });
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
    if ($("pwdCancel")) $("pwdCancel").onclick = closePwdModal;
    if ($("pwdModal")) $("pwdModal").addEventListener("click", (e) => { if (e.target === $("pwdModal")) closePwdModal(); });
    if ($("pwdSubmit")) $("pwdSubmit").onclick = async () => {
      if (!pwdEditId) return;
      try {
        const p1 = ($("pwdInput").value || "");
        const p2 = ($("pwdInput2").value || "");
        if (p1.length < 6) throw new Error(t("resetPwdHint"));
        if (p1 !== p2) throw new Error(t("resetPwdMismatch"));
        const res = await fetch("/api/admin/users/" + pwdEditId, {
          method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ password: p1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        closePwdModal();
        showMsg($("msgUsers"), t("resetPwdOk"), "ok");
      } catch (e) { showMsg($("msgUsers"), e.message, "err"); }
    };
    if ($("nameCancel")) $("nameCancel").onclick = closeNameModal;
    if ($("nameModal")) $("nameModal").addEventListener("click", (e) => { if (e.target === $("nameModal")) closeNameModal(); });
    if ($("nameSubmit")) $("nameSubmit").onclick = async () => {
      if (!nameEditId) return;
      try {
        const name = (($("nameInput") && $("nameInput").value) || "").trim();
        if (!name) throw new Error(t("renameUserEmpty"));
        const res = await fetch("/api/admin/users/" + nameEditId, {
          method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ username: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        closeNameModal();
        if (data.user && currentUser && data.user.id === currentUser.id) {
          currentUser = { ...currentUser, username: data.user.username };
          if ($("userName")) $("userName").textContent = data.user.username;
          if ($("userAvatar")) {
            const ch = String(data.user.username || "?").trim().charAt(0) || "?";
            $("userAvatar").textContent = ch.toUpperCase();
          }
        }
        showMsg($("msgUsers"), t("renameUserOk"), "ok");
        await loadUsers();
      } catch (e) { showMsg($("msgUsers"), e.message, "err"); }
    };
    if ($("keySubmit")) $("keySubmit").onclick = async () => {
      try {
        const daysRaw = $("keyDays").value.trim();
        const days = daysRaw === "" ? null : Number(daysRaw);
        const body = {
          alias: $("keyAlias").value || undefined,
          note: $("keyNote").value || undefined,
          expiresInDays: days,
        };
        if (keyEditId) {
          const res = await fetch(apiKeysPath() + "/" + encodeURIComponent(keyEditId), {
            method: "PATCH", headers: jsonHeaders(),
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || res.statusText);
          closeKeyModal();
          showMsg($("msgKeys"), t("keyUpdated"), "ok");
          await loadKeys();
          return;
        }
        const res = await fetch(apiKeysPath(), {
          method: "POST", headers: jsonHeaders(),
          body: JSON.stringify(body),
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
      if (!(await confirmDialog(t("confirmDelete") + " · " + id, { danger: true }))) return;
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

    function toggleTopMenu(menuId, btnId) {
      const menu = $(menuId);
      if (!menu) return;
      const open = !menu.classList.contains("open");
      closeTopMenus();
      if (!open) return;
      menu.classList.add("open");
      const pop = menu.querySelector(".tb-pop");
      if (pop) pop.hidden = false;
      if ($(btnId)) $(btnId).setAttribute("aria-expanded", "true");
    }
    if ($("btnLang")) $("btnLang").onclick = (e) => {
      e.stopPropagation();
      toggleTopMenu("langMenu", "btnLang");
    };
    if ($("userChip")) $("userChip").onclick = (e) => {
      e.stopPropagation();
      toggleTopMenu("userMenu", "userChip");
    };
    if ($("langPop")) $("langPop").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (!b) return;
      lang = b.dataset.lang;
      localStorage.setItem("grok_api_lang", lang);
      closeTopMenus();
      applyI18n();
      paintCurl();
      if (lastUsageStats) {
        if (view === "usage") paintCharts(lastUsageStats);
        if (view === "overview") paintOverviewChart(lastUsageStats);
      }
      if (leaderboardData) paintLeaderboard(leaderboardData);
      renderAccounts();
      renderKeys();
      renderMyAccounts();
      renderLogs(lastLogItems);
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest(".tb-menu")) return;
      closeTopMenus();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeTopMenus();
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
          body: JSON.stringify({
            upstreamBaseUrl: ($("upstreamUrl") && $("upstreamUrl").value.trim()) || "",
            oauthBaseUrl: ($("oauthBaseUrl") && $("oauthBaseUrl").value.trim()) || "",
            billingBaseUrl: ($("billingBaseUrl") && $("billingBaseUrl").value.trim()) || "",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.upstreamBaseUrlConfigured = data.settings.upstreamBaseUrl || "";
        meta.xaiBaseUrl = data.xaiBaseUrl || data.settings.upstreamBaseUrl || meta.xaiBaseUrl;
        meta.oauthBaseUrlConfigured = data.settings.oauthBaseUrl || "";
        meta.oauthBaseUrl = data.oauthBaseUrl || data.settings.oauthBaseUrl || meta.oauthBaseUrl;
        meta.billingBaseUrlConfigured = data.settings.billingBaseUrl || "";
        meta.billingBaseUrl = data.billingBaseUrl || data.settings.billingBaseUrl || meta.billingBaseUrl;
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
            logBodiesOnError: $("logBodiesOnError") ? $("logBodiesOnError").checked : true,
            logRetentionDays: Number($("logRetention").value) || 7,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);
        meta.logEnabled = data.settings.logEnabled;
        meta.logBodies = data.settings.logBodies === true;
        meta.logBodiesOnError = data.settings.logBodiesOnError !== false;
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
      const b = e.target.closest("button[data-range]");
      if (!b) return;
      usageRange = b.getAttribute("data-range") || "24h";
      // sensible default granularity when switching range
      if (usageRange === "1h") {
        // 1h defaults to 5m; user may switch to 1m manually
        if (usageGran === "auto" || usageGran === "hour" || usageGran === "day") usageGran = "5m";
      } else if (usageGran === "minute" || usageGran === "5m") {
        // fine buckets only make sense on short windows
        if (usageRange === "6h" || usageRange === "24h" || usageRange === "7d" || usageRange === "30d") {
          usageGran = "auto";
        }
      } else if (usageGran === "day" && (usageRange === "1h" || usageRange === "6h")) {
        usageGran = "auto";
      }
      loadUsage();
    });
    if ($("granSeg")) $("granSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-gran]");
      if (!b) return;
      usageGran = b.getAttribute("data-gran") || "auto";
      loadUsage();
    });
    if ($("logDay")) $("logDay").onchange = () => { logPage = 1; loadLogs(); };
    if ($("logOk")) $("logOk").onchange = () => { logPage = 1; loadLogs(); };
    if ($("btnLogRefresh")) $("btnLogRefresh").onclick = () => loadLogs();
    if ($("btnLogStrip")) $("btnLogStrip").onclick = async () => {
      if (!(await confirmDialog(t("stripLogsConfirm"), { danger: true }))) return;
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
      if (!(await confirmDialog(t("clearLogsConfirm"), { danger: true }))) return;
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
    if ($("accEditCancel")) $("accEditCancel").onclick = closeAccEdit;
    if ($("accEditSubmit")) $("accEditSubmit").onclick = saveAccEdit;
    if ($("myMembersClose")) $("myMembersClose").onclick = closeMyMembers;
    if ($("myMembersModal")) $("myMembersModal").addEventListener("click", (e) => {
      if (e.target === $("myMembersModal")) closeMyMembers();
    });
    if ($("myMembersAddBtn")) $("myMembersAddBtn").onclick = () => { addMyMembersSelected(); };
    if ($("myMembersAddClear")) $("myMembersAddClear").onclick = (e) => {
      e.preventDefault();
      clearMyMemberPick();
    };
    if ($("myMembersAddQ")) {
      $("myMembersAddQ").addEventListener("input", () => { scheduleMyMemberSearch(); });
      $("myMembersAddQ").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (myMemberPick.size) addMyMembersSelected();
          else runMyMemberSearch();
        }
      });
    }
    if ($("myMembersVisSeg")) {
      $("myMembersVisSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-mvis]");
        if (!b) return;
        const v = b.getAttribute("data-mvis");
        if (v === "public" || v === "private" || v === "restricted") setMyMembersVis(v);
      });
    }
    if ($("accEditDonor")) {
      $("accEditDonor").addEventListener("change", () => {
        allowedDonorId = $("accEditDonor").value || null;
        if (allowedDonorId) allowedSelected.delete(allowedDonorId);
        renderAllowedList();
        syncAllowedCount();
      });
    }
    if ($("accEditAllowedClear")) $("accEditAllowedClear").onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearAllowedSelection();
    };
    if ($("accEditAllowedBtn")) $("accEditAllowedBtn").onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleAllowedPanel();
    };
    if ($("accEditAllowedQ")) {
      $("accEditAllowedQ").addEventListener("input", () => {
        allowedFilterQ = $("accEditAllowedQ").value || "";
        renderAllowedList();
      });
      $("accEditAllowedQ").addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeAllowedPanel();
        }
      });
    }
    if (!window.__mselDocBound) {
      window.__mselDocBound = true;
      document.addEventListener("click", (e) => {
        const root = $("accEditAllowed");
        const panel = $("accEditAllowedPanel");
        if (!root || !root.classList.contains("open")) return;
        const t = e.target;
        if (root.contains(t) || (panel && panel.contains(t))) return;
        closeAllowedPanel();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllowedPanel();
      });
    }
    if ($("accModal")) $("accModal").addEventListener("click", (e) => { if (e.target === $("accModal")) closeAccEdit(); });
    if ($("btnContribAdd")) $("btnContribAdd").onclick = () => startContribute();
    if ($("btnContribStart")) $("btnContribStart").onclick = () => startContribute();
    if ($("btnContribRefresh")) $("btnContribRefresh").onclick = () => { hideMsg($("msgContrib")); loadMyAccounts(); loadMyRouting(); loadLeaderboardLite(); };
    if ($("routeScopeSeg")) $("routeScopeSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-rscope]");
      if (!b) return;
      routeScope = b.dataset.rscope || "auto";
      paintRouteScopeUI();
    });
    if ($("btnSaveRoute")) $("btnSaveRoute").onclick = () => saveMyRouting();
    function bindFilter(id, fn) {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => { fn(); });
      el.addEventListener("change", () => { fn(); });
    }
    bindFilter("accFilterQ", () => { accPage = 1; renderAccounts(); });
    bindFilter("accFilterSt", () => { accPage = 1; renderAccounts(); });
    bindFilter("accFilterVis", () => { accPage = 1; renderAccounts(); });
    bindFilter("keyFilterQ", () => { keyPage = 1; renderKeys(); });
    bindFilter("keyFilterSt", () => { keyPage = 1; renderKeys(); });
    bindFilter("userFilterQ", () => loadUsers());
    bindFilter("userFilterRole", () => loadUsers());
    bindFilter("userFilterSt", () => loadUsers());
    bindFilter("contribFilterQ", () => { contribPage = 1; renderMyAccounts(); });
    bindFilter("contribFilterSt", () => { contribPage = 1; renderMyAccounts(); });
    bindFilter("contribFilterVis", () => { contribPage = 1; renderMyAccounts(); });
    let logSearchTimer = null;
    bindFilter("logFilterQ", () => {
      logPage = 1;
      if (logSearchTimer) clearTimeout(logSearchTimer);
      logSearchTimer = setTimeout(() => { loadLogs(); }, 250);
    });
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
    if ($("btnLogout")) $("btnLogout").onclick = logout;

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
