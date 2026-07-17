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
const testBtn = $("test");
const saveBtn = $("save");
const tokenInput = $("token");
const toggleTokenBtn = $("toggleToken");

let busy = false;
let tokenVisible = false;

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

function setBusy(on, activeId) {
  busy = !!on;
  for (const btn of [testBtn, saveBtn, toggleTokenBtn]) {
    if (!btn) continue;
    const isActive = on && btn.id === activeId;
    btn.disabled = on;
    btn.classList.toggle("busy", isActive);
  }
  $("baseUrl").disabled = on;
  tokenInput.disabled = on;
  $("seatNamePrefix").disabled = on;
  $("defaultContribute").disabled = on;
  $("whitelist").disabled = on;
  document.querySelectorAll('input[name="panelMode"]').forEach((el) => {
    el.disabled = on;
  });
}

function setTokenVisible(next) {
  tokenVisible = !!next;
  tokenInput.type = tokenVisible ? "text" : "password";
  toggleTokenBtn.setAttribute("aria-pressed", tokenVisible ? "true" : "false");
  toggleTokenBtn.title = tokenVisible ? "隐藏密钥" : "显示密钥";
  toggleTokenBtn.setAttribute("aria-label", tokenVisible ? "隐藏密钥" : "显示密钥");
  toggleTokenBtn.textContent = tokenVisible ? "隐藏" : "显示";
}

function renderConnStatus(opts) {
  const base = opts.baseUrl || "http://127.0.0.1:8787";
  const hasKey = !!String(opts.token || "").trim();
  const state = opts.state || (hasKey ? "ready" : "empty");
  const sub = opts.sub || "";
  let pillClass = "status-pill";
  let dotClass = "dot";
  let main = base;

  if (state === "testing") {
    pillClass += " testing";
    dotClass += " busy";
    main = base + " · 测试中";
  } else if (state === "ok") {
    pillClass += " ok";
    dotClass += " on";
    main = base + " · 连接成功";
  } else if (state === "err") {
    pillClass += " err";
    dotClass += " err";
    main = base + " · 连接失败";
  } else if (state === "saving") {
    pillClass += " testing";
    dotClass += " busy";
    main = base + " · 保存中";
  } else if (hasKey) {
    pillClass += "";
    dotClass += " on";
    main = base + " · 已配置密钥";
  } else {
    pillClass += " warn";
    dotClass += " warn";
    main = base + " · 未配置密钥";
  }

  connStatus.innerHTML =
    '<div class="' +
    pillClass +
    '"><span class="' +
    dotClass +
    '"></span><span class="text">' +
    escapeHtml(main) +
    (sub ? '<span class="sub">' + escapeHtml(sub) + "</span>" : "") +
    "</span></div>";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  tokenInput.value = r.token || "";
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
  setTokenVisible(false);
  renderConnStatus({ baseUrl: $("baseUrl").value, token: tokenInput.value });
}

async function save(opts = {}) {
  const silent = !!opts.silent;
  const baseUrl = String($("baseUrl").value || "").trim().replace(/\/+$/, "");
  let whitelist = parseWhitelist($("whitelist").value);
  if (!whitelist.length) whitelist = [...DEFAULT_WHITELIST];
  whitelist = ensureDefaultHosts(whitelist);
  const payload = {
    baseUrl: baseUrl || "http://127.0.0.1:8787",
    authMode: "token",
    token: String(tokenInput.value || "").trim(),
    username: "",
    password: "",
    seatNamePrefix: String($("seatNamePrefix").value || "").trim() || "ext",
    defaultContribute: $("defaultContribute").checked,
    panelMode: panelMode(),
    whitelist,
  };

  if (!silent) {
    setBusy(true, "save");
    renderConnStatus({ ...payload, state: "saving", sub: "正在写入本机扩展存储…" });
    setMsg("正在保存配置…", "info");
  }

  try {
    await chrome.storage.local.set(payload);
    $("whitelist").value = whitelist.join("\n");
    if (!silent) {
      renderConnStatus(payload);
      setMsg("已保存。密钥与白名单仅存本机，页面内 SSO 会立即生效。", "ok");
    } else {
      renderConnStatus(payload);
    }
    return payload;
  } finally {
    if (!silent) setBusy(false);
  }
}

async function testConn() {
  if (busy) return;
  setBusy(true, "test");
  setMsg("1/3 保存配置…", "info");
  renderConnStatus({
    baseUrl: $("baseUrl").value,
    token: tokenInput.value,
    state: "testing",
    sub: "1/3 保存本机配置",
  });

  try {
    const payload = await save({ silent: true });
    if (!String(payload.token || "").trim()) {
      throw new Error("请先填写密钥（gk_...，需绑定用户）");
    }

    setMsg("2/3 请求 /api/auth/me …", "info");
    renderConnStatus({
      ...payload,
      state: "testing",
      sub: "2/3 校验密钥 · GET /api/auth/me",
    });

    const res = await chrome.runtime.sendMessage({ type: "grokapi-test" });
    if (!res?.ok) throw new Error(res?.error || "连接失败");

    const who = res.username || "?";
    const mode =
      res.auth === "api_key" ? "密钥鉴权" : res.auth === "session" ? "会话鉴权" : "密钥鉴权";
    const detail = who + " · " + mode;

    setMsg("3/3 连接成功 · " + detail, "ok");
    renderConnStatus({
      ...payload,
      state: "ok",
      sub: detail,
    });

    const cur = await chrome.storage.local.get(["token", "baseUrl"]);
    if (cur.token) tokenInput.value = cur.token;
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    setMsg(err, "err");
    renderConnStatus({
      baseUrl: $("baseUrl").value,
      token: tokenInput.value,
      state: "err",
      sub: err,
    });
  } finally {
    setBusy(false);
  }
}

toggleTokenBtn.addEventListener("click", () => {
  if (busy) return;
  setTokenVisible(!tokenVisible);
});

saveBtn.addEventListener("click", () => {
  if (busy) return;
  save().catch((e) => {
    setBusy(false);
    setMsg(e.message || String(e), "err");
  });
});

testBtn.addEventListener("click", () => {
  testConn();
});

tokenInput.addEventListener("input", () => {
  if (busy) return;
  renderConnStatus({
    baseUrl: $("baseUrl").value,
    token: tokenInput.value,
  });
});

$("baseUrl").addEventListener("input", () => {
  if (busy) return;
  renderConnStatus({
    baseUrl: $("baseUrl").value,
    token: tokenInput.value,
  });
});

load().catch((e) => setMsg(e.message || String(e), "err"));
