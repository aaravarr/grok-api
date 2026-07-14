import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  extractVideoRequestId,
  extractVideoRequestIdFromPath,
  lookupVideoJobAccount,
  rememberVideoJob,
} from "../account/video-jobs.js";
import { proxyUpstream } from "../client/xai.js";
import {
  getUserMcpEnabledTools,
  MCP_TOOL_NAMES,
} from "../auth/users.js";

export type McpAuthContext = {
  /** API key owner user id for pool routing */
  callerUserId: string | null;
  /** optional pin via x-account-id */
  accountId?: string;
  /** explicit enabled tools for this user; nullish => defaults */
  enabledTools?: string[];
};

/** @deprecated kept for import compatibility */
export const MCP_OPTIONAL_TOOLS = new Set<string>(
  [
    "grok_get_custom_voice",
    "grok_create_custom_voice",
    "grok_update_custom_voice",
    "grok_delete_custom_voice",
    "grok_get_custom_voice_audio",
  ],
);

function okText(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errText(msg: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: msg }],
  };
}

async function callUpstream(
  auth: McpAuthContext,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  accountId?: string,
  opts?: { accept?: string | null; rawBody?: any; contentType?: string | null; checkCredits?: boolean },
) {
  let preferred = (accountId || auth.accountId || "").trim() || undefined;
  // Sticky account for status polls even when MCP bypasses /v1 handlers.
  if (!preferred && method === "GET") {
    const requestId = extractVideoRequestIdFromPath(path);
    if (requestId) preferred = await lookupVideoJobAccount(requestId);
  }

  const result = await proxyUpstream({
    method,
    path,
    body: method === "GET" || method === "DELETE" ? undefined : body,
    accountId: preferred,
    callerUserId: auth.callerUserId,
    checkCredits: opts?.checkCredits !== false,
    accept: opts?.accept,
    rawBody: opts?.rawBody,
    contentType: opts?.contentType,
  });
  const bytes = result.body
    ? Buffer.from(await new Response(result.body).arrayBuffer())
    : Buffer.alloc(0);
  const contentType = result.headers.get("content-type") || "";
  let json: any = null;
  const looksBinary =
    /^(audio|video|image)\//i.test(contentType) ||
    /octet-stream/i.test(contentType) ||
    (bytes.length > 0 && bytes[0] !== 0x7b && bytes[0] !== 0x5b && !/json/i.test(contentType));
  if (looksBinary) {
    json = {
      content_type: contentType || "application/octet-stream",
      byte_length: bytes.length,
      audio_base64: bytes.toString("base64"),
      encoding: "base64",
    };
  } else {
    const text = bytes.toString("utf8");
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
  }

  // Remember create-job mapping for later status polls.
  if (
    method === "POST" &&
    result.status >= 200 &&
    result.status < 300 &&
    /\/videos\/(generations|edits|extensions)\/?$/i.test(path)
  ) {
    const requestId = extractVideoRequestId(json);
    if (requestId) {
      await rememberVideoJob({
        requestId,
        accountId: result.accountId,
        accountName: result.accountName,
        callerUserId: auth.callerUserId,
      });
    }
  }

  return {
    status: result.status,
    json,
    headers: {
      "x-account-id": result.accountId,
      "x-account-name": result.accountName,
    },
  };
}


function guessAudioExt(contentType: string, filename?: string): string {
  const f = String(filename || "").toLowerCase();
  if (f.includes(".")) return f.split(".").pop() || "wav";
  const ct = contentType.toLowerCase();
  if (ct.includes("mpeg") || ct.includes("mp3")) return "mp3";
  if (ct.includes("wav")) return "wav";
  if (ct.includes("flac")) return "flac";
  if (ct.includes("ogg")) return "ogg";
  if (ct.includes("mp4") || ct.includes("m4a")) return "m4a";
  return "wav";
}

