#!/usr/bin/env node
/**
 * Paste xAI/Grok SSO JWT → open temporary real Chrome/Edge window.
 * Uses your installed Chrome/Edge binary. Close the window to exit (no profile kept).
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

function candidates(kind) {
  const local = process.env.LOCALAPPDATA || "";
  if (kind === "edge") {
    return [
      process.env.EDGE_PATH,
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "/usr/bin/microsoft-edge",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ].filter(Boolean);
  }
  return [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(local, "Google", "Chrome", "Application", "chrome.exe"),
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
}

const DEFAULT_COOKIE_NAMES = [
  "sso",
  "sso_token",
  "ssoToken",
  "session",
  "session_id",
  "sessionId",
  "auth_token",
  "authToken",
  "token",
  "jwt",
  "access_token",
];

const DEFAULT_DOMAINS = [
  ".x.ai",
  "x.ai",
  "accounts.x.ai",
  "auth.x.ai",
  ".grok.com",
  "grok.com",
  "www.grok.com",
];

function findBrowser(kind) {
  for (const p of candidates(kind)) {
    if (existsSync(p)) return p;
  }
  return null;
}

function extractSso(raw) {
  const text = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!text) return "";
  if (text.includes("|")) {
    const jwt = text.split("|").map((s) => s.trim()).find((p) => p.startsWith("eyJ"));
    if (jwt) return jwt;
  }
  if (text.includes("----")) {
    const jwt = text.split("----").map((s) => s.trim()).find((p) => p.startsWith("eyJ"));
    if (jwt) return jwt;
  }
  const m = text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  if (m) return m[0];
  return text;
}

function decodeJwtPayload(jwt) {
  try {
    const mid = jwt.split(".")[1];
    if (!mid) return null;
    const json = Buffer.from(mid.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const out = {
    sso: "",
    url: process.env.SSO_URL || "https://grok.com",
    browser: (process.env.SSO_BROWSER || "chrome").toLowerCase(),
    cookieNames: process.env.SSO_COOKIE_NAME
      ? [process.env.SSO_COOKIE_NAME]
      : [...DEFAULT_COOKIE_NAMES],
    domains: [...DEFAULT_DOMAINS],
    help: false,
  };
  for (const a of argv) {
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--browser=edge" || a === "--edge") out.browser = "edge";
    else if (a === "--browser=chrome" || a === "--chrome") out.browser = "chrome";
    else if (a.startsWith("--browser=")) out.browser = a.slice(10).toLowerCase();
    else if (a.startsWith("--url=")) out.url = a.slice(6);
    else if (a.startsWith("--cookie=")) out.cookieNames = [a.slice(9)];
    else if (a.startsWith("--domain=")) out.domains = [a.slice(9)];
    else if (!a.startsWith("-")) out.sso = a;
  }
  return out;
}

function buildCookies(sso, names, domains) {
  const expires = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  const payload = decodeJwtPayload(sso);
  const sid = payload && (payload.session_id || payload.sid || payload.sessionId);
  const values = [sso];
  if (sid) values.push(String(sid));

  const cookies = [];
  for (const domain of domains) {
    for (const name of names) {
      for (const value of values) {
        cookies.push({
          name,
          value,
          domain,
          path: "/",
          expires,
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        });
      }
    }
  }
  const seen = new Set();
  return cookies.filter((c) => {
    const k = `${c.domain}\0${c.name}\0${c.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function readSsoInteractive() {
  const rl = createInterface({ input, output });
  try {
    console.log("粘贴 SSO JWT（或 邮箱|密码|sso|时间 整行），回车确认：");
    return await rl.question("> ");
  } finally {
    rl.close();
  }
}

function printHelp() {
  console.log(`用法:
  cd tools/sso-browser && npm start
  node open.mjs <sso或整行>
  node open.mjs --browser=edge --url=https://accounts.x.ai
  node open.mjs --cookie=实际Cookie名

关掉浏览器窗口即退出，不保留登录数据。`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  let raw = args.sso;
  if (!raw) raw = await readSsoInteractive();
  const sso = extractSso(raw);
  if (!sso || sso.length < 20) {
    console.error("未识别到有效 SSO（需要 eyJ 开头的 JWT）");
    process.exit(1);
  }

  const payload = decodeJwtPayload(sso);
  if (payload) {
    console.log(`[sso] payload keys: ${Object.keys(payload).slice(0, 10).join(", ") || "(empty)"}`);
    if (payload.session_id) console.log(`[sso] session_id: ${String(payload.session_id).slice(0, 8)}…`);
  }

  const kind = args.browser === "edge" || args.browser === "msedge" ? "edge" : "chrome";
  const executablePath = findBrowser(kind);
  if (!executablePath) {
    console.error(`未找到本机 ${kind === "edge" ? "Edge" : "Chrome"}，请安装或设置 CHROME_PATH / EDGE_PATH`);
    process.exit(1);
  }

  console.log(`[browser] ${executablePath}`);
  console.log(`[open] ${args.url}`);
  console.log("[tip] 关闭浏览器窗口后自动退出（无持久化）");

  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: [
      "--new-window",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-sync",
      "--disable-features=TranslateUI",
    ],
  });

  const context = await browser.newContext({ viewport: null, locale: "zh-CN" });
  try {
    await context.addCookies(buildCookies(sso, args.cookieNames, args.domains));
  } catch (e) {
    console.warn("[warn] addCookies:", e instanceof Error ? e.message : e);
  }

  const page = await context.newPage();
  for (const u of ["https://accounts.x.ai/", "https://auth.x.ai/"]) {
    try {
      await page.goto(u, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch {
      /* warm */
    }
  }
  try {
    await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch {
    console.warn("[warn] 打开目标页超时，可在窗口内手动地址栏导航");
  }

  console.log("[ready] 临时窗口已打开。若未登录，在 DevTools → Application → Cookies 看真实 Cookie 名：");
  console.log("        node open.mjs --cookie=名字 <sso>");

  await new Promise((resolve) => browser.on("disconnected", resolve));
  try {
    await context.close();
  } catch {
    /* ignore */
  }
  console.log("[done] 已关闭");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
