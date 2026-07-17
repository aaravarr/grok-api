/**
 * Codex Responses <-> Chat Completions compatibility layer.
 *
 * Structure and rules follow cc-switch (transform_codex_chat / streaming_codex_chat),
 * trimmed for Grok + Codex:
 * - Keep: custom/freeform, namespace flatten, tool_search, function_call history,
 *   tool_calls streaming, usage mapping, SSE event sequence.
 * - Skip: Anthropic transforms, multi-provider reasoning quirks, non-Grok adapters.
 */

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function clone<T>(v: T): T {
  return v == null ? v : (JSON.parse(JSON.stringify(v)) as T);
}

export const CUSTOM_TOOL_INPUT_FIELD = 'input';
const TOOL_SEARCH_NAME = 'tool_search';
const CUSTOM_TOOL_INPUT_DESCRIPTION =
  'Raw string input for the original custom tool. Preserve formatting exactly and follow the original tool definition embedded in the description.';

export type CodexToolKind = 'function' | 'custom' | 'tool_search' | 'namespace_function';

export type CodexToolSpec = {
  kind: CodexToolKind;
  name: string;
  chatName: string;
  namespace?: string | null;
};

export type CodexToolContext = {
  tools: Obj[];
  byChatName: Map<string, CodexToolSpec>;
  customNames: Set<string>;
};

function textFromContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const p of content) {
      if (typeof p === 'string') parts.push(p);
      else if (isObj(p)) {
        if (typeof p.text === 'string') parts.push(p.text);
        else if (typeof p.content === 'string') parts.push(p.content);
      }
    }
    return parts.join('');
  }
  if (isObj(content) && typeof content.text === 'string') return content.text;
  return '';
}

function canonicalJsonString(v: unknown): string {
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return '{}';
  }
}

/** Ensure tool arguments are a JSON object string (xAI / OpenAI chat requirement). */
export function canonicalizeToolArguments(v: unknown): string {
  if (v == null) return '{}';
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return '{}';
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return JSON.stringify(parsed);
      return JSON.stringify({ input: parsed });
    } catch {
      return JSON.stringify({ [CUSTOM_TOOL_INPUT_FIELD]: v });
    }
  }
  if (typeof v === 'object' && !Array.isArray(v)) return JSON.stringify(v);
  return JSON.stringify({ input: v });
}

export function customToolInputFromChatArguments(argumentsStr: string): string {
  const s = String(argumentsStr || '');
  if (!s.trim()) return '';
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === 'object' && typeof (parsed as any)[CUSTOM_TOOL_INPUT_FIELD] === 'string') {
      return String((parsed as any)[CUSTOM_TOOL_INPUT_FIELD]);
    }
  } catch {
    /* freeform */
  }
  return s;
}

export function toResponsesUsage(usage: unknown): Obj {
  const u = isObj(usage) ? usage : {};
  const input =
    typeof u.input_tokens === 'number'
      ? u.input_tokens
      : typeof u.prompt_tokens === 'number'
        ? u.prompt_tokens
        : 0;
  const output =
    typeof u.output_tokens === 'number'
      ? u.output_tokens
      : typeof u.completion_tokens === 'number'
        ? u.completion_tokens
        : 0;
  const total =
    typeof u.total_tokens === 'number' ? u.total_tokens : Number(input || 0) + Number(output || 0);
  const ptd = isObj(u.input_tokens_details)
    ? u.input_tokens_details
    : isObj(u.prompt_tokens_details)
      ? u.prompt_tokens_details
      : undefined;
  const otd = isObj(u.output_tokens_details)
    ? u.output_tokens_details
    : isObj(u.completion_tokens_details)
      ? u.completion_tokens_details
      : undefined;
  const out: Obj = {
    input_tokens: Number.isFinite(input) ? input : 0,
    output_tokens: Number.isFinite(output) ? output : 0,
    total_tokens: Number.isFinite(total) ? total : 0,
  };
  if (ptd) out.input_tokens_details = ptd;
  if (otd) out.output_tokens_details = otd;
  else out.output_tokens_details = { reasoning_tokens: 0 };
  if (typeof u.num_sources_used === 'number') out.num_sources_used = u.num_sources_used;
  if (typeof u.cost_in_usd_ticks === 'number') out.cost_in_usd_ticks = u.cost_in_usd_ticks;
  return out;
}

function freeformParams(): Obj {
  return {
    type: 'object',
    properties: {
      [CUSTOM_TOOL_INPUT_FIELD]: {
        type: 'string',
        description: CUSTOM_TOOL_INPUT_DESCRIPTION,
      },
    },
    required: [CUSTOM_TOOL_INPUT_FIELD],
    additionalProperties: false,
  };
}

function pickName(...vals: unknown[]): string {
  for (const v of vals) if (typeof v === 'string' && v.trim()) return v.trim();
  return '';
}

function flattenNamespaceName(ns: string, name: string): string {
  return ns + '__' + name;
}

function normalizeObjectParams(params: unknown): Obj {
  if (!isObj(params)) return { type: 'object', properties: {} };
  const p = clone(params);
  if (p.type !== 'object') p.type = 'object';
  if (!isObj(p.properties)) p.properties = {};
  return p;
}

function preserveCustomDescription(tool: Obj): string {
  const head =
    (typeof tool.description === 'string' && tool.description) ||
    'Original custom tool definition for compatibility.';
  try {
    return head + '\n\nOriginal tool definition:\n`json\n' + JSON.stringify(tool) + '\n`';
  } catch {
    return head;
  }
}

function emptyToolContext(): CodexToolContext {
  return { tools: [], byChatName: new Map(), customNames: new Set() };
}

function addChatTool(ctx: CodexToolContext, spec: CodexToolSpec, chatTool: Obj) {
  ctx.tools.push(chatTool);
  ctx.byChatName.set(spec.chatName, spec);
  if (spec.kind === 'custom') ctx.customNames.add(spec.chatName);
}


function addFunctionTool(ctx: CodexToolContext, tool: Obj, namespace?: string | null) {
  const fn = isObj(tool.function) ? tool.function : tool;
  const original = pickName(fn.name, tool.name);
  if (!original) return;
  const chatName = namespace ? flattenNamespaceName(namespace, original) : original;
  const description =
    typeof fn.description === 'string'
      ? fn.description
      : typeof tool.description === 'string'
        ? tool.description
        : undefined;
  const parameters = normalizeObjectParams(
    fn.parameters ?? fn.input_schema ?? tool.parameters ?? { type: 'object', properties: {} },
  );
  addChatTool(
    ctx,
    {
      kind: namespace ? 'namespace_function' : 'function',
      name: original,
      chatName,
      namespace: namespace || null,
    },
    {
      type: 'function',
      function: {
        name: chatName,
        ...(description ? { description } : {}),
        parameters,
      },
    },
  );
}

