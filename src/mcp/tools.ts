import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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
) {
  const result = await proxyUpstream({
    method,
    path,
    body: method === "GET" ? undefined : body,
    accountId: auth.accountId,
    callerUserId: auth.callerUserId,
    checkCredits: true,
  });
  const bytes = result.body
    ? Buffer.from(await new Response(result.body).arrayBuffer())
    : Buffer.alloc(0);
  let json: any = null;
  const text = bytes.toString("utf8");
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
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
      description: "Poll async video job status by request_id.",
      inputSchema: {
        request_id: z.string(),
      },
    },
    async (args) => {
      try {
        const id = encodeURIComponent(String(args.request_id || ""));
        if (!id) return errText("request_id required");
        const r = await callUpstream(auth, "GET", `/videos/${id}`);
        if (r.status >= 400) return errText(JSON.stringify(r.json));
        return okText({ status_http: r.status, ...r.headers, body: r.json });
      } catch (e) {
        return errText(e instanceof Error ? e.message : String(e));
      }
    },
  );

  return server;
}
