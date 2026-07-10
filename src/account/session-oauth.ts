/**
 * Headless browser automation for xAI device OAuth using a web session JWT.
 * Injects session cookie → opens verification URL → clicks authorize.
 * Does not solve Turnstile; if challenge appears, fails and user can manual OAuth.
 */
import type { Browser, Page } from "playwright";
import { setOAuthAutomationPhase } from "./oauth.js";

export type SessionAutoResult =
  | { ok: true }
  | { ok: false; error: string; needsManual?: boolean };

function parseSessionToken(raw: string): { jwt: string; email?: string } {
  const s = raw.trim();
  if (!s) throw new Error("session token 为空");
  // email|password|jwt  or plain jwt
  const parts = s.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3 && parts[parts.length - 1]!.startsWith("eyJ")) {
    return { jwt: parts[parts.length - 1]!, email: parts[0] };
  }
  if (parts.length === 1 && parts[0]!.startsWith("eyJ")) {
    return { jwt: parts[0]! };
  }
  if (s.startsWith("eyJ")) return { jwt: s };
  throw new Error("无法识别 session token（需 JWT 或以 email|pass|jwt 格式）");
}

async function injectSession(page: Page, jwt: string): Promise<void> {
  // Common cookie names used by xAI / accounts portals (best-effort)
  const names = ["sso", "session", "auth_token", "token", "__session"];
  const domains = [".x.ai", "accounts.x.ai", "auth.x.ai", ".accounts.x.ai"];
  const cookies = [];
  for (const domain of domains) {
    for (const name of names) {
      cookies.push({
        name,
        value: jwt,
        domain,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax" as const,
      });
    }
  }
  // Primary cookie name observed on accounts.x.ai session JWTs
  cookies.push({
    name: "sso-session",
    value: jwt,
    domain: ".x.ai",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax" as const,
  });
  cookies.push({
    name: "sso-session",
    value: jwt,
    domain: "accounts.x.ai",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax" as const,
  });
  await page.context().addCookies(cookies);
}

async function tryClickAuthorize(page: Page): Promise<boolean> {
  const selectors = [
    'button:has-text("Authorize")',
    'button:has-text("Allow")',
    'button:has-text("Continue")',
    'button:has-text("Confirm")',
    'button:has-text("授权")',
    'button:has-text("允许")',
    'button:has-text("继续")',
    'button[type="submit"]',
    'input[type="submit"]',
  ];
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.isVisible({ timeout: 800 }).catch(() => false)) {
        await loc.click({ timeout: 3000 });
        return true;
      }
    } catch {
      // try next
    }
  }
  return false;
}

function looksLikeChallenge(pageUrl: string, bodyText: string): boolean {
  const u = pageUrl.toLowerCase();
  const t = bodyText.toLowerCase();
  return (
    u.includes("challenge") ||
    t.includes("turnstile") ||
    t.includes("cf-turnstile") ||
    t.includes("verify you are human") ||
    t.includes("checking your browser")
  );
}

export async function runSessionOAuthAutomation(opts: {
  accountId: string;
  sessionToken: string;
  verificationUrl: string;
  headless?: boolean;
}): Promise<SessionAutoResult> {
  const { jwt } = parseSessionToken(opts.sessionToken);
  const url = opts.verificationUrl;
  if (!url) return { ok: false, error: "缺少 verification URL", needsManual: true };

  await setOAuthAutomationPhase(opts.accountId, "automating", "启动浏览器自动化…");

  let playwright: typeof import("playwright");
  try {
    playwright = await import("playwright");
  } catch {
    const msg = "未安装 playwright，请执行: npm i playwright && npx playwright install chromium";
    await setOAuthAutomationPhase(opts.accountId, "failed", msg);
    return { ok: false, error: msg, needsManual: true };
  }

  let browser: Browser | null = null;
  try {
    browser = await playwright.chromium.launch({
      headless: opts.headless !== false,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    await setOAuthAutomationPhase(opts.accountId, "automating", "注入 session…");
    await injectSession(page, jwt);

    await setOAuthAutomationPhase(opts.accountId, "automating", "打开授权页…");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(1500);

    const bodyText = (await page.locator("body").innerText().catch(() => "")) || "";
    if (looksLikeChallenge(page.url(), bodyText)) {
      const msg = "遇到 Cloudflare 验证，需手动授权";
      await setOAuthAutomationPhase(opts.accountId, "failed", msg);
      return { ok: false, error: msg, needsManual: true };
    }

    // Still on sign-in → session invalid
    if (/sign-in|login|log-in/i.test(page.url()) || /sign in|log in/i.test(bodyText.slice(0, 500))) {
      const msg = "session 无效或已过期，请手动登录授权";
      await setOAuthAutomationPhase(opts.accountId, "failed", msg);
      return { ok: false, error: msg, needsManual: true };
    }

    await setOAuthAutomationPhase(opts.accountId, "automating", "尝试点击授权…");
    const clicked = await tryClickAuthorize(page);
    if (!clicked) {
      // Maybe already authorized / code-only page — wait a bit for poller
      await page.waitForTimeout(2000);
      const msg = "未找到授权按钮，请手动打开链接完成授权";
      await setOAuthAutomationPhase(opts.accountId, "waiting_user", msg);
      return { ok: false, error: msg, needsManual: true };
    }

    await page.waitForTimeout(2500);
    await setOAuthAutomationPhase(
      opts.accountId,
      "waiting_user",
      "已点击授权，等待 token 交换…",
    );
    // Device poller will activate the seat; automation only drives the browser.
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await setOAuthAutomationPhase(opts.accountId, "failed", msg);
    return { ok: false, error: msg, needsManual: true };
  } finally {
    try {
      await browser?.close();
    } catch {
      // ignore
    }
  }
}

/** Fire-and-forget wrapper for API handlers */
export function enqueueSessionOAuth(opts: {
  accountId: string;
  sessionToken: string;
  verificationUrl: string;
}): void {
  void runSessionOAuthAutomation(opts).catch(async (e) => {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      await setOAuthAutomationPhase(opts.accountId, "failed", msg);
    } catch {
      // ignore
    }
  });
}