function addCustomTool(ctx: CodexToolContext, tool: Obj) {
  const name = pickName(tool.name, isObj(tool.custom) ? tool.custom.name : undefined);
  if (!name) return;
  const description = preserveCustomDescription(tool);
  addChatTool(
    ctx,
    { kind: 'custom', name, chatName: name, namespace: null },
    {
      type: 'function',
      function: {
        name,
        description,
        parameters: freeformParams(),
      },
    },
  );
}

function addToolSearch(ctx: CodexToolContext) {
  addChatTool(
    ctx,
    { kind: 'tool_search', name: TOOL_SEARCH_NAME, chatName: TOOL_SEARCH_NAME, namespace: null },
    {
      type: 'function',
      function: {
        name: TOOL_SEARCH_NAME,
        description: 'Search and load Codex tools, plugins, connectors, and MCP namespaces for the current task.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query for tools or connectors to load.' },
            limit: { type: 'integer', description: 'Maximum number of tool groups to return.' },
          },
          required: ['query'],
        },
      },
    },
  );
}

function addNamespaceTool(ctx: CodexToolContext, tool: Obj) {
  const ns = pickName(tool.name, tool.namespace);
  const children = Array.isArray(tool.tools) ? tool.tools : Array.isArray(tool.children) ? tool.children : [];
  for (const child of children) {
    if (!isObj(child)) continue;
    const t = String(child.type || 'function').toLowerCase();
    if (t === 'function' || isObj(child.function)) addFunctionTool(ctx, child, ns || null);
  }
}

function addResponseTool(ctx: CodexToolContext, tool: unknown) {
  if (typeof tool === 'string') {
    addCustomTool(ctx, { type: 'custom', name: tool });
    return;
  }
  if (!isObj(tool)) return;
  const type = String(tool.type || '').toLowerCase();
  if (type === 'function' || isObj(tool.function)) addFunctionTool(ctx, tool, null);
  else if (type === 'custom' || isObj(tool.custom)) addCustomTool(ctx, tool);
  else if (type === 'tool_search') addToolSearch(ctx);
  else if (type === 'namespace') addNamespaceTool(ctx, tool);
}

function collectToolsFromToolSearchOutputs(input: unknown, ctx: CodexToolContext) {
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const it of node) walk(it);
      return;
    }
    if (!isObj(node)) return;
    if (String(node.type || '').toLowerCase() === 'tool_search_output') {
      const tools = Array.isArray(node.tools) ? node.tools : [];
      for (const t of tools) {
        if (!isObj(t)) continue;
        if (String(t.type || '').toLowerCase() === 'namespace' || Array.isArray(t.tools)) addNamespaceTool(ctx, t);
        else addResponseTool(ctx, t);
      }
    }
    for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v);
  };
  walk(input);
}

/** Build tool context from a Responses request body. */
export function buildCodexToolContextFromRequest(body: unknown): CodexToolContext {
  const ctx = emptyToolContext();
  if (!isObj(body)) return ctx;
  const tools = Array.isArray(body.tools) ? body.tools : [];
  for (const t of tools) addResponseTool(ctx, t);
  if (body.input != null) collectToolsFromToolSearchOutputs(body.input, ctx);
  if (!ctx.byChatName.has(TOOL_SEARCH_NAME)) {
    const hasSearch =
      tools.some((t) => isObj(t) && String(t.type || '').toLowerCase() === 'tool_search') ||
      JSON.stringify(body.input || '').includes('tool_search_call');
    if (hasSearch) addToolSearch(ctx);
  }
  return ctx;
}

export function isCustomToolChatName(ctx: CodexToolContext | undefined, chatName: string): boolean {
  if (!ctx) return chatName === 'apply_patch';
  return ctx.customNames.has(chatName) || chatName === 'apply_patch';
}

function parseToolSearchArgsObject(argumentsStr: string): Obj {
  const raw = (argumentsStr || '').trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (isObj(parsed)) return parsed;
    return { query: String(parsed) };
  } catch {
    return { query: raw };
  }
}

function responseToolCallItemIdFromChatName(
  callId: string,
  chatName: string,
  ctx?: CodexToolContext,
): string {
  if (isCustomToolChatName(ctx, chatName)) return 'ctc_' + callId;
  return 'fc_' + callId;
}

/**
 * CC Switch: restore Codex tool metadata from chat tool name.
 * - tool_search -> tool_search_call
 * - custom -> custom_tool_call
 * - namespace_function -> function_call { name: original, namespace }
 * - function -> function_call { name }
 */
export function responseToolCallItemFromChatName(
  opts: {
    callId: string;
    chatName: string;
    argumentsStr: string;
    status?: 'in_progress' | 'completed';
    itemId?: string;
    ctx?: CodexToolContext;
  },
): Obj {
  const callId = opts.callId || 'call_0';
  const chatName = opts.chatName || 'tool';
  const status = opts.status || 'completed';
  const args = opts.argumentsStr || '';
  const ctx = opts.ctx;
  const itemId = opts.itemId || responseToolCallItemIdFromChatName(callId, chatName, ctx);
  const spec = ctx?.byChatName.get(chatName);

  if (chatName === TOOL_SEARCH_NAME || spec?.kind === 'tool_search') {
    return {
      type: 'tool_search_call',
      call_id: callId,
      status,
      execution: 'client',
      arguments: parseToolSearchArgsObject(args),
    };
  }

  if (isCustomToolChatName(ctx, chatName) || spec?.kind === 'custom') {
    return {
      id: itemId.startsWith('ctc_') ? itemId : 'ctc_' + callId,
      type: 'custom_tool_call',
      status,
      call_id: callId,
      name: spec?.name || chatName,
      input: customToolInputFromChatArguments(args),
    };
  }

  if (spec?.kind === 'namespace_function') {
    const out: Obj = {
      id: itemId.startsWith('fc_') ? itemId : 'fc_' + callId,
      type: 'function_call',
      status,
      call_id: callId,
      name: spec.name,
      arguments: canonicalizeToolArguments(args),
    };
    if (spec.namespace) out.namespace = spec.namespace;
    return out;
  }

  return {
    id: itemId.startsWith('fc_') ? itemId : 'fc_' + callId,
    type: 'function_call',
    status,
    call_id: callId,
    name: spec?.name || chatName,
    arguments: canonicalizeToolArguments(args),
  };
}

function responsesRoleToChat(role: string): string {
  const r = role.toLowerCase();
  if (r === 'developer') return 'system';
  if (r === 'system' || r === 'user' || r === 'assistant' || r === 'tool') return r;
  return 'user';
}