function buildMultipartForm(parts: Array<{ name: string; value?: string; filename?: string; contentType?: string; data?: Buffer }>) {
  const boundary = "----grokBoundary" + Date.now().toString(16) + Math.random().toString(16).slice(2);
  const chunks: Buffer[] = [];
  for (const p of parts) {
    if (p.data) {
      const filename = p.filename || "audio.wav";
      const ctype = p.contentType || "application/octet-stream";
      chunks.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${p.name}"; filename="${filename}"\r\n` +
        `Content-Type: ${ctype}\r\n\r\n`,
        "utf8",
      ));
      chunks.push(p.data);
      chunks.push(Buffer.from("\r\n", "utf8"));
    } else if (p.value != null) {
      chunks.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${p.name}"\r\n\r\n` +
        `${p.value}\r\n`,
        "utf8",
      ));
    }
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`, "utf8"));
  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/** Build a fresh MCP server instance bound to one request's API key identity. */
export async function createGrokMcpServer(auth: McpAuthContext): Promise<McpServer> {
  const enabled = new Set(
    (auth.enabledTools ?? (await getUserMcpEnabledTools(auth.callerUserId))).map((x) => String(x)),
  );
  const known = new Set<string>(MCP_TOOL_NAMES as unknown as string[]);
  const allowTool = (name: string) => {
    if (!known.has(name)) return true;
    return enabled.has(name);
  };

  const server = new McpServer(
    { name: "grok-api-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  function register(name: string, config: any, handler: (...args: any[]) => any) {
    if (!allowTool(name)) return;
    (server.registerTool as any)(name, config, handler);
  }

  register(
    "grok_list_image_models",
    {
      title: "List image models",
      description: "List Imagine image generation models.",
      inputSchema: {},
    },
    async () => {
      try {
        const r = await callUpstream(auth, "GET", "/image-generation-models");
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_list_video_models",
    {
      title: "List video models",
      description: "List Imagine video generation models.",
      inputSchema: {},
    },
    async () => {
      try {
        const r = await callUpstream(auth, "GET", "/video-generation-models");
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_image_generate",
    {
      title: "Generate image",
      description:
        "Generate image(s) with grok-imagine-image / grok-imagine-image-quality. Limits: aspect_ratio e.g. 1:1,16:9,9:16,4:3,3:4,3:2,2:3,auto; resolution 1k|2k; n for batch variations (examples use up to 4). response_format url|b64_json (default url). Returned image URLs are temporary — download promptly.",
      inputSchema: {
        prompt: z.string().describe("Image prompt"),
        model: z.string().optional().describe("Default grok-imagine-image (or grok-imagine-image-quality)"),
        n: z.number().optional().describe("Number of images/variations, default 1 (batch supported)"),
        aspect_ratio: z.string().optional().describe("1:1 | 16:9 | 9:16 | 4:3 | 3:4 | 3:2 | 2:3 | auto"),
        resolution: z.string().optional().describe("1k | 2k"),
        response_format: z.enum(["url", "b64_json"]).optional().describe("Default url; URLs are temporary"),
      },
    },
    async (args) => {
      try {
        const body: any = {
          model: args.model || "grok-imagine-image",
          prompt: String(args.prompt || ""),
          n: args.n ?? 1,
          response_format: args.response_format || "url",
        };
        if (args.aspect_ratio) body.aspect_ratio = args.aspect_ratio;
        if (args.resolution) body.resolution = args.resolution;
        const r = await callUpstream(auth, "POST", "/images/generations", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_image_edit",
    {
      title: "Edit image",
      description:
        "Edit an image with prompt + one source image. Source: public URL, data:image/...;base64, or file_id-compatible URL string. Body must be JSON (not multipart). Single-image edit: output aspect usually follows the source. Multi-image editing (up to 3 refs) is a separate upstream capability not fully exposed by this tool yet — pass one image_url only. Returned URLs temporary.",
      inputSchema: {
        prompt: z.string().describe("Edit instruction / style transfer request"),
        image_url: z.string().describe("Public URL or data:image/...;base64,... (single source)"),
        model: z.string().optional().describe("Default grok-imagine-image (or quality)"),
        n: z.number().optional().describe("Count, default 1"),
        response_format: z.enum(["url", "b64_json"]).optional().describe("Default url"),
      },
    },
    async (args) => {
      try {
        const body: any = {
          model: args.model || "grok-imagine-image",
          prompt: String(args.prompt || ""),
          image: { url: String(args.image_url || "") },
          response_format: args.response_format || "url",
        };
        if (args.n != null) body.n = args.n;
        const r = await callUpstream(auth, "POST", "/images/edits", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_video_generate",
    {
      title: "Generate video",
      description:
        "Start async video generation. Returns request_id; poll with grok_video_status. Limits from xAI docs: duration 1-15s; aspect_ratio e.g. 1:1, 16:9, 9:16, 4:3, 3:4; resolution 480p/720p/1080p (model-dependent). Model notes: grok-imagine-video supports T2V/I2V; grok-imagine-video-1.5 is image-to-video ONLY (image_url required, pure T2V rejected). For I2V, image becomes first frame; if aspect_ratio is set it may stretch the image. Do not mix image and reference_images modes. Async job; poll every few seconds.",
      inputSchema: {
        prompt: z.string().describe("Video prompt"),
        model: z.string().optional().describe("Default grok-imagine-video. Use grok-imagine-video-1.5 only for I2V with image_url."),
        duration: z.number().optional().describe("Output duration in seconds, allowed 1-15. Default 6."),
        aspect_ratio: z.string().optional().describe("e.g. 1:1, 16:9, 9:16, 4:3, 3:4. Default often 16:9."),
        resolution: z.string().optional().describe("480p | 720p | 1080p (availability depends on model)."),
        image_url: z.string().optional().describe("First-frame image URL/data for image-to-video. REQUIRED for grok-imagine-video-1.5."),
      },
    },
    async (args) => {
      try {
        const body: any = {
          model: args.model || "grok-imagine-video",
          prompt: String(args.prompt || ""),
          duration: args.duration ?? 6,
        };
        if (args.aspect_ratio) body.aspect_ratio = args.aspect_ratio;
        if (args.resolution) body.resolution = args.resolution;
        if (args.image_url) body.image = { url: String(args.image_url) };
        const r = await callUpstream(auth, "POST", "/videos/generations", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_video_edit",
    {
      title: "Edit video",
      description:
        "Start async video edit. Returns request_id; poll with grok_video_status. Hard limits from xAI docs: input video must be .mp4 with supported codecs (H.264/H.265/AV1 etc.); input length max ~8.7 seconds; duration/aspect_ratio/resolution are NOT customizable for edits (output inherits input duration & aspect, resolution capped at 720p). Prefer short clips.",
      inputSchema: {
        prompt: z.string().describe("What to change while preserving the rest of the scene"),
        video_url: z.string().describe("Source .mp4 URL/data. Max input length ~8.7s."),
        model: z.string().optional().describe("Default grok-imagine-video"),
      },
    },
    async (args) => {
      try {
        const body = {
          model: args.model || "grok-imagine-video",
          prompt: String(args.prompt || ""),
          video: { url: String(args.video_url || "") },
        };
        const r = await callUpstream(auth, "POST", "/videos/edits", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_video_extend",
    {
      title: "Extend video",
      description:
        "Start async video extension (continue from last frame). Returns request_id; poll with grok_video_status. CRITICAL limits: input source video should be <= ~15 seconds (docs/examples use 10s input + extension; longer inputs are likely rejected). duration is the ADDED extension length only (not final total); examples commonly use 5-10s. Final length = input_length + duration. Prefer .mp4 source. Use for seamless continuation, not arbitrary rewrites (use grok_video_edit for rewrite).",
      inputSchema: {
        prompt: z.string().describe("What should happen next after the last frame"),
        video_url: z.string().describe("Source video URL/data to extend. Keep input <= ~15s; prefer .mp4."),
        duration: z.number().optional().describe("Seconds of NEW content to append only (not total). Commonly 5-10. Example: input 10s + duration 5 => output 15s."),
        model: z.string().optional().describe("Default grok-imagine-video"),
      },
    },
    async (args) => {
      try {
        const body: any = {
          model: args.model || "grok-imagine-video",
          prompt: String(args.prompt || ""),
          video: { url: String(args.video_url || "") },
        };
        if (args.duration != null) body.duration = args.duration;
        const r = await callUpstream(auth, "POST", "/videos/extensions", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_video_status",
    {
      title: "Video status",
      description:
        "Poll async video job status by request_id. Status may be pending/processing/done/failed/expired. When done, body.video.url is temporary. Server remembers request_id->account for sticky routing; optional account_id can pin further. Poll every few seconds until done/failed/expired.",
      inputSchema: {
        request_id: z.string().describe("request_id from generate/edit/extend"),
        account_id: z.string().optional().describe("Optional sticky account id from create call headers"),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.request_id || ""));
        if (!id) return errText("request_id required");
        const sticky = args.account_id ? String(args.account_id) : undefined;
        const r = await callUpstream(auth, "GET", `/videos/${id}`, undefined, sticky);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ status_http: r.status, ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );


  register(
    "grok_list_voices",
    {
      title: "List TTS voices",
      description: "List built-in xAI TTS voices (e.g. eve, ara).",
      inputSchema: {},
    },
    async () => {
      try {
        const r = await callUpstream(auth, "GET", "/tts/voices");
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_list_custom_voices",
    {
      title: "List custom voices",
      description:
        "List custom voices owned by the routed SuperGrok account/team. Cap is typically ~30. Supports optional limit (1-1000) and pagination_token.",
      inputSchema: {
        limit: z.number().optional().describe("1-1000, default 100"),
        pagination_token: z.string().optional().describe("Next-page token from previous response"),
      },
    },
    async (args) => {
      try {
        const qs = new URLSearchParams();
        if (args.limit != null) qs.set("limit", String(args.limit));
        if (args.pagination_token) qs.set("pagination_token", String(args.pagination_token));
        const q = qs.toString();
        const r = await callUpstream(auth, "GET", "/custom-voices" + (q ? `?${q}` : ""));
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_get_custom_voice",
    {
      title: "Get custom voice",
      description: "Get one custom voice by voice_id (8-char id).",
      inputSchema: {
        voice_id: z.string().describe("Custom voice id"),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.voice_id || "").trim());
        if (!id) return errText("voice_id required");
        const r = await callUpstream(auth, "GET", `/custom-voices/${id}`);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_create_custom_voice",
    {
      title: "Create custom voice",
      description:
        "Create a custom voice from reference audio. Caps around 30 voices. Reference audio max ~120s; formats: wav/mp3/flac/ogg/m4a/mp4/etc. Requires name + audio_base64 (or data URI). Optional language/description/filename/content_type. Availability may be region/plan gated.",
      inputSchema: {
        name: z.string().describe("Display name"),
        audio_base64: z.string().describe("Base64 audio bytes or data:audio/...;base64,..."),
        language: z.string().optional().describe("e.g. en, zh"),
        description: z.string().optional(),
        filename: z.string().optional().describe("e.g. sample.wav"),
        content_type: z.string().optional().describe("e.g. audio/wav, audio/mpeg"),
      },
    },
    async (args) => {
      try {
        const name = String(args.name || "").trim();
        const audioB64 = String(args.audio_base64 || "").trim();
        if (!name) return errText("name required");
        if (!audioB64) return errText("audio_base64 required");
        const clean = audioB64.replace(/^data:[^;]+;base64,/, "");
        const data = Buffer.from(clean, "base64");
        if (!data.length) return errText("empty audio_base64");
        const filename = String(args.filename || `voice.${guessAudioExt(String(args.content_type || ""), args.filename)}`);
        const fileCt = String(args.content_type || "application/octet-stream");
        const parts: Array<{ name: string; value?: string; filename?: string; contentType?: string; data?: Buffer }> = [
          { name: "name", value: name },
        ];
        if (args.language) parts.push({ name: "language", value: String(args.language) });
        if (args.description) parts.push({ name: "description", value: String(args.description) });
        parts.push({ name: "file", filename, contentType: fileCt, data });
        const mp = buildMultipartForm(parts);
        const r = await callUpstream(auth, "POST", "/custom-voices", undefined, undefined, {
          rawBody: mp.body,
          contentType: mp.contentType,
        });
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_update_custom_voice",
    {
      title: "Update custom voice",
      description: "Update custom voice metadata (name/description/language). Use this to manage the ~30-slot library without recreating audio.",
      inputSchema: {
        voice_id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        language: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.voice_id || "").trim());
        if (!id) return errText("voice_id required");
        const body: any = {};
        if (args.name != null) body.name = String(args.name);
        if (args.description != null) body.description = String(args.description);
        if (args.language != null) body.language = String(args.language);
        if (!Object.keys(body).length) return errText("provide name/description/language to update");
        const r = await callUpstream(auth, "PATCH", `/custom-voices/${id}`, body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_delete_custom_voice",
    {
      title: "Delete custom voice",
      description: "Delete a custom voice by voice_id to free one of the limited (~30) slots.",
      inputSchema: {
        voice_id: z.string(),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.voice_id || "").trim());
        if (!id) return errText("voice_id required");
        const r = await callUpstream(auth, "DELETE", `/custom-voices/${id}`);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_get_custom_voice_audio",
    {
      title: "Get custom voice audio",
      description: "Download the reference audio for a custom voice. Returns audio_base64 JSON.",
      inputSchema: {
        voice_id: z.string(),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.voice_id || "").trim());
        if (!id) return errText("voice_id required");
        const r = await callUpstream(auth, "GET", `/custom-voices/${id}/audio`, undefined, undefined, { accept: "*/*" });
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_tts",
    {
      title: "Text to speech",
      description:
        "Generate speech audio from text (POST /v1/tts). Limits: text max 15000 chars; language recommended (en, zh, ja, ko, ... or auto); speed 0.7-1.5; codec mp3|wav|pcm|mulaw|alaw; sample_rate 8000|16000|22050|24000|44100|48000; bit_rate for mp3 32000..192000. Supports tags: [pause],[long-pause],[laugh],[chuckle],[giggle],[cry],[breath],[sigh],... and style wrappers like <soft>/<excited>. Returns audio_base64 JSON (binary wrapped) unless with_timestamps=true. Useful for short-drama dubbing.",
      inputSchema: {
        text: z.string().describe("Speech text, max 15000 chars. Supports speech tags."),
        voice_id: z.string().optional().describe("Built-in or custom voice id, default eve"),
        language: z.string().optional().describe("BCP-47 or auto: en, zh, ja, ko, ... Recommended for quality."),
        speed: z.number().optional().describe("0.7-1.5, default 1.0"),
        codec: z.enum(["mp3", "wav", "pcm", "mulaw", "alaw"]).optional().describe("Default mp3"),
        sample_rate: z.number().optional().describe("8000|16000|22050|24000|44100|48000"),
        bit_rate: z.number().optional().describe("mp3 only: 32000|64000|96000|128000|192000"),
        with_timestamps: z
          .boolean()
          .optional()
          .describe("If true, prefer JSON with timestamps; default false (binary wrapped as base64)"),
        output_format: z
          .object({
            codec: z.string().optional(),
            sample_rate: z.number().optional(),
            bit_rate: z.number().optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      try {
        const text = String(args.text || "").trim();
        if (!text) return errText("text required");
        const body: any = {
          text,
          voice_id: args.voice_id || "eve",
        };
        if (args.language) body.language = args.language;
        if (args.speed != null) body.speed = args.speed;
        if (args.with_timestamps != null) body.with_timestamps = args.with_timestamps;
        const fmt: any = { ...(args.output_format || {}) };
        if (args.codec) fmt.codec = args.codec;
        if (args.sample_rate != null) fmt.sample_rate = args.sample_rate;
        if (args.bit_rate != null) fmt.bit_rate = args.bit_rate;
        if (Object.keys(fmt).length) body.output_format = fmt;
        // Binary audio by default; Accept */* so upstream can return audio/* bytes.
        const r = await callUpstream(auth, "POST", "/tts", body, undefined, { accept: "*/*" });
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  register(
    "grok_voice_create_client_secret",
    {
      title: "Create realtime voice client secret",
      description:
        "Create an ephemeral client secret for browser Realtime voice sessions (POST /realtime/client_secrets). Short-lived Bearer/sec-websocket-protocol credential only. Does NOT open the Realtime WebSocket (wss://api.x.ai/v1/realtime) and is not for SIP call_id sessions. Use for browser clients; server-side can use API key directly.",
      inputSchema: {
        expires_after: z
          .object({
            seconds: z.number().optional(),
          })
          .optional()
          .describe("Optional TTL for the secret"),
        session: z.record(z.any()).optional().describe("Optional realtime session config passthrough"),
      },
    },
    async (args) => {
      try {
        const body: any = {};
        if (args.expires_after) body.expires_after = args.expires_after;
        if (args.session) body.session = args.session;
        const r = await callUpstream(auth, "POST", "/realtime/client_secrets", body);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  return server;
}
