/**
 * Optional local stdio MCP bridge (legacy).
 * Prefer remote endpoint: POST/GET {GROK_API_BASE}/mcp with Authorization: Bearer gk_...
 *
 * Env:
 *   GROK_API_BASE   default http://127.0.0.1:8787
 *   GROK_API_KEY    required
 *   GROK_ACCOUNT_ID optional
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE = (process.env.GROK_API_BASE || "http://127.0.0.1:8787").replace(/\/+$/, "");
const API_KEY = process.env.GROK_API_KEY || "";
const ACCOUNT_ID = process.env.GROK_ACCOUNT_ID || "";

if (!API_KEY) {
  console.error("[grok-mcp] GROK_API_KEY is required");
  console.error("[grok-mcp] Prefer remote MCP: " + BASE + "/mcp");
}

async function api(method: string, path: string, body?: unknown, opts?: { accept?: string }) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: opts?.accept || "application/json",
  };
  if (ACCOUNT_ID) headers["x-account-id"] = ACCOUNT_ID;
  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const contentType = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  let json: any = null;
  const looksBinary =
    /^(audio|video|image)\//i.test(contentType) ||
    /octet-stream/i.test(contentType) ||
    (buf.length > 0 && buf[0] !== 0x7b && buf[0] !== 0x5b && !/json/i.test(contentType));
  if (looksBinary) {
    json = {
      content_type: contentType || "application/octet-stream",
      byte_length: buf.length,
      audio_base64: buf.toString("base64"),
      encoding: "base64",
    };
  } else {
    const text = buf.toString("utf8");
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  }
  const outHeaders: Record<string, string> = {};
  const aid = res.headers.get("x-account-id");
  const aname = res.headers.get("x-account-name");
  if (aid) outHeaders["x-account-id"] = aid;
  if (aname) outHeaders["x-account-name"] = aname;
  return { status: res.status, json, headers: outHeaders };
}

function okText(data: unknown) {
  return { content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}
function errText(msg: string) {
  return { isError: true as const, content: [{ type: "text" as const, text: msg }] };
}

const tools = [
  { name: "grok_list_image_models", description: "List Imagine image generation models.", inputSchema: { type: "object", properties: {} } },
  { name: "grok_list_video_models", description: "List Imagine video generation models.", inputSchema: { type: "object", properties: {} } },
  { name: "grok_image_generate", description: "Generate image(s).", inputSchema: { type: "object", required: ["prompt"], properties: { prompt: { type: "string" }, model: { type: "string" }, n: { type: "number" }, aspect_ratio: { type: "string" }, resolution: { type: "string" }, response_format: { type: "string" } } } },
  { name: "grok_image_edit", description: "Edit image.", inputSchema: { type: "object", required: ["prompt", "image_url"], properties: { prompt: { type: "string" }, image_url: { type: "string" }, model: { type: "string" }, n: { type: "number" }, response_format: { type: "string" } } } },
  { name: "grok_video_generate", description: "Generate video (async).", inputSchema: { type: "object", required: ["prompt"], properties: { prompt: { type: "string" }, model: { type: "string" }, duration: { type: "number" }, aspect_ratio: { type: "string" }, resolution: { type: "string" }, image_url: { type: "string" } } } },
  { name: "grok_video_edit", description: "Edit video (async).", inputSchema: { type: "object", required: ["prompt", "video_url"], properties: { prompt: { type: "string" }, video_url: { type: "string" }, model: { type: "string" } } } },
  { name: "grok_video_extend", description: "Extend video (async).", inputSchema: { type: "object", required: ["prompt", "video_url"], properties: { prompt: { type: "string" }, video_url: { type: "string" }, duration: { type: "number" }, model: { type: "string" } } } },
  { name: "grok_video_status", description: "Poll video job.", inputSchema: { type: "object", required: ["request_id"], properties: { request_id: { type: "string" } } } },
  { name: "grok_list_voices", description: "List built-in TTS voices.", inputSchema: { type: "object", properties: {} } },
  { name: "grok_list_custom_voices", description: "List custom voices.", inputSchema: { type: "object", properties: {} } },
  { name: "grok_tts", description: "Text-to-speech. Supports emotion tags. Returns audio_base64 JSON.", inputSchema: { type: "object", required: ["text"], properties: { text: { type: "string" }, voice_id: { type: "string" }, language: { type: "string" }, speed: { type: "number" }, codec: { type: "string" }, sample_rate: { type: "number" }, bit_rate: { type: "number" }, with_timestamps: { type: "boolean" } } } },
  { name: "grok_voice_create_client_secret", description: "Create ephemeral realtime voice client secret.", inputSchema: { type: "object", properties: { expires_after: { type: "object" }, session: { type: "object" } } } },
] as const;

const server = new Server({ name: "grok-api-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...tools] }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (!API_KEY) return errText("GROK_API_KEY is not set. Prefer remote MCP at " + BASE + "/mcp");
  const name = req.params.name;
  const args = (req.params.arguments || {}) as Record<string, any>;
  try {
    if (name === "grok_list_image_models") {
      const r = await api("GET", "/v1/image-generation-models");
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_list_video_models") {
      const r = await api("GET", "/v1/video-generation-models");
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_image_generate") {
      const body: any = { model: args.model || "grok-imagine-image", prompt: String(args.prompt || ""), n: args.n ?? 1, response_format: args.response_format || "url" };
      if (args.aspect_ratio) body.aspect_ratio = args.aspect_ratio;
      if (args.resolution) body.resolution = args.resolution;
      const r = await api("POST", "/v1/images/generations", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_image_edit") {
      const body: any = { model: args.model || "grok-imagine-image", prompt: String(args.prompt || ""), image: { url: String(args.image_url || "") }, response_format: args.response_format || "url" };
      if (args.n != null) body.n = args.n;
      const r = await api("POST", "/v1/images/edits", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_video_generate") {
      const body: any = { model: args.model || "grok-imagine-video", prompt: String(args.prompt || ""), duration: args.duration ?? 6 };
      if (args.aspect_ratio) body.aspect_ratio = args.aspect_ratio;
      if (args.resolution) body.resolution = args.resolution;
      if (args.image_url) body.image = { url: String(args.image_url) };
      const r = await api("POST", "/v1/videos/generations", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_video_edit") {
      const body = { model: args.model || "grok-imagine-video", prompt: String(args.prompt || ""), video: { url: String(args.video_url || "") } };
      const r = await api("POST", "/v1/videos/edits", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_video_extend") {
      const body: any = { model: args.model || "grok-imagine-video", prompt: String(args.prompt || ""), video: { url: String(args.video_url || "") } };
      if (args.duration != null) body.duration = args.duration;
      const r = await api("POST", "/v1/videos/extensions", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_video_status") {
      const id = encodeURIComponent(String(args.request_id || ""));
      if (!id) return errText("request_id required");
      // Sticky account is handled by server-side request_id mapping; optional pin via env still works.
      const r = await api("GET", `/v1/videos/${id}`);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ status_http: r.status, ...r.headers, body: r.json });
    }
    if (name === "grok_list_voices") {
      const r = await api("GET", "/v1/tts/voices");
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_list_custom_voices") {
      const r = await api("GET", "/v1/custom-voices");
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_tts") {
      const text = String(args.text || "").trim();
      if (!text) return errText("text required");
      const body: any = { text, voice_id: args.voice_id || "eve" };
      if (args.language) body.language = args.language;
      if (args.speed != null) body.speed = args.speed;
      if (args.with_timestamps != null) body.with_timestamps = args.with_timestamps;
      const fmt: any = {};
      if (args.codec) fmt.codec = args.codec;
      if (args.sample_rate != null) fmt.sample_rate = args.sample_rate;
      if (args.bit_rate != null) fmt.bit_rate = args.bit_rate;
      if (Object.keys(fmt).length) body.output_format = fmt;
      const r = await api("POST", "/v1/tts", body, { accept: "*/*" });
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    if (name === "grok_voice_create_client_secret") {
      const body: any = {};
      if (args.expires_after) body.expires_after = args.expires_after;
      if (args.session) body.session = args.session;
      const r = await api("POST", "/v1/realtime/client_secrets", body);
      return r.status >= 400 ? errText(JSON.stringify(r.json)) : okText({ ...r.headers, body: r.json });
    }
    return errText(`Unknown tool: ${name}`);
  } catch (e) {
    return errText(e instanceof Error ? e.message : String(e));
  }
});

console.error(`[grok-mcp] stdio bridge → ${BASE} (prefer remote ${BASE}/mcp)`);
const transport = new StdioServerTransport();
await server.connect(transport);
