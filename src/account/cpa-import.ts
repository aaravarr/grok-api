/**
 * Parse Sub2API / CPA Grok account JSON into local token seats.
 *
 * Supported shapes (single or array, or wrapped):
 * 1) Sub2API credentials object:
 *    {
 *      access_token, refresh_token, expires_at, email, client_id, ...
 *    }
 * 2) Sub2API export payload:
 *    { type:"sub2api-data"|..., accounts:[{ name, platform, type, credentials }] }
 * 3) { credentials: {...} } / { account: {...} } / { data: { accounts: [...] } }
 * 4) Raw refresh_token / rt string (single token)
 */

export interface CpaCredentialDraft {
  /** Display name hint */
  name?: string;
  access?: string;
  refresh: string;
  /** epoch ms */
  expires: number;
  email?: string | null;
  xaiUsername?: string | null;
  note?: string;
  raw?: Record<string, unknown>;
}

export interface CpaParseResult {
  items: CpaCredentialDraft[];
  skipped: Array<{ index: number; reason: string; name?: string }>;
}

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function pickStr(obj: Obj, keys: string[]): string {
  for (const k of keys) {
    const s = asStr(obj[k]);
    if (s) return s;
  }
  return "";
}

/** Parse expires_at / expires / expires_in into epoch ms. */
export function parseExpiresMs(input: unknown, nowMs = Date.now()): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    // seconds vs ms
    if (input > 1e12) return Math.floor(input);
    if (input > 1e9) return Math.floor(input * 1000);
    // small number: treat as expires_in seconds
    if (input > 0) return nowMs + Math.floor(input * 1000);
    return 0;
  }
  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return 0;
    if (/^\d+(\.\d+)?$/.test(s)) return parseExpiresMs(Number(s), nowMs);
    const t = Date.parse(s);
    if (Number.isFinite(t)) return t;
  }
  return 0;
}

function looksLikeCredentials(obj: Obj): boolean {
  const refresh =
    pickStr(obj, ["refresh_token", "refreshToken", "rt", "refresh"]) ||
    (isObj(obj.tokens) ? pickStr(obj.tokens as Obj, ["refresh", "refresh_token", "refreshToken"]) : "");
  const access =
    pickStr(obj, ["access_token", "accessToken", "access", "token"]) ||
    (isObj(obj.tokens) ? pickStr(obj.tokens as Obj, ["access", "access_token", "accessToken"]) : "");
  // sub2api credentials always have at least one token field
  return Boolean(refresh || access);
}

function draftFromCredentials(obj: Obj, nameHint?: string): CpaCredentialDraft | { error: string } {
  // Nested tokens: { tokens: { access, refresh, expires } } (our local shape)
  const tokens = isObj(obj.tokens) ? (obj.tokens as Obj) : null;
  const credentials = isObj(obj.credentials) ? (obj.credentials as Obj) : obj;

  const refresh =
    pickStr(credentials, ["refresh_token", "refreshToken", "rt", "refresh"]) ||
    (tokens ? pickStr(tokens, ["refresh", "refresh_token", "refreshToken"]) : "");
  const access =
    pickStr(credentials, ["access_token", "accessToken", "access", "token"]) ||
    (tokens ? pickStr(tokens, ["access", "access_token", "accessToken"]) : "");

  if (!refresh && !access) {
    return { error: "缺少 refresh_token / access_token" };
  }
  // Prefer refresh for long-lived seats; access-only is allowed but expires soon
  if (!refresh) {
    // access-only: still import, but mark short-lived
  }

  let expires =
    parseExpiresMs(credentials.expires_at ?? credentials.expiresAt ?? credentials.expires) ||
    (tokens ? parseExpiresMs(tokens.expires ?? tokens.expires_at) : 0);
  if (!expires) {
    const expIn = credentials.expires_in ?? credentials.expiresIn;
    expires = parseExpiresMs(expIn);
  }
  if (!expires && access) {
    // default access TTL 1h if unknown
    expires = Date.now() + 3600_000;
  }

  const email =
    pickStr(credentials, ["email"]) ||
    pickStr(obj, ["email"]) ||
    null;
  const xaiUsername =
    pickStr(credentials, ["preferred_username", "username", "xaiUsername", "name"]) ||
    pickStr(obj, ["xaiUsername", "username"]) ||
    null;

  const name =
    nameHint ||
    pickStr(obj, ["name"]) ||
    email ||
    xaiUsername ||
    undefined;

  const noteParts: string[] = [];
  const tier = pickStr(credentials, ["subscription_tier", "subscriptionTier"]);
  const ent = pickStr(credentials, ["entitlement_status", "entitlementStatus"]);
  if (tier) noteParts.push("tier=" + tier);
  if (ent) noteParts.push("entitlement=" + ent);
  const baseUrl = pickStr(credentials, ["base_url", "baseUrl"]);
  if (baseUrl) noteParts.push("base_url=" + baseUrl);

  return {
    name: name || undefined,
    access: access || "",
    refresh: refresh || "",
    expires: expires || 0,
    email: email || null,
    xaiUsername: xaiUsername && xaiUsername.includes("@") ? null : xaiUsername || null,
    note: noteParts.length ? noteParts.join(" · ") : undefined,
    raw: credentials,
  };
}