function contentPartsToChat(content: unknown): unknown {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return textFromContent(content);
  const parts: unknown[] = [];
  let allText = true;
  let textJoined = '';
  for (const part of content) {
    if (!isObj(part)) {
      if (typeof part === 'string') {
        textJoined += part;
        parts.push({ type: 'text', text: part });
      }
      continue;
    }
    const type = String(part.type || '').toLowerCase();
    if (type === 'input_text' || type === 'output_text' || type === 'text') {
      const t = typeof part.text === 'string' ? part.text : textFromContent(part);
      textJoined += t;
      parts.push({ type: 'text', text: t });
    } else if (type === 'input_image' || type === 'image_url') {
      allText = false;
      const url =
        typeof part.image_url === 'string'
          ? part.image_url
          : isObj(part.image_url)
            ? part.image_url.url
            : part.url;
      parts.push({ type: 'image_url', image_url: { url } });
    } else {
      const t = textFromContent(part);
      if (t) {
        textJoined += t;
        parts.push({ type: 'text', text: t });
      }
    }
  }
  if (allText) return textJoined;
  return parts.length ? parts : textJoined;
}

type PendingToolCall = Obj;

function flushPendingToolCalls(messages: Obj[], pending: PendingToolCall[]) {
  if (!pending.length) return;
  messages.push({
    role: 'assistant',
    content: null,
    tool_calls: pending.map((tc) => clone(tc)),
  });
  pending.length = 0;
}

function functionCallToChatToolCall(item: Obj, ctx: CodexToolContext): Obj {
  const callId = String(item.call_id || item.id || 'call_' + Math.random().toString(16).slice(2));
  const name = pickName(item.name) || 'tool';
  const namespace = typeof item.namespace === 'string' ? item.namespace : null;
  let chatName = name;
  if (namespace) {
    for (const spec of ctx.byChatName.values()) {
      if (spec.name === name && spec.namespace === namespace) {
        chatName = spec.chatName;
        break;
      }
    }
    if (chatName === name) chatName = flattenNamespaceName(namespace, name);
  }
  return {
    id: callId,
    type: 'function',
    function: {
      name: chatName,
      arguments: canonicalizeToolArguments(item.arguments ?? item.input ?? {}),
    },
  };
}

function customToolCallToChatToolCall(item: Obj): Obj {
  const callId = String(item.call_id || item.id || 'call_' + Math.random().toString(16).slice(2));
  const name = pickName(item.name) || 'tool';
  const input = item.input ?? item.arguments ?? '';
  const args =
    typeof input === 'string'
      ? canonicalJsonString({ [CUSTOM_TOOL_INPUT_FIELD]: input })
      : canonicalizeToolArguments(input);
  return {
    id: callId,
    type: 'function',
    function: {
      name,
      arguments: args,
    },
  };
}

function toolSearchCallToChatToolCall(item: Obj): Obj {
  const callId = String(item.call_id || item.id || 'call_' + Math.random().toString(16).slice(2));
  return {
    id: callId,
    type: 'function',
    function: {
      name: TOOL_SEARCH_NAME,
      arguments: canonicalizeToolArguments(item.arguments ?? item.input ?? {}),
    },
  };
}

function toolOutputContent(item: Obj): string {
  if (typeof item.output === 'string') return item.output;
  if (item.output != null) return canonicalJsonString(item.output);
  const copy: Obj = { ...item };
  delete copy.type;
  delete copy.call_id;
  delete copy.id;
  delete copy.status;
  delete copy.execution;
  return canonicalJsonString(copy);
}

function appendResponsesItem(item: unknown, messages: Obj[], pending: PendingToolCall[], ctx: CodexToolContext) {
  if (!isObj(item)) return;
  const type = String(item.type || '').toLowerCase();

  if (type === 'message' || item.role) {
    flushPendingToolCalls(messages, pending);
    const role = responsesRoleToChat(String(item.role || 'user'));
    const content = contentPartsToChat(item.content ?? item.text ?? '');
    if (role === 'assistant' && (content === '' || content == null)) return;
    messages.push({ role, content });
    return;
  }

  if (type === 'function_call') {
    pending.push(functionCallToChatToolCall(item, ctx));
    return;
  }
  if (type === 'custom_tool_call') {
    pending.push(customToolCallToChatToolCall(item));
    return;
  }
  if (type === 'tool_search_call') {
    pending.push(toolSearchCallToChatToolCall(item));
    return;
  }
  if (type === 'function_call_output' || type === 'custom_tool_call_output' || type === 'tool_search_output') {
    flushPendingToolCalls(messages, pending);
    messages.push({
      role: 'tool',
      tool_call_id: String(item.call_id || item.id || 'tool_call'),
      content: toolOutputContent(item),
    });
    return;
  }

  if (type.includes('reasoning') || type.includes('compaction') || item.encrypted_content != null) return;
  // Server-side search / MCP items are executed by the provider; do not replay as chat tool turns.
  if (
    type.includes('web_search') ||
    type.includes('x_search') ||
    type.includes('mcp_call') ||
    type.includes('code_interpreter') ||
    type.includes('file_search') ||
    type.includes('collections_search')
  ) {
    return;
  }

  if (typeof item.text === 'string' && item.text.trim()) {
    flushPendingToolCalls(messages, pending);
    messages.push({ role: 'user', content: item.text });
  }
}

function appendResponsesInput(input: unknown, messages: Obj[], ctx: CodexToolContext) {
  const pending: PendingToolCall[] = [];
  const items = Array.isArray(input) ? input : input != null ? [input] : [];
  for (const item of items) appendResponsesItem(item, messages, pending, ctx);
  flushPendingToolCalls(messages, pending);
}

function mapToolChoice(toolChoice: unknown, _ctx: CodexToolContext): unknown {
  if (toolChoice == null) return undefined;
  if (toolChoice === 'auto' || toolChoice === 'none' || toolChoice === 'required') return toolChoice;
  if (!isObj(toolChoice)) return 'auto';
  const type = String(toolChoice.type || '').toLowerCase();
  if (type === 'function') {
    const name = pickName(toolChoice.name, isObj(toolChoice.function) ? toolChoice.function.name : undefined);
    if (!name) return 'auto';
    return { type: 'function', function: { name } };
  }
  if (type === 'custom') {
    const name = pickName(toolChoice.name, isObj(toolChoice.custom) ? toolChoice.custom.name : undefined);
    if (!name) return 'auto';
    return { type: 'function', function: { name } };
  }
  if (type === 'tool_search') return { type: 'function', function: { name: TOOL_SEARCH_NAME } };
  return 'auto';
}

export type StoredMessage = { role: string; content: string };

/**
 * Convert a Codex/OpenAI Responses request into Chat Completions body for Grok.
 */
