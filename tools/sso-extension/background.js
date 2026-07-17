/** xAI official cookie names: https://x.ai/legal/cookie-policy
 *  sso     — Login, 4 weeks
 *  sso-rw  — Security, 4 weeks
 *
 *  v1.3.0:
 *  - only write domain cookies (.x.ai / .grok.com)
 *  - clear stale host-only cookies that shadow domain cookies
 *  - verify value match + report diagnostics
 *  - do NOT land on /sign-in (login form ignores session)
 */

const AUTH_COOKIE_NAMES = ["sso", "sso-rw"];

/** Domain cookies only — avoid host-only duplicates that shadow .x.ai */
const AUTH_DOMAINS = [".x.ai", ".grok.com"];

const CLEAR_URLS = [
  "https://x.ai/",
  "https://accounts.x.ai/",
  "https://auth.x.ai/",
  "https://console.x.ai/",
  "https://grok.com/",
  "https://www.grok.com/",
];

const DEFAULT_WHITELIST = [
  "x.ai",
  "accounts.x.ai",
  "auth.x.ai",
  "grok.com",
  "www.grok.com",
];

function extractSso(raw) {
  const text = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!text) return "";
  if (text.includes("|")) {
    const jwt = text
      .split("|")
      .map((s) => s.trim())
      .find((p) => p.startsWith("eyJ"));
    if (jwt) return jwt;
  }
  if (text.includes("----")) {
    const jwt = text
      .split("----")
      .map((s) => s.trim())
      .find((p) => p.startsWith("eyJ"));
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
    const b64 = mid.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    return JSON.parse(atob(b64 + pad));
  } catch {
    return null;
  }
}

function shortVal(v) {
  const s = String(v || "");
  if (s.length <= 16) return s;
  return s.slice(0, 8) + "…" + s.slice(-6);
}

function buildCookieSpecs(sso, names, domains) {
  const expirationDate = Math.floor(Date.now() / 1000) + 28 * 24 * 3600;
  const specs = [];
  for (const domain of domains) {
    for (const name of names) {
      specs.push({
        name,
        value: sso,
        domain,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "no_restriction",
        expirationDate,
      });
    }
  }
  return specs;
}

async function removeCookieSafe(cookie) {
  const host = cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain;
  const protocol = cookie.secure ? "https:" : "http:";
  const url = `${protocol}//${host}${cookie.path || "/"}`;
  try {
    await chrome.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId });
  } catch {
    /* ignore */
  }
}

async function clearAuthCookies(names) {
  let removed = 0;
  // getAll by name across all domains we care about
  for (const name of names) {
    try {
      const list = await chrome.cookies.getAll({ name });
      for (const c of list) {
        const d = String(c.domain || "").toLowerCase();
        if (
          d === "x.ai" ||
          d.endsWith(".x.ai") ||
          d === ".x.ai" ||
          d === "grok.com" ||
          d.endsWith(".grok.com") ||
          d === ".grok.com"
        ) {
          await removeCookieSafe(c);
          removed += 1;
        }
      }
    } catch {
      /* ignore */
    }
  }
  // also try remove by url+name for stubborn host-only
  for (const url of CLEAR_URLS) {
    for (const name of names) {
      try {
        const r = await chrome.cookies.remove({ url, name });
        if (r) removed += 1;
      } catch {
        /* ignore */
      }
    }
  }
  return removed;
}

