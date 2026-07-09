import { applyProxy } from "../src/proxy.ts";
import { readFileSync, writeFileSync } from "fs";

applyProxy();
const d = JSON.parse(readFileSync("./data/accounts.json", "utf8"));
const a = d.accounts?.find((x: any) => x.status === "active") || d.accounts?.[0];
const token = a.tokens.access;
const h = {
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "User-Agent": "grok-api/1.0",
  "Content-Type": "application/json",
};

const teamsRes = await fetch("https://management-api.x.ai/auth/teams", { headers: h });
const teams = await teamsRes.json();
console.log("TEAMS", JSON.stringify(teams, null, 2).slice(0, 4000));
const teamId = teams.teams?.[0]?.teamId || teams.teams?.[0]?.team_id;
console.log("teamId", teamId);

const me = await (await fetch("https://api.x.ai/v1/me", { headers: h })).json();
console.log("ME", JSON.stringify(me));

const bases = ["https://management-api.x.ai", "https://api.x.ai"];
const paths = [
  "/auth/teams",
  "/auth/me",
  "/auth/user",
  "/auth/session",
  "/v1/teams",
  "/v1/billing",
  "/v1/billing/balance",
  "/v1/billing/usage",
  "/v1/billing/subscription",
  "/v1/billing/credits",
  "/v1/usage",
  "/v1/usage/summary",
  "/v1/credits",
  "/v1/balance",
  "/v1/subscriptions",
  "/v1/subscription",
  "/v1/limits",
  "/v1/quotas",
  "/v1/entitlements",
  "/v1/features",
  "/v1/api-keys",
  "/billing",
  "/billing/usage",
  "/billing/credits",
  teamId ? `/v1/teams/${teamId}` : "",
  teamId ? `/v1/teams/${teamId}/billing` : "",
  teamId ? `/v1/teams/${teamId}/usage` : "",
  teamId ? `/v1/teams/${teamId}/credits` : "",
  teamId ? `/v1/teams/${teamId}/subscriptions` : "",
  teamId ? `/auth/teams/${teamId}` : "",
  teamId ? `/teams/${teamId}` : "",
  teamId ? `/teams/${teamId}/billing` : "",
  teamId ? `/teams/${teamId}/usage` : "",
  teamId ? `/teams/${teamId}/credits` : "",
  teamId ? `/teams/${teamId}/subscription` : "",
  teamId ? `/teams/${teamId}/entitlements` : "",
  teamId ? `/teams/${teamId}/limits` : "",
].filter(Boolean);

const hits: any[] = [];
for (const base of bases) {
  for (const p of paths) {
    const u = base + p;
    try {
      const r = await fetch(u, { headers: h });
      const t = await r.text();
      if (r.status === 404 || r.status === 405) continue;
      if (r.status === 403 && t.includes("<!DOCTYPE")) continue;
      hits.push({ status: r.status, url: u, body: t.slice(0, 500) });
      console.log(r.status, u, "->", t.slice(0, 350).replace(/\s+/g, " "));
    } catch {}
  }
}

// also try some POST probes with empty body
for (const u of [
  "https://management-api.x.ai/v1/billing/query",
  "https://management-api.x.ai/v1/usage/query",
  teamId ? `https://management-api.x.ai/teams/${teamId}/usage:query` : "",
].filter(Boolean)) {
  try {
    const r = await fetch(u, { method: "POST", headers: h, body: "{}" });
    const t = await r.text();
    console.log("POST", r.status, u, "->", t.slice(0, 300).replace(/\s+/g, " "));
  } catch {}
}

writeFileSync("./data/probe-balance.json", JSON.stringify({ teamId, me, hits }, null, 2));
console.log("saved data/probe-balance.json hits=", hits.length);