export function responsesToChatCompletions(
  responsesBody: unknown,
  storedMessages: StoredMessage[] = [],
): { body: Obj; toolContext: CodexToolContext } {
  const src = isObj(responsesBody) ? responsesBody : {};
  const toolContext = buildCodexToolContextFromRequest(src);
  const messages: Obj[] = [];

  if (typeof src.instructions === 'string' && src.instructions.trim()) {
    messages.push({ role: 'system', content: src.instructions });
  }

  // Codex usually sends full history in input. Prepending our stored transcript
  // double-counts history and DESTROYS prompt-cache prefix stability.
  // Only use stored messages when client input is empty/minimal.
  const inputItems = Array.isArray(src.input) ? src.input : src.input != null ? [src.input] : [];
  const clientHasHistory = inputItems.length > 0;
  if (!clientHasHistory) {
    for (const m of storedMessages || []) {
      if (!m?.content?.trim()) continue;
      const role = m.role === 'developer' ? 'system' : m.role;
      if (!['system', 'user', 'assistant', 'tool'].includes(role)) continue;
      messages.push({ role, content: m.content });
    }
  }

  appendResponsesInput(src.input, messages, toolContext);

  if (!messages.some((m) => m.role === 'user')) {
    messages.push({ role: 'user', content: 'Continue.' });
  }

  const body: Obj = {
    model: src.model || 'grok-4.5',
    messages,
    stream: src.stream === true,
  };

  // cc-switch style passthrough fields (keep stable across turns for cache).
  for (const key of [
    'frequency_penalty',
    'logit_bias',
    'logprobs',
    'metadata',
    'n',
    'parallel_tool_calls',
    'presence_penalty',
    'response_format',
    'seed',
    'service_tier',
    'stop',
    'stream_options',
    'top_logprobs',
    'user',
    'prompt_cache_key',
  ] as const) {
    if (src[key] !== undefined) body[key] = src[key];
  }

  // If client didn't send prompt_cache_key, derive a stable one from Codex thread.
  if (typeof body.prompt_cache_key !== 'string' || !String(body.prompt_cache_key).trim()) {
    if (isObj(src.client_metadata)) {
      const thread =
        (typeof src.client_metadata.thread_id === 'string' && src.client_metadata.thread_id.trim()) ||
        (typeof src.client_metadata.session_id === 'string' && src.client_metadata.session_id.trim()) ||
        '';
      if (thread) body.prompt_cache_key = 'codex-thread:' + thread;
    }
  }

  if (toolContext.tools.length) {
    // Stable tool order helps prefix/cache; keep registration order.
    body.tools = toolContext.tools;
    if (src.tool_choice != null) body.tool_choice = mapToolChoice(src.tool_choice, toolContext);
  } else {
    // Strict chat upstreams reject tool_choice/parallel_tool_calls without tools.
    delete body.tool_choice;
    delete body.parallel_tool_calls;
  }

  if (isObj(src.reasoning) && typeof src.reasoning.effort === 'string') {
    body.reasoning_effort = src.reasoning.effort;
  } else if (typeof src.reasoning_effort === 'string') {
    body.reasoning_effort = src.reasoning_effort;
  }
  if (typeof src.temperature === 'number') body.temperature = src.temperature;
  if (typeof src.top_p === 'number') body.top_p = src.top_p;
  if (typeof src.max_output_tokens === 'number') body.max_tokens = src.max_output_tokens;
  if (typeof src.max_tokens === 'number') body.max_tokens = src.max_tokens;

  return { body, toolContext };
}


/** Non-stream chat JSON -> Responses JSON. */
export function chatCompletionToResponse(
  chat: unknown,
  opts?: { modelHint?: string; toolContext?: CodexToolContext },
): Obj {
  const c = isObj(chat) ? chat : {};
  const choice0 = Array.isArray(c.choices) ? (c.choices[0] as Obj | undefined) : undefined;
  const msg = isObj(choice0?.message) ? (choice0!.message as Obj) : {};
  const content = typeof msg.content === 'string' ? msg.content : textFromContent(msg.content);
  const id = typeof c.id === 'string' ? c.id : 'resp_fallback_' + Date.now().toString(16);
  const model = typeof c.model === 'string' ? c.model : opts?.modelHint || 'grok-4.5';
  const created = typeof c.created === 'number' ? c.created : Math.floor(Date.now() / 1000);
  const ctx = opts?.toolContext;
  const output: Obj[] = [];

  if (Array.isArray(msg.tool_calls)) {
    for (let index = 0; index < msg.tool_calls.length; index++) {
      const tc = msg.tool_calls[index];
      if (!isObj(tc)) continue;
      const fn = isObj(tc.function) ? tc.function : {};
      const chatName = String(fn.name || '').trim();
      // CC Switch: skip tool calls with missing names
      if (!chatName) continue;
      const args = typeof fn.arguments === 'string' ? fn.arguments : JSON.stringify(fn.arguments ?? {});
      const callId = String(tc.id || 'call_' + index);
      output.push(
        responseToolCallItemFromChatName({
          callId,
          chatName,
          argumentsStr: args,
          status: 'completed',
          ctx,
        }),
      );
    }
  }

  if (content || !output.length) {
    output.push({
      id: 'msg_' + id,
      type: 'message',
      role: 'assistant',
      status: 'completed',
      content: [{ type: 'output_text', text: content || '' }],
    });
  }

  return {
    id: id.startsWith('resp_') ? id : 'resp_' + id,
    object: 'response',
    created_at: created,
    status: 'completed',
    model,
    output,
    usage: toResponsesUsage(c.usage),
  };
}

type ToolAccum = {
  callId: string;
  name: string;
  arguments: string;
  added: boolean;
  done: boolean;
  outputIndex: number;
  itemId: string;
};