async function setOneCookie(spec) {
  const host = spec.domain.startsWith(".") ? spec.domain.slice(1) : spec.domain;
  const url = `https://${host}/`;

  const attempts = [
    { sameSite: "no_restriction", secure: true, httpOnly: true },
    { sameSite: "lax", secure: true, httpOnly: true },
    { sameSite: "lax", secure: true, httpOnly: false },
  ];

  let lastErr = "unknown";
  for (const a of attempts) {
    try {
      const details = {
        url,
        name: spec.name,
        value: spec.value,
        domain: spec.domain,
        path: spec.path || "/",
        secure: a.secure,
        httpOnly: a.httpOnly,
        sameSite: a.sameSite,
        expirationDate: spec.expirationDate,
      };
      const result = await chrome.cookies.set(details);
      if (result && result.value === spec.value) {
        return { cookie: result, mode: `${a.sameSite}/httpOnly=${a.httpOnly}` };
      }
      lastErr = result ? "value mismatch after set" : "cookies.set returned null";
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(lastErr);
}

async function verifyCookies(names, expectedValue) {
  const checks = [];
  const urls = ["https://accounts.x.ai/", "https://grok.com/", "https://x.ai/"];
  for (const url of urls) {
    for (const name of names) {
      try {
        const c = await chrome.cookies.get({ url, name });
        if (!c) {
          checks.push({ url, name, ok: false, reason: "missing" });
          continue;
        }
        const match = c.value === expectedValue;
        checks.push({
          url,
          name,
          ok: match,
          reason: match ? "ok" : "value_mismatch",
          domain: c.domain,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          secure: c.secure,
          valuePreview: shortVal(c.value),
        });
      } catch (e) {
        checks.push({
          url,
          name,
          ok: false,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }
  return checks;
}

async function getPanelSettings() {
  const r = await chrome.storage.local.get(["panelMode", "whitelist"]);
  const mode = r.panelMode === "all" || r.panelMode === "whitelist" ? r.panelMode : "whitelist";
  let whitelist = Array.isArray(r.whitelist)
    ? r.whitelist.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean)
    : [];
  if (!whitelist.length) whitelist = [...DEFAULT_WHITELIST];
  return { mode, whitelist };
}

function hostAllowed(hostname, whitelist) {
  const h = String(hostname || "").toLowerCase().replace(/\.$/, "");
  if (!h) return false;
  for (const raw of whitelist) {
    const w = String(raw || "")
      .toLowerCase()
      .replace(/^\*\./, "")
      .replace(/^\./, "")
      .replace(/\/.*$/, "")
      .trim();
    if (!w) continue;
    if (h === w || h.endsWith("." + w)) return true;
  }
  return false;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "get-panel-settings") {
    getPanelSettings()
      .then((s) => sendResponse({ ok: true, ...s }))
      .catch((e) => sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) }));
    return true;
  }

  if (msg.type === "should-show-panel") {
    getPanelSettings()
      .then((s) => {
        if (s.mode === "all") {
          sendResponse({ ok: true, show: true, mode: s.mode, whitelist: s.whitelist });
          return;
        }
        const host = String(msg.host || "").toLowerCase();
        sendResponse({
          ok: true,
          show: hostAllowed(host, s.whitelist),
          mode: s.mode,
          whitelist: s.whitelist,
        });
      })
      .catch((e) =>
        sendResponse({
          ok: false,
          show: false,
          error: e instanceof Error ? e.message : String(e),
        }),
      );
    return true;
  }

  if (msg.type === "sso-login") {
    (async () => {
      try {
        const sso = extractSso(msg.sso);
        if (!sso || sso.length < 20) {
          sendResponse({ ok: false, error: "未识别到有效 SSO JWT（需 eyJ 开头）" });
          return;
        }
        if (!sso.startsWith("eyJ")) {
          sendResponse({ ok: false, error: "SSO 应为 JWT（eyJ…），不是 session_id 原文" });
          return;
        }

        const onlyName = (msg.cookieName || "").trim();
        const names = onlyName ? [onlyName] : [...AUTH_COOKIE_NAMES];
        if (onlyName === "sso" && !names.includes("sso-rw")) names.push("sso-rw");

        const removed = await clearAuthCookies(names);
        const specs = buildCookieSpecs(sso, names, AUTH_DOMAINS);

        let ok = 0;
        let fail = 0;
        const setList = [];
        const errors = [];
        for (const spec of specs) {
          try {
            const r = await setOneCookie(spec);
            ok += 1;
            setList.push(`${spec.name}@${spec.domain} (${r.mode})`);
          } catch (e) {
            fail += 1;
            if (errors.length < 6) {
              errors.push(`${spec.name}@${spec.domain}: ${e instanceof Error ? e.message : String(e)}`);
            }
          }
        }

        const checks = await verifyCookies(names, sso);
        const verifiedOk = checks.filter((c) => c.ok);
        const accountsOk = verifiedOk.some((c) => c.url.includes("accounts.x.ai"));
        const grokOk = verifiedOk.some((c) => c.url.includes("grok.com"));

        await chrome.storage.local.set({
          lastCookieName: onlyName || "",
          lastUsedAt: Date.now(),
          lastValuePreview: shortVal(sso),
        });

        const payload = decodeJwtPayload(sso);
        const success = ok > 0 && verifiedOk.length > 0;

        sendResponse({
          ok: success,
          set: ok,
          fail,
          removed,
          verified: verifiedOk.map((c) => `${c.name}@${c.url.replace(/^https:\/\//, "").replace(/\/$/, "")}`),
          checks,
          setList,
          accountsOk,
          grokOk,
          valuePreview: shortVal(sso),
          error: success
            ? undefined
            : ok === 0
              ? errors.join("; ") || "全部 Cookie 写入失败"
              : "Cookie 已写入但读回不匹配，请检查扩展权限后重新加载扩展",
          sessionId: payload && payload.session_id ? String(payload.session_id) : undefined,
          // content script uses this
          redirectUrl: "https://grok.com/",
        });
      } catch (e) {
        sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    })();
    return true;
  }

  if (msg.type === "sso-diagnose") {
    (async () => {
      try {
        const names = AUTH_COOKIE_NAMES;
        const out = [];
        for (const name of names) {
          const list = await chrome.cookies.getAll({ name });
          for (const c of list) {
            out.push({
              name: c.name,
              domain: c.domain,
              path: c.path,
              httpOnly: c.httpOnly,
              secure: c.secure,
              sameSite: c.sameSite,
              valuePreview: shortVal(c.value),
              expirationDate: c.expirationDate,
            });
          }
        }
        sendResponse({ ok: true, cookies: out });
      } catch (e) {
        sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    })();
    return true;
  }
});