function pushAccountLike(
  node: unknown,
  out: CpaCredentialDraft[],
  skipped: CpaParseResult["skipped"],
  indexBase: number,
  nameHint?: string,
): void {
  if (typeof node === "string") {
    const token = node.trim();
    if (!token) {
      skipped.push({ index: indexBase, reason: "空字符串" });
      return;
    }
    // raw refresh token paste
    out.push({
      name: nameHint,
      access: "",
      refresh: token,
      expires: 0,
    });
    return;
  }
  if (!isObj(node)) {
    skipped.push({ index: indexBase, reason: "非对象" });
    return;
  }

  // Sub2API DataAccount
  if (isObj(node.credentials) || looksLikeCredentials(node)) {
    const platform = asStr(node.platform).toLowerCase();
    if (platform && platform !== "grok" && platform !== "xai" && platform !== "x.ai") {
      skipped.push({
        index: indexBase,
        reason: `跳过非 Grok 平台: ${platform || "?"}`,
        name: asStr(node.name) || undefined,
      });
      return;
    }
    const draft = draftFromCredentials(
      isObj(node.credentials) ? { ...node, ...(node.credentials as Obj), credentials: node.credentials } : node,
      nameHint || asStr(node.name) || undefined,
    );
    if ("error" in draft) {
      skipped.push({ index: indexBase, reason: draft.error, name: asStr(node.name) || undefined });
      return;
    }
    // prefer account-level name
    if (!draft.name && asStr(node.name)) draft.name = asStr(node.name);
    if (!draft.note && asStr(node.notes)) draft.note = asStr(node.notes);
    out.push(draft);
    return;
  }

  skipped.push({ index: indexBase, reason: "无法识别的账号结构", name: asStr(node.name) || undefined });
}

function unwrapRoot(input: unknown): unknown {
  if (!isObj(input)) return input;
  // { data: DataPayload }
  if (isObj(input.data) && (Array.isArray((input.data as Obj).accounts) || isObj((input.data as Obj).credentials))) {
    return input.data;
  }
  // { account: {...} }
  if (isObj(input.account)) return input.account;
  // { accounts: [...] }
  if (Array.isArray(input.accounts)) return input;
  // { credentials: {...} }
  if (isObj(input.credentials)) return input;
  return input;
}

/**
 * Parse free-form CPA / Sub2API Grok JSON text or already-parsed value.
 */
export function parseCpaGrokJson(input: unknown): CpaParseResult {
  let value = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (!text) return { items: [], skipped: [{ index: 0, reason: "空内容" }] };
    // allow raw token without JSON
    if (!text.startsWith("{") && !text.startsWith("[")) {
      return {
        items: [{ access: "", refresh: text, expires: 0 }],
        skipped: [],
      };
    }
    try {
      value = JSON.parse(text);
    } catch (e) {
      return {
        items: [],
        skipped: [{ index: 0, reason: "JSON 解析失败: " + (e instanceof Error ? e.message : String(e)) }],
      };
    }
  }

  value = unwrapRoot(value);
  const items: CpaCredentialDraft[] = [];
  const skipped: CpaParseResult["skipped"] = [];

  if (Array.isArray(value)) {
    value.forEach((node, i) => pushAccountLike(node, items, skipped, i));
    return { items, skipped };
  }

  if (isObj(value) && Array.isArray(value.accounts)) {
    // only grok-ish accounts; still try each
    (value.accounts as unknown[]).forEach((node, i) => pushAccountLike(node, items, skipped, i));
    return { items, skipped };
  }

  if (isObj(value)) {
    pushAccountLike(value, items, skipped, 0);
    return { items, skipped };
  }

  return { items: [], skipped: [{ index: 0, reason: "不支持的 JSON 根类型" }] };
}