/** Stream chat SSE -> Codex Responses SSE (cc-switch event sequence). */
export function transformChatSseToResponsesSse(
  stream: ReadableStream<Uint8Array>,
  opts?: { modelHint?: string; toolContext?: CodexToolContext },
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = '';
  let responseId = 'resp_fallback_' + Date.now().toString(16);
  const createdAt = Math.floor(Date.now() / 1000);
  const modelName = () => opts?.modelHint || 'grok-4.5';
  const ctx = opts?.toolContext;

  let started = false;
  let finished = false;
  let nextOutputIndex = 0;
  let messageAdded = false;
  let messageIndex = 0;
  let messageId = 'msg_' + responseId;
  let text = '';
  let usageRaw: unknown;
  const tools = new Map<number, ToolAccum>();
  let nextToolIndexToAdd = 0;
  const completedItems: Array<{ index: number; item: Obj }> = [];

  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, obj: Obj) => {
    const type = typeof obj.type === 'string' ? obj.type : 'message';
    controller.enqueue(encoder.encode('event: ' + type + '\ndata: ' + JSON.stringify(obj) + '\n\n'));
  };
  const alloc = () => nextOutputIndex++;

  const ensureStarted = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (started) return;
    started = true;
    const resp = {
      id: responseId,
      object: 'response',
      created_at: createdAt,
      status: 'in_progress',
      model: modelName(),
      output: [] as unknown[],
    };
    emit(controller, { type: 'response.created', response: resp });
    emit(controller, { type: 'response.in_progress', response: resp });
  };

  const ensureMessage = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (messageAdded) return;
    messageAdded = true;
    messageIndex = alloc();
    messageId = 'msg_' + responseId;
    emit(controller, {
      type: 'response.output_item.added',
      output_index: messageIndex,
      item: { id: messageId, type: 'message', role: 'assistant', status: 'in_progress', content: [] },
    });
    emit(controller, {
      type: 'response.content_part.added',
      item_id: messageId,
      output_index: messageIndex,
      content_index: 0,
      part: { type: 'output_text', text: '' },
    });
  };

  const toolItem = (state: ToolAccum, status: 'in_progress' | 'completed', args: string): Obj => {
    return responseToolCallItemFromChatName({
      callId: state.callId,
      chatName: state.name,
      argumentsStr: args,
      status,
      itemId: state.itemId,
      ctx,
    });
  };

  const flushReadyTools = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    while (true) {
      const key = nextToolIndexToAdd;
      const state = tools.get(key);
      if (!state) break;
      if (state.added || state.done) {
        nextToolIndexToAdd += 1;
        continue;
      }
      if (!state.callId || !state.name) break;
      const idx = alloc();
      state.added = true;
      state.outputIndex = idx;
      state.itemId = responseToolCallItemIdFromChatName(state.callId, state.name, ctx);
      emit(controller, {
        type: 'response.output_item.added',
        output_index: idx,
        item: toolItem(state, 'in_progress', ''),
      });
      if (state.arguments && !isCustomToolChatName(ctx, state.name) && state.name !== TOOL_SEARCH_NAME /* tool_search uses object args on item */) {
        emit(controller, {
          type: 'response.function_call_arguments.delta',
          item_id: state.itemId,
          output_index: idx,
          delta: state.arguments,
        });
      }
      nextToolIndexToAdd += 1;
    }
  };

  const pushToolCallDelta = (controller: ReadableStreamDefaultController<Uint8Array>, toolCall: any) => {
    const chatIndex = typeof toolCall?.index === 'number' ? toolCall.index : 0;
    const idDelta = typeof toolCall?.id === 'string' ? toolCall.id : '';
    const fn = toolCall?.function && typeof toolCall.function === 'object' ? toolCall.function : {};
    const nameDelta = typeof fn.name === 'string' ? fn.name : '';
    const argsDelta = typeof fn.arguments === 'string' ? fn.arguments : '';

    let state = tools.get(chatIndex);
    if (!state) {
      state = {
        callId: '',
        name: '',
        arguments: '',
        added: false,
        done: false,
        outputIndex: 0,
        itemId: '',
      };
      tools.set(chatIndex, state);
    }
    if (idDelta) state.callId = idDelta;
    if (nameDelta) state.name = nameDelta;
    if (argsDelta) state.arguments += argsDelta;

    if (state.added && argsDelta && !isCustomToolChatName(ctx, state.name) && state.name !== TOOL_SEARCH_NAME) {
      emit(controller, {
        type: 'response.function_call_arguments.delta',
        item_id: state.itemId,
        output_index: state.outputIndex,
        delta: argsDelta,
      });
    }
    flushReadyTools(controller);
  };

  const finalizeTools = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    for (const [key, state] of [...tools.entries()].sort((a, b) => a[0] - b[0])) {
      if (state.done) continue;
      // CC Switch: skip streaming tool calls with missing names
      if (!state.name) {
        state.done = true;
        continue;
      }
      if (!state.added) {
        if (!state.callId) state.callId = 'call_' + key;
        const idx = alloc();
        state.added = true;
        state.outputIndex = idx;
        state.itemId = responseToolCallItemIdFromChatName(state.callId, state.name, ctx);
        emit(controller, {
          type: 'response.output_item.added',
          output_index: idx,
          item: toolItem(state, 'in_progress', ''),
        });
      }
      const args = canonicalizeToolArguments(state.arguments);
      if (isCustomToolChatName(ctx, state.name)) {
        const input = customToolInputFromChatArguments(state.arguments);
        if (input) {
          emit(controller, {
            type: 'response.custom_tool_call_input.delta',
            item_id: state.itemId,
            output_index: state.outputIndex,
            delta: input,
          });
        }
        emit(controller, {
          type: 'response.custom_tool_call_input.done',
          item_id: state.itemId,
          output_index: state.outputIndex,
          input,
        });
      } else if (state.name !== TOOL_SEARCH_NAME) {
        emit(controller, {
          type: 'response.function_call_arguments.done',
          item_id: state.itemId,
          output_index: state.outputIndex,
          arguments: args,
        });
      }
      const item = toolItem(state, 'completed', state.arguments);
      emit(controller, { type: 'response.output_item.done', output_index: state.outputIndex, item });
      completedItems.push({ index: state.outputIndex, item });
      state.done = true;
    }
  };

  const finalizeMessage = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (!messageAdded) return;
    emit(controller, {
      type: 'response.output_text.done',
      item_id: messageId,
      output_index: messageIndex,
      content_index: 0,
      text,
    });
    emit(controller, {
      type: 'response.content_part.done',
      item_id: messageId,
      output_index: messageIndex,
      content_index: 0,
      part: { type: 'output_text', text },
    });
    const item = {
      id: messageId,
      type: 'message',
      role: 'assistant',
      status: 'completed',
      content: [{ type: 'output_text', text }],
    };
    emit(controller, { type: 'response.output_item.done', output_index: messageIndex, item });
    completedItems.push({ index: messageIndex, item });
  };

  const finish = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (finished) return;
    finished = true;
    ensureStarted(controller);
    if (!messageAdded && tools.size === 0) ensureMessage(controller);
    finalizeMessage(controller);
    finalizeTools(controller);
    const usage = toResponsesUsage(usageRaw);
    const output = completedItems.sort((a, b) => a.index - b.index).map((x) => x.item);
    const response = {
      id: responseId,
      object: 'response',
      created_at: createdAt,
      status: 'completed',
      model: modelName(),
      output,
      usage,
    };
    emit(controller, { type: 'response.completed', response, usage });
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          const lines = pending.split(/\r?\n/);
          pending = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (!data) continue;
            if (data === '[DONE]') {
              finish(controller);
              continue;
            }
            try {
              const obj = JSON.parse(data);
              if (typeof obj?.id === 'string') {
                responseId = obj.id.startsWith('resp_') ? obj.id : 'resp_' + obj.id;
                if (!messageAdded) messageId = 'msg_' + responseId;
              }
              if (obj?.usage && typeof obj.usage === 'object') usageRaw = obj.usage;
              const choice = Array.isArray(obj?.choices) ? obj.choices[0] : undefined;
              const delta = choice?.delta;
              ensureStarted(controller);

              const piece = typeof delta?.content === 'string' ? delta.content : '';
              if (piece) {
                ensureMessage(controller);
                text += piece;
                emit(controller, {
                  type: 'response.output_text.delta',
                  item_id: messageId,
                  output_index: messageIndex,
                  content_index: 0,
                  delta: piece,
                });
              }
              if (Array.isArray(delta?.tool_calls)) {
                for (const tc of delta.tool_calls) pushToolCallDelta(controller, tc);
              }
              const msg = choice?.message;
              if (msg && Array.isArray(msg.tool_calls)) {
                for (let i = 0; i < msg.tool_calls.length; i++) {
                  const tc = msg.tool_calls[i];
                  pushToolCallDelta(controller, {
                    index: typeof tc?.index === 'number' ? tc.index : i,
                    id: tc?.id,
                    type: tc?.type || 'function',
                    function: tc?.function,
                  });
                }
              }
            } catch {
              /* ignore bad chunk */
            }
          }
        }
        finish(controller);
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}


