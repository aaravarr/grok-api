const DEFAULT_WHITELIST = [
  "x.ai",
  "accounts.x.ai",
  "auth.x.ai",
  "grok.com",
  "www.grok.com",
];

const modeRadios = [...document.querySelectorAll('input[name="mode"]')];
const whitelistEl = document.getElementById("whitelist");
const saveBtn = document.getElementById("save");
const msg = document.getElementById("msg");

function setMsg(text, err) {
  msg.textContent = text || "";
  msg.className = err ? "err" : "";
}

async function load() {
  const r = await chrome.storage.local.get(["panelMode", "whitelist"]);
  const mode = r.panelMode === "all" ? "all" : "whitelist";
  modeRadios.forEach((el) => {
    el.checked = el.value === mode;
  });
  const list = Array.isArray(r.whitelist) && r.whitelist.length ? r.whitelist : DEFAULT_WHITELIST;
  whitelistEl.value = list.join("\n");
}

saveBtn.addEventListener("click", async () => {
  const mode = modeRadios.find((el) => el.checked)?.value || "whitelist";
  const whitelist = whitelistEl.value
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^\*\./, ""))
    .filter(Boolean);
  await chrome.storage.local.set({
    panelMode: mode,
    whitelist: whitelist.length ? whitelist : DEFAULT_WHITELIST,
  });
  setMsg("已保存。已打开的页面会立即更新显示。");
});

load().catch((e) => setMsg(e instanceof Error ? e.message : String(e), true));
