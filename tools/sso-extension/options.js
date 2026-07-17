const DEFAULT_WHITELIST = [
  "x.ai",
  "accounts.x.ai",
  "auth.x.ai",
  "grok.com",
  "www.grok.com",
];

const $ = (id) => document.getElementById(id);
const msg = $("msg");

function setMsg(text, kind) {
  msg.textContent = text || "";
  msg.className = kind || "";
}

function authMode() {
  return [...document.querySelectorAll('input[name="authMode"]')].find((el) => el.checked)?.value || "token";
}

function panelMode() {
  return [...document.querySelectorAll('input[name="panelMode"]')].find((el) => el.checked)?.value || "whitelist";
}

function syncAuthBoxes() {
  const mode = authMode();
  $("boxToken").hidden = mode !== "token";
  $("boxPassword").hidden = mode !== "password";
}

async function load() {
  const r = await chrome.storage.local.get([
    "baseUrl",
    "authMode",
    "token",
    "username",
    "password",
    "seatNamePrefix",
    "defaultContribute",
    "panelMode",
    "whitelist",
  ]);
  $("baseUrl").value = r.baseUrl || "http://127.0.0.1:8787";
  const mode = r.authMode === "password" ? "password" : "token";
  document.querySelectorAll('input[name="authMode"]').forEach((el) => {
    el.checked = el.value === mode;
  });
  $("token").value = r.token || "";
  $("username").value = r.username || "";
  $("password").value = r.password || "";
  $("seatNamePrefix").value = r.seatNamePrefix || "ext";
  $("defaultContribute").checked = r.defaultContribute !== false;
  const pm = r.panelMode === "all" ? "all" : "whitelist";
  document.querySelectorAll('input[name="panelMode"]').forEach((el) => {
    el.checked = el.value === pm;
  });
  const list = Array.isArray(r.whitelist) && r.whitelist.length ? r.whitelist : DEFAULT_WHITELIST;
  $("whitelist").value = list.join(", ");
  syncAuthBoxes();
}

async function save() {
  const baseUrl = String($("baseUrl").value || "").trim().replace(/\/+$/, "");
  const whitelist = String($("whitelist").value || "")
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^\*\./, ""))
    .filter(Boolean);
  await chrome.storage.local.set({
    baseUrl: baseUrl || "http://127.0.0.1:8787",
    authMode: authMode(),
    token: String($("token").value || "").trim(),
    username: String($("username").value || "").trim(),
    password: String($("password").value || ""),
    seatNamePrefix: String($("seatNamePrefix").value || "").trim() || "ext",
    defaultContribute: $("defaultContribute").checked,
    panelMode: panelMode(),
    whitelist: whitelist.length ? whitelist : DEFAULT_WHITELIST,
  });
  setMsg("已保存", "ok");
}

async function testConn() {
  setMsg("测试中…");
  await save();
  try {
    const res = await chrome.runtime.sendMessage({ type: "grokapi-test" });
    if (!res?.ok) throw new Error(res?.error || "连接失败");
    setMsg(`连接成功：${res.username || "?"}（${res.auth || "auth"}）`, "ok");
    if (res.tokenPreview) {
      // token may have been refreshed via password login
      const cur = await chrome.storage.local.get(["token"]);
      if (cur.token) $("token").value = cur.token;
    }
  } catch (e) {
    setMsg(e instanceof Error ? e.message : String(e), "err");
  }
}

document.querySelectorAll('input[name="authMode"]').forEach((el) => el.addEventListener("change", syncAuthBoxes));
$("save").addEventListener("click", () => save().catch((e) => setMsg(e.message || String(e), "err")));
$("test").addEventListener("click", () => testConn());
load().catch((e) => setMsg(e.message || String(e), "err"));