/**
 * xAI does not speak Codex tool_search / custom / namespace natively.
 * We flatten those to function tools on the way in; this remaps xAI function_call
 * outputs back to the Codex item types so MCP discovery and freeform tools work.
 */
function parseToolSearchArguments(args: unknown): Obj {
  if (isObj(args)) return args;
  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args);
      if (isObj(parsed)) return parsed;
      return { query: String(parsed) };
    } catch {
      return { query: args };
    }
  }
  return { query: args == null ? '' : String(args) };
}

function resolveChatToolName(item: Obj, ctx?: CodexToolContext): string {
  const raw = pickName(item.name, isObj(item.function) ? item.function.name : undefined);
  if (!raw) return '';
  if (!ctx) return raw;
  if (ctx.byChatName.has(raw)) return raw;
  // Sometimes models emit original short names; recover flattened chat name.
  for (const spec of ctx.byChatName.values()) {
    if (spec.name === raw) return spec.chatName;
  }
  return raw;
}

/** xAI server-side search call item types (not client-executable). */
const XAI_SERVER_SEARCH_ITEM_TYPES = new Set([
  'web_search_call',
  'x_search_call',
]);

/** Other xAI server tool call item types we pass through with completed status. */
const XAI_SERVER_TOOL_ITEM_TYPES = new Set([
  'web_search_call',
  'x_search_call',
  'code_interpreter_call',
  'code_execution_call',
  'file_search_call',
  'collections_search_call',
  'mcp_call',
]);

function extractServerSearchQuery(item: Obj): string {
  if (typeof item.query === 'string' && item.query.trim()) return item.query.trim();
  if (isObj(item.action)) {
    if (typeof item.action.query === 'string' && item.action.query.trim()) return item.action.query.trim();
    if (typeof item.action.q === 'string' && item.action.q.trim()) return item.action.q.trim();
  }
  const argsRaw = item.arguments ?? item.input ?? item.parameters;
  if (typeof argsRaw === 'string' && argsRaw.trim()) {
    try {
      const parsed = JSON.parse(argsRaw);
      if (isObj(parsed)) {
        const q = parsed.query ?? parsed.q ?? parsed.keywords ?? parsed.search_query;
        if (q != null && String(q).trim()) return String(q).trim();
      }
    } catch {
      return argsRaw.trim();
    }
    return argsRaw.trim();
  }
  if (isObj(argsRaw)) {
    const q = argsRaw.query ?? argsRaw.q ?? argsRaw.keywords ?? argsRaw.search_query;
    if (q != null && String(q).trim()) return String(q).trim();
  }
  return '';
}

/**
 * Codex/OpenAI clients understand web_search_call, but not xAI's x_search_call.
 * Normalize server search items so Codex does not try to execute them as client tools.
 */
/** Short label for Codex process UI (shown inside "已搜索网页 (...)"). */
export function serverSearchToolLabel(toolName: unknown, itemType?: unknown): string {
  const type = String(itemType || '').toLowerCase().trim();
  const n = String(toolName || '').toLowerCase().trim();
  if (n) {
    if (n === 'web_search' || n === 'web_search_call') return 'web_search';
    if (n === 'x_search' || n === 'x_search_call') return 'x_search';
    if (n === 'browse_page' || n === 'open_page') return 'open_page';
    if (n.startsWith('x_') || n.startsWith('web_')) return n;
    return n;
  }
  if (type === 'x_search_call') return 'x_search';
  if (type === 'web_search_call') return 'web_search';
  return '';
}

/**
 * Prefix query for Codex display so users can tell web_search vs x_keyword_search, etc.
 * Idempotent if already prefixed.
 */
export function formatServerSearchQueryForCodex(query: string, toolName?: unknown, itemType?: unknown): string {
  const q = String(query || '').trim();
  const label = serverSearchToolLabel(toolName, itemType);
  if (!label) return q;
  if (!q) return label;
  // already prefixed
  if (
    q === label ||
    q.startsWith(label + ':') ||
    q.startsWith(label + '：') ||
    q.startsWith(label + ' ·') ||
    q.startsWith('[' + label + ']')
  ) {
    return q;
  }
  return label + ': ' + q;
}

/** Strip display prefix when replaying history upstream. */
export function stripServerSearchQueryPrefix(query: unknown): string {
  const q = String(query ?? '').trim();
  if (!q) return '';
  const m = q.match(/^\[?([a-z0-9_]+)\]?\s*[:：·-]\s*(.+)$/i);
  if (m && (m[1].startsWith('x_') || m[1].startsWith('web_') || m[1] === 'open_page')) {
    return m[2].trim();
  }
  // bare label with no query
  if (/^(x_[a-z0-9_]+|web_search|open_page)$/i.test(q)) return '';
  return q;
}

export function isXaiServerSearchToolName(name: unknown): boolean {
  const n = String(name || '').toLowerCase().trim();
  if (!n) return false;
  if (
    n === 'web_search' ||
    n === 'x_search' ||
    n === 'x_keyword_search' ||
    n === 'x_semantic_search' ||
    n === 'x_user_search' ||
    n === 'x_thread_fetch' ||
    n === 'web_search_with_snippets' ||
    n === 'browse_page'
  ) {
    return true;
  }
  // xAI may add more x_* server helpers under the x_search umbrella.
  if (n.startsWith('x_') && (n.includes('search') || n.includes('thread') || n.includes('user') || n.includes('post'))) {
    return true;
  }
  return false;
}

/**
 * Codex/OpenAI clients understand web_search_call, but not xAI's x_search surface:
 * - type=x_search_call
 * - type=custom_tool_call name=x_keyword_search|x_semantic_search|...
 * Normalize to web_search_call so Codex shows "已搜索网页" process UI and does not try local execution.
 */
