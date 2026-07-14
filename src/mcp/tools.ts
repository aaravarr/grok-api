import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  extractVideoRequestId,
  extractVideoRequestIdFromPath,
  lookupVideoJobAccount,
  rememberVideoJob,
} from "../account/video-jobs.js";
import { proxyUpstream } from "../client/xai.js";

export type McpAuthContext = {
  /** API key owner user id for pool routing */
  callerUserId: string | null;
  /** optional pin via x-account-id */
  accountId?: string;
};

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
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  accountId?: string,
  opts?: { accept?: string | null },
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
    body: method === "GET" ? undefined : body,
    accountId: preferred,
    callerUserId: auth.callerUserId,
    checkCredits: true,
    accept: opts?.accept,
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

/** Build a fresh MCP server instance bound to one request's API key identity. */
export function createGrokMcpServer(auth: McpAuthContext): McpServer {
  const server = new McpServer(
    { name: "grok-api-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
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

  server.registerTool(
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

  server.registerTool(
    "grok_image_generate",
    {
      title: "Generate image",
      description: "Generate image(s) with grok-imagine-image.",
      inputSchema: {
        prompt: z.string().describe("Image prompt"),
        model: z.string().optional().describe("Default grok-imagine-image"),
        n: z.number().optional().describe("Count, default 1"),
        aspect_ratio: z.string().optional().describe("e.g. 1:1, 16:9, auto"),
        resolution: z.string().optional().describe("e.g. 1k"),
        response_format: z.enum(["url", "b64_json"]).optional(),
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

  server.registerTool(
    "grok_image_edit",
    {
      title: "Edit image",
      description: "Edit an image with prompt + source image URL/data.",
      inputSchema: {
        prompt: z.string(),
        image_url: z.string().describe("http(s) url or data:image/...;base64,..."),
        model: z.string().optional(),
        n: z.number().optional(),
        response_format: z.enum(["url", "b64_json"]).optional(),
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

  server.registerTool(
    "grok_video_generate",
    {
      title: "Generate video",
      description: "Start async video generation. Returns request_id; poll with grok_video_status. Note: grok-imagine-video-1.5 is image-to-video only (image_url required); pure text-to-video is not supported on that model.",
      inputSchema: {
        prompt: z.string(),
        model: z.string().optional(),
        duration: z.number().optional().describe("1-15 seconds"),
        aspect_ratio: z.string().optional(),
        resolution: z.string().optional(),
        image_url: z.string().optional().describe("First-frame image URL/data for I2V. Required for grok-imagine-video-1.5 (no pure T2V)."),
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

  server.registerTool(
    "grok_video_edit",
    {
      title: "Edit video",
      description: "Start async video edit. Returns request_id.",
      inputSchema: {
        prompt: z.string(),
        video_url: z.string(),
        model: z.string().optional(),
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

  server.registerTool(
    "grok_video_extend",
    {
      title: "Extend video",
      description: "Start async video extension. Returns request_id.",
      inputSchema: {
        prompt: z.string(),
        video_url: z.string(),
        duration: z.number().optional().describe("extension seconds 2-10"),
        model: z.string().optional(),
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

  server.registerTool(
    "grok_video_status",
    {
      title: "Video status",
      description: "Poll async video job status by request_id. Prefer the same account used to create the job (server also remembers request_id -> account).",
      inputSchema: {
        request_id: z.string(),
        account_id: z.string().optional().describe("Optional sticky account id returned by create call headers"),
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


  server.registerTool(
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

  server.registerTool(
    "grok_list_custom_voices",
    {
      title: "List custom voices",
      description: "List custom voices available to the routed SuperGrok account.",
      inputSchema: {},
    },
    async () => {
      try {
        const r = await callUpstream(auth, "GET", "/custom-voices");
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    "grok_tts",
    {
      title: "Text to speech",
      description:
        "Generate speech audio from text. Supports expressive tags such as <soft>, <excited>, [laugh]. Returns JSON with audio_base64 (or upstream JSON when with_timestamps=true). Useful for short-drama dubbing.",
      inputSchema: {
        text: z.string().describe("Speech text, max ~15000 chars. Supports emotion tags."),
        voice_id: z.string().optional().describe("Built-in or custom voice id, default eve"),
        language: z.string().optional().describe("e.g. zh, en"),
        speed: z.number().optional().describe("Playback speed multiplier"),
        codec: z.enum(["mp3", "wav", "pcm", "opus", "aac", "flac"]).optional(),
        sample_rate: z.number().optional().describe("e.g. 24000"),
        bit_rate: z.number().optional().describe("e.g. 128000 for mp3"),
        with_timestamps: z
          .boolean()
          .optional()
          .describe("If true, prefer JSON response with timestamps; default false (binary wrapped as base64)"),
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

  server.registerTool(
    "grok_voice_create_client_secret",
    {
      title: "Create realtime voice client secret",
      description:
        "Create an ephemeral client secret for browser Realtime voice sessions (POST /realtime/client_secrets). Does not open the WebSocket itself.",
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
