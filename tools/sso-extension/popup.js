const DEFAULT_WHITELIST = [
  "x.ai",
  "accounts.x.ai",
  "auth.x.ai",
  "grok.com",
  "www.grok.com",
  "pay.ldxp.cn",
  "ldxp.cn",
];

const $ = (id) => document.getElementById(id);
const msg = $("msg");
const connStatus = $("connStatus");

function setMsg(text, kind) {
  msg.textContent = text || "";
  msg.className = kind || "";
}

function panelMode() {
  return [...document.querySelectorAll('input[name="panelMode"]')].find((el) => el.checked)?.value || "whitelist";
}

function parseWhitelist(raw) {
  return String(raw || "")
    .split(/[\n,;]+/)
    .map((s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .replace(/^\*\./, ""),
    )
    .filter(Boolean);
}

function ensureDefaultHosts(list) {
  const set = new Set(list.map((x) => String(x).toLowerCase()));
  for (const d of ["pay.ldxp.cn", "ldxp.cn"]) {
    if (!set.has(d)) {
      if (set.has("x.ai") || set.has("grok.com") || set.has("accounts.x.ai") || set.has("pay.ldxp.cn")) {
        set.add(d);
      }
    }
  }
  return [...set];
}

function renderConnStatus(r) {
  const base = r.baseUrl || "http://127.0.0.1:8787";
  const hasKey = !!String(r.token || "").trim();
  const auth = hasKey ? "已配置密钥" : "未配置密钥";
  connStatus.innerHTML =
    '<div class="status-pill"><span class="dot ' +
    (hasKey ? "on" : "warn") +
    '"></span><span>' +
    base +
    " · " +
    auth +
    "</span></div>";
}

async function load() {
  const r = await chrome.storage.local.get([
    "baseUrl",
    "token",
    "seatNamePrefix",
    "defaultContribute",
    "panelMode",
    "whitelist",
  ]);
  $("baseUrl").value = r.baseUrl || "http://127.0.0.1:8787";
  $("token").value = r.token || "";
  $("seatNamePrefix").value = r.seatNamePrefix || "ext";
  $("defaultContribute").checked = r.defaultContribute !== false;
  const pm = r.panelMode === "all" ? "all" : "whitelist";
  document.querySelectorAll('input[name="panelMode"]').forEach((el) => {
    el.checked = el.value === pm;
  });
  let list = Array.isArray(r.whitelist) && r.whitelist.length ? r.whitelist : DEFAULT_WHITELIST;
  list = ensureDefaultHosts(list);
  if (JSON.stringify(list) !== JSON.stringify(r.whitelist || [])) {
    await chrome.storage.local.set({ whitelist: list });
  }
  $("whitelist").value = list.join("\n");
  renderConnStatus({ baseUrl: $("baseUrl").value, token: $("token").value });
}

async function save() {
  const baseUrl = String($("baseUrl").value || "").trim().replace(/\/+$/, "");
  let whitelist = parseWhitelist($("whitelist").value);
  if (!whitelist.length) whitelist = [...DEFAULT_WHITELIST];
  whitelist = ensureDefaultHosts(whitelist);
  const payload = {
    baseUrl: baseUrl || "http://127.0.0.1:8787",
    authMode: "token",
    token: String($("token").value || "").trim(),
    // clear legacy password fields
    username: "",
    password: "",
    seatNamePrefix: String($("seatNamePrefix").value || "").trim() || "ext",
    defaultContribute: $("defaultContribute").checked,
    panelMode: panelMode(),
    whitelist,
  };
  await chrome.storage.local.set(payload);
  $("whitelist").value = whitelist.join("\n");
  renderConnStatus(payload);
  setMsg("已保存。密钥与白名单仅存本机，页面内 SSO 会立即生效。", "ok");
  return payload;
}

async function testConn() {
  setMsg("测试连接中…");
  await save();
  try {
    const res = await chrome.runtime.sendMessage({ type: "grokapi-test" });
    if (!res?.ok) throw new Error(res?.error || "连接失败");
    setMsg(
      "连接成功 · " +
        (res.username || "?") +
        (res.auth === "api_key" ? " · 密钥鉴权" : res.auth === "session" ? " · 会话鉴权" : " · 密钥鉴权"),
      "ok",
    );
    const cur = await chrome.storage.local.get(["token", "baseUrl"]);
    if (cur.token) $("token").value = cur.token;
    renderConnStatus(cur);
  } catch (e) {
    setMsg(e instanceof Error ? e.message : String(e), "err");
  }
}

$("save").addEventListener("click", () => save().catch((e) => setMsg(e.message || String(e), "err")));
$("test").addEventListener("click", () => testConn());
load().catch((e) => setMsg(e.message || String(e), "err"));