export function remapServerToolItemForCodex(item: unknown): unknown {
  if (!isObj(item)) return item;
  const type = String(item.type || '').toLowerCase();
  if (!type) return item;

  const toWebSearchCall = (opts: {
    query: string;
    status: string;
    id?: string;
    callId?: string;
    xaiTool?: string;
    extra?: Obj;
  }): Obj => {
    const callId = opts.callId || opts.id || 'ws_' + Math.random().toString(16).slice(2);
    const displayQuery = formatServerSearchQueryForCodex(opts.query || '', opts.xaiTool, 'web_search_call');
    const out: Obj = {
      ...(opts.extra || {}),
      type: 'web_search_call',
      id: opts.id || callId,
      call_id: callId,
      status: opts.status || 'completed',
      action: {
        type: 'search',
        query: displayQuery,
        sources: [],
      },
    };
    // Keep clean query for reverse mapping / debugging.
    if (opts.query) out.xai_query = opts.query;
    if (opts.xaiTool) out.xai_tool = opts.xaiTool;
    return out;
  };

  // Native x_search_call / web_search_call
  if (type === 'x_search_call' || type === 'web_search_call') {
    const query = extractServerSearchQuery(item);
    const statusRaw = typeof item.status === 'string' && item.status.trim() ? item.status : 'completed';
    const out: Obj = {
      ...item,
      type: 'web_search_call',
      status: statusRaw,
    };
    const toolLabel =
      type === 'x_search_call'
        ? 'x_search'
        : typeof out.xai_tool === 'string' && out.xai_tool
          ? String(out.xai_tool)
          : 'web_search';
    const displayQuery = formatServerSearchQueryForCodex(query, toolLabel, type);
    if (!isObj(out.action)) {
      out.action = { type: 'search', query: displayQuery, sources: [] };
    } else {
      const action = { ...(out.action as Obj) };
      // Prefer filling empty query; always prefix for display when we know the tool.
      if (typeof action.query === 'string' && action.query.trim()) {
        action.query = formatServerSearchQueryForCodex(String(action.query), toolLabel, type);
      } else if (query) {
        action.query = displayQuery;
      } else if (action.query == null) {
        action.query = displayQuery;
      }
      if (!Array.isArray(action.sources)) action.sources = [];
      if (!action.type) action.type = 'search';
      out.action = action;
    }
    if (query) out.xai_query = query;
    if (type === 'x_search_call') out.xai_tool = 'x_search';
    else if (!out.xai_tool) out.xai_tool = 'web_search';
    // Strip freeform custom fields that confuse Codex tool runners.
    delete out.name;
    delete out.input;
    delete out.arguments;
    return out;
  }

  // xAI currently streams x_search internals as custom_tool_call:
  // name=x_semantic_search|x_keyword_search|... with JSON input {query:...}
  if (type === 'custom_tool_call') {
    const name = String(item.name || '').trim();
    if (isXaiServerSearchToolName(name)) {
      const query = extractServerSearchQuery(item);
      const statusRaw = typeof item.status === 'string' && item.status.trim() ? item.status : 'completed';
      return toWebSearchCall({
        query,
        status: statusRaw,
        id: typeof item.id === 'string' ? item.id : undefined,
        callId: typeof item.call_id === 'string' ? item.call_id : undefined,
        xaiTool: name.toLowerCase().startsWith('x_') ? name : 'x_search',
      });
    }
  }

  // Ensure other server tool items carry a status.
  if (XAI_SERVER_TOOL_ITEM_TYPES.has(type)) {
    if (typeof item.status !== 'string' || !item.status.trim()) {
      return { ...item, status: 'completed' };
    }
    return item;
  }

  // Safety: server search leaked as function_call.
  if (type === 'function_call' || type === 'function') {
    const name = String(item.name || (isObj(item.function) ? item.function.name : '') || '').trim();
    if (isXaiServerSearchToolName(name)) {
      const query = extractServerSearchQuery(item);
      const callId = String(item.call_id || item.id || 'ws_' + Math.random().toString(16).slice(2));
      return toWebSearchCall({
        query,
        status: typeof item.status === 'string' && item.status.trim() ? item.status : 'completed',
        id: typeof item.id === 'string' && item.id.trim() ? item.id : callId,
        callId,
        xaiTool: name.toLowerCase().startsWith('x_') ? name : 'web_search',
      });
    }
  }

  return item;
}

/** Rewrite SSE event type names x_search_call -> web_search_call. */
export function remapServerToolEventType(eventType: string): string {
  if (!eventType) return eventType;
  if (eventType.includes('x_search_call')) {
    return eventType.replace(/x_search_call/g, 'web_search_call');
  }
  return eventType;
}

/** Remap one Responses output item from xAI shape -> Codex shape. */
export function remapXaiOutputItemForCodex(item: unknown, ctx?: CodexToolContext): unknown {
  if (!isObj(item)) return item;
  // First: xAI server tools (x_search_call etc.) -> Codex-safe shapes
  const serverRemapped = remapServerToolItemForCodex(item);
  if (!isObj(serverRemapped)) return serverRemapped;
  // If remapped away from function_call (e.g. to web_search_call), return immediately.
  if (serverRemapped !== item) {
    const rt = String(serverRemapped.type || '').toLowerCase();
    if (rt !== 'function_call' && rt !== 'function') return serverRemapped;
  }
  const cur: Obj = serverRemapped;
  const type = String(cur.type || '').toLowerCase();
  if (type !== 'function_call' && type !== 'function') return cur;

  const chatName = resolveChatToolName(cur, ctx);
  if (!chatName) return cur;
  const callId = String(cur.call_id || cur.id || 'call_' + Math.random().toString(16).slice(2));
  const statusRaw = typeof cur.status === 'string' && cur.status.trim() ? cur.status : 'completed';
  const status = statusRaw === 'in_progress' ? 'in_progress' : 'completed';
  const argsRaw = cur.arguments ?? cur.input ?? {};
  const argsStr = typeof argsRaw === 'string' ? argsRaw : JSON.stringify(argsRaw ?? {});
  const itemId =
    typeof cur.id === 'string' && cur.id.trim()
      ? cur.id
      : responseToolCallItemIdFromChatName(callId, chatName, ctx);

  return responseToolCallItemFromChatName({
    callId,
    chatName,
    argumentsStr: argsStr,
    status,
    itemId,
    ctx,
  });
}

/** Remap a full xAI Responses JSON payload for Codex. */
export function remapXaiResponsesJsonForCodex(payload: unknown, ctx?: CodexToolContext): unknown {
  if (!isObj(payload)) return payload;
  const out = { ...payload };
  if (Array.isArray(out.output)) {
    out.output = out.output.map((it) => remapXaiOutputItemForCodex(it, ctx));
  }
  return out;
}

function remapSseDataObject(obj: Obj, ctx?: CodexToolContext): Obj {
  const type = remapServerToolEventType(String(obj.type || ''));
  const next = { ...obj };
  if (type && type !== obj.type) next.type = type;

  if (isObj(next.item)) {
    next.item = remapXaiOutputItemForCodex(next.item, ctx) as Obj;
  }
  if (isObj(next.response)) {
    next.response = remapXaiResponsesJsonForCodex(next.response, ctx) as Obj;
  }

  // tool_search_call does not use function_call_arguments.* events
  if (
    type === 'response.function_call_arguments.delta' ||
    type === 'response.function_call_arguments.done'
  ) {
    const itemId = String(next.item_id || '');
    if (itemId.startsWith('ts_') || itemId.includes('tool_search')) {
      return { type: 'response.codex_compat.noop' };
    }
  }

  return next;
}

/**
 * Transform native xAI Responses SSE into Codex-compatible SSE.
 * Pass-through for non-tool events; remaps function_call->tool_search_call/custom_tool_call.
 */
export function transformXaiResponsesSseForCodex(
  stream: ReadableStream<Uint8Array>,
  ctx?: CodexToolContext,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = '';
  // Track item_ids / call_ids rewritten away from function_call so we can drop arg deltas.
  const suppressArgIds = new Set<string>();
  // Track x_search custom_tool_call ids remapped to web_search_call (drop custom input events).
  const serverSearchIds = new Set<string>();

  const enqueueEvent = (controller: ReadableStreamDefaultController<Uint8Array>, eventName: string, data: Obj) => {
    const ev = eventName || (typeof data.type === 'string' ? data.type : 'message');
    controller.enqueue(encoder.encode('event: ' + ev + '\ndata: ' + JSON.stringify(data) + '\n\n'));
  };

  const rememberServerSearchIds = (...vals: unknown[]) => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim()) serverSearchIds.add(v.trim());
    }
  };

  const isServerSearchRemap = (beforeItem: Obj | null, afterItem: Obj | null): boolean => {
    if (!afterItem) return false;
    const afterType = String(afterItem.type || '').toLowerCase();
    if (afterType !== 'web_search_call') return false;
    if (!beforeItem) return false;
    const beforeType = String(beforeItem.type || '').toLowerCase();
    if (beforeType === 'web_search_call') return false;
    if (beforeType === 'x_search_call' || beforeType === 'function_call' || beforeType === 'function') return true;
    if (beforeType === 'custom_tool_call' && isXaiServerSearchToolName(beforeItem.name)) return true;
    return false;
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          const parts = pending.split('\n\n');
          pending = parts.pop() || '';
          for (const block of parts) {
            if (!block.trim()) continue;
            const lines = block.split('\n');
            let eventName = '';
            const dataLines: string[] = [];
            for (const line of lines) {
              if (line.startsWith('event:')) eventName = line.slice(6).trim();
              else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
            }
            const dataStr = dataLines.join('\n');
            if (!dataStr || dataStr === '[DONE]') {
              controller.enqueue(encoder.encode(block + '\n\n'));
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (!isObj(parsed)) {
                controller.enqueue(encoder.encode(block + '\n\n'));
                continue;
              }

              const evType = String(parsed.type || '');

              // Drop custom_tool_call_input.* for remapped x_search server tools.
              if (
                (evType === 'response.custom_tool_call_input.delta' ||
                  evType === 'response.custom_tool_call_input.done') &&
                serverSearchIds.has(String(parsed.item_id || ''))
              ) {
                continue;
              }

              if (
                (evType === 'response.function_call_arguments.delta' ||
                  evType === 'response.function_call_arguments.done') &&
                suppressArgIds.has(String(parsed.item_id || ''))
              ) {
                continue;
              }

              const beforeItem = isObj(parsed.item) ? ({ ...parsed.item } as Obj) : null;
              const remapped = remapSseDataObject(parsed, ctx);
              if (String(remapped.type || '') === 'response.codex_compat.noop') continue;

              const afterItem = isObj(remapped.item) ? (remapped.item as Obj) : null;
              const serverSearch = isServerSearchRemap(beforeItem, afterItem);

              if (beforeItem && afterItem) {
                const beforeType = String(beforeItem.type || '').toLowerCase();
                const afterType = String(afterItem.type || '').toLowerCase();
                if (beforeType === 'function_call' && afterType !== 'function_call') {
                  rememberServerSearchIds(beforeItem.id, beforeItem.call_id, afterItem.id, afterItem.call_id);
                  for (const id of [beforeItem.id, beforeItem.call_id, afterItem.id, afterItem.call_id]) {
                    if (typeof id === 'string' && id.trim()) suppressArgIds.add(id);
                  }
                }
                if (serverSearch) {
                  rememberServerSearchIds(beforeItem.id, beforeItem.call_id, afterItem.id, afterItem.call_id);
                }
              }

              // Proactively track custom_tool_call x_search ids even if remap failed for some reason.
              if (beforeItem && String(beforeItem.type || '').toLowerCase() === 'custom_tool_call' && isXaiServerSearchToolName(beforeItem.name)) {
                rememberServerSearchIds(beforeItem.id, beforeItem.call_id);
              }

              const rawEvent = eventName || (typeof remapped.type === 'string' ? remapped.type : 'message');
              const outEvent = remapServerToolEventType(rawEvent);

              // Expand x_search custom_tool_call lifecycle into web_search_call process events.
              if (serverSearch && afterItem && String(remapped.type || '') === 'response.output_item.added') {
                const itemId = String(afterItem.id || afterItem.call_id || '');
                const outputIndex = remapped.output_index;
                enqueueEvent(controller, 'response.output_item.added', remapped);
                enqueueEvent(controller, 'response.web_search_call.in_progress', {
                  type: 'response.web_search_call.in_progress',
                  item_id: itemId,
                  output_index: outputIndex,
                });
                enqueueEvent(controller, 'response.web_search_call.searching', {
                  type: 'response.web_search_call.searching',
                  item_id: itemId,
                  output_index: outputIndex,
                });
                continue;
              }

              if (serverSearch && afterItem && String(remapped.type || '') === 'response.output_item.done') {
                const itemId = String(afterItem.id || afterItem.call_id || '');
                const outputIndex = remapped.output_index;
                enqueueEvent(controller, 'response.web_search_call.completed', {
                  type: 'response.web_search_call.completed',
                  item_id: itemId,
                  output_index: outputIndex,
                });
                enqueueEvent(controller, 'response.output_item.done', remapped);
                continue;
              }

              enqueueEvent(controller, outEvent, remapped);
            } catch {
              controller.enqueue(encoder.encode(block + '\n\n'));
            }
          }
        }
        if (pending.trim()) controller.enqueue(encoder.encode(pending));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}
