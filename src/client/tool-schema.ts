/**
 * Normalize tool JSON Schemas for xAI / Grok chat.completions.
 *
 * Codex / CC Switch may emit schemas Grok rejects:
 * 1) function.parameters root as anyOf/oneOf (object | null)
 * 2) properties with $ref to #/$defs/... after unions were collapsed and $defs dropped
 *
 * Strategy:
 * - collapse object|null unions to plain object roots
 * - preserve and hoist $defs/definitions
 * - inline local $ref targets so upstream does not need $defs resolution
 */

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function clone<T>(v: T): T {
  return v == null ? v : (JSON.parse(JSON.stringify(v)) as T);
}

function typeList(schema: Obj): string[] {
  const t = schema.type;
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string");
  return [];
}

function hasObjectType(schema: Obj): boolean {
  const types = typeList(schema);
  if (types.includes("object")) return true;
  if (isObj(schema.properties) || schema.additionalProperties !== undefined) return true;
  if (typeof schema.$ref === "string") return false;
  return false;
}

function isNullSchema(schema: unknown): boolean {
  if (!isObj(schema)) return false;
  const types = typeList(schema);
  if (types.length === 1 && types[0] === "null") return true;
  if (schema.const === null) return true;
  if (Array.isArray(schema.enum) && schema.enum.length === 1 && schema.enum[0] === null) return true;
  return false;
}

function preferRicherSchema(a: unknown, b: unknown): unknown {
  if (!isObj(a)) return b;
  if (!isObj(b)) return a;
  const aProps = isObj(a.properties) ? Object.keys(a.properties).length : 0;
  const bProps = isObj(b.properties) ? Object.keys(b.properties).length : 0;
  if (bProps > aProps) return b;
  if (aProps > bProps) return a;
  if (hasObjectType(b) && !hasObjectType(a)) return b;
  return a;
}

function mergeDefs(...parts: Array<Obj | undefined>): Obj | undefined {
  const out: Obj = {};
  let any = false;
  for (const p of parts) {
    if (!isObj(p)) continue;
    for (const [k, v] of Object.entries(p)) {
      if (out[k] === undefined) {
        out[k] = v;
        any = true;
      }
    }
  }
  return any ? out : undefined;
}

function collectDefs(schema: unknown, bag: { defs: Obj; definitions: Obj }, seen = new Set<unknown>()): void {
  if (!isObj(schema) || seen.has(schema)) return;
  seen.add(schema);
  if (isObj(schema.$defs)) {
    for (const [k, v] of Object.entries(schema.$defs)) {
      if (bag.defs[k] === undefined) bag.defs[k] = v;
      collectDefs(v, bag, seen);
    }
  }
  if (isObj(schema.definitions)) {
    for (const [k, v] of Object.entries(schema.definitions)) {
      if (bag.definitions[k] === undefined) bag.definitions[k] = v;
      collectDefs(v, bag, seen);
    }
  }
  if (isObj(schema.properties)) {
    for (const v of Object.values(schema.properties)) collectDefs(v, bag, seen);
  }
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) for (const it of schema.items) collectDefs(it, bag, seen);
    else collectDefs(schema.items, bag, seen);
  }
  if (schema.additionalProperties && isObj(schema.additionalProperties)) {
    collectDefs(schema.additionalProperties, bag, seen);
  }
  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    if (Array.isArray(schema[key])) {
      for (const part of schema[key] as unknown[]) collectDefs(part, bag, seen);
    }
  }
  if (schema.not !== undefined) collectDefs(schema.not, bag, seen);
  if (isObj(schema.if)) collectDefs(schema.if, bag, seen);
  if (isObj(schema.then)) collectDefs(schema.then, bag, seen);
  if (isObj(schema.else)) collectDefs(schema.else, bag, seen);
}

function mergeObjectSchemas(parts: Obj[]): Obj {
  const out: Obj = { type: "object", properties: {} };
  const props: Obj = {};
  const required = new Set<string>();
  let additional: unknown = undefined;
  let description: string | undefined;
  let defs: Obj | undefined;
  let definitions: Obj | undefined;

  for (const p of parts) {
    if (typeof p.description === "string" && !description) description = p.description;
    if (isObj(p.properties)) {
      for (const [k, v] of Object.entries(p.properties)) {
        if (props[k] === undefined) props[k] = v;
        else props[k] = preferRicherSchema(props[k], v);
      }
    }
    if (Array.isArray(p.required)) {
      for (const r of p.required) if (typeof r === "string") required.add(r);
    }
    if (p.additionalProperties !== undefined && additional === undefined) {
      additional = p.additionalProperties;
    }
    defs = mergeDefs(defs, isObj(p.$defs) ? (p.$defs as Obj) : undefined);
    definitions = mergeDefs(definitions, isObj(p.definitions) ? (p.definitions as Obj) : undefined);
    for (const key of ["title", "$id", "$schema", "examples", "default"] as const) {
      if (out[key] === undefined && p[key] !== undefined) out[key] = p[key];
    }
  }

  out.properties = props;
  if (required.size) out.required = [...required];
  if (additional !== undefined) out.additionalProperties = additional;
  if (description) out.description = description;
  if (defs) out.$defs = defs;
  if (definitions) out.definitions = definitions;
  return out;
}

function collapseUnion(schemas: unknown[]): Obj | undefined {
  const objs: Obj[] = [];
  for (const s of schemas) {
    if (!isObj(s) || isNullSchema(s)) continue;
    // keep structural object-ish branches; do not deep-normalize yet
    if (hasObjectType(s) || typeof s.$ref === "string" || Array.isArray(s.anyOf) || Array.isArray(s.oneOf) || Array.isArray(s.allOf)) {
      objs.push(s);
    } else if (typeList(s).includes("object")) {
      objs.push(s);
    }
  }
  if (!objs.length) {
    // if union is only non-null non-object (e.g. string|null), wrap later at root
    const nonNull = schemas.filter((s) => isObj(s) && !isNullSchema(s)) as Obj[];
    if (nonNull.length === 1 && hasObjectType(nonNull[0]!)) return nonNull[0];
    return undefined;
  }
  // Prefer pure object schemas over pure $ref-only when collapsing root params
  const objectish = objs.filter((s) => hasObjectType(s) || Array.isArray(s.anyOf) || Array.isArray(s.oneOf) || Array.isArray(s.allOf));
  const use = objectish.length ? objectish : objs;
  if (use.length === 1) return clone(use[0]!);
  return mergeObjectSchemas(use.map((x) => clone(x)));
}

function stripNullFromType(schema: Obj): void {
  if (!Array.isArray(schema.type)) return;
  const types = (schema.type as unknown[]).filter(
    (t): t is string => typeof t === "string" && t !== "null",
  );
  if (types.length === 1) schema.type = types[0];
  else if (types.length > 1) schema.type = types;
  else if ((schema.type as unknown[]).includes("null") && hasObjectType(schema)) schema.type = "object";
}

/**
 * Collapse unions / clean types, while preserving $defs/definitions.
 */
function normalizeShape(schema: unknown): unknown {
  if (!isObj(schema)) return schema;
  const s = clone(schema);

  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const collapsed = collapseUnion(s[key] as unknown[]);
      if (collapsed) {
        const meta: Obj = {};
        for (const k of [
          "title",
          "description",
          "default",
          "examples",
          "$id",
          "$schema",
          "$defs",
          "definitions",
        ] as const) {
          if (s[k] !== undefined) meta[k] = s[k];
        }
        // hoist defs from union members too
        const bag = { defs: {} as Obj, definitions: {} as Obj };
        collectDefs(s, bag);
        if (Object.keys(bag.defs).length) {
          meta.$defs = mergeDefs(isObj(meta.$defs) ? (meta.$defs as Obj) : undefined, bag.defs);
        }
        if (Object.keys(bag.definitions).length) {
          meta.definitions = mergeDefs(
            isObj(meta.definitions) ? (meta.definitions as Obj) : undefined,
            bag.definitions,
          );
        }
        const merged: Obj = { ...collapsed, ...meta };
        // if both sides had $defs, prefer merged bag
        if (meta.$defs) merged.$defs = meta.$defs;
        if (meta.definitions) merged.definitions = meta.definitions;
        delete merged.anyOf;
        delete merged.oneOf;
        return normalizeShape(merged);
      }
    }
  }

  if (Array.isArray(s.allOf)) {
    const parts = (s.allOf as unknown[]).filter(isObj) as Obj[];
    const objParts = parts.filter((p) => hasObjectType(p) || typeof p.$ref === "string");
    if (objParts.length) {
      const merged = mergeObjectSchemas(objParts.map((p) => clone(p)));
      for (const k of ["title", "description", "default", "examples", "$defs", "definitions"] as const) {
        if (s[k] !== undefined && merged[k] === undefined) merged[k] = s[k];
      }
      const bag = { defs: {} as Obj, definitions: {} as Obj };
      collectDefs(s, bag);
      if (Object.keys(bag.defs).length) {
        merged.$defs = mergeDefs(isObj(merged.$defs) ? (merged.$defs as Obj) : undefined, bag.defs);
      }
      if (Object.keys(bag.definitions).length) {
        merged.definitions = mergeDefs(
          isObj(merged.definitions) ? (merged.definitions as Obj) : undefined,
          bag.definitions,
        );
      }
      delete merged.allOf;
      return normalizeShape(merged);
    }
  }

  stripNullFromType(s);

  if (isObj(s.properties)) {
    const next: Obj = {};
    for (const [k, v] of Object.entries(s.properties)) next[k] = normalizeShape(v);
    s.properties = next;
  }
  if (s.items !== undefined) {
    if (Array.isArray(s.items)) s.items = (s.items as unknown[]).map((x) => normalizeShape(x));
    else s.items = normalizeShape(s.items);
  }
  if (s.additionalProperties && isObj(s.additionalProperties)) {
    s.additionalProperties = normalizeShape(s.additionalProperties);
  }
  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    if (Array.isArray(s[key])) s[key] = (s[key] as unknown[]).map((x) => normalizeShape(x));
  }
  if (isObj(s.$defs)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(s.$defs)) defs[k] = normalizeShape(v);
    s.$defs = defs;
  }
  if (isObj(s.definitions)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(s.definitions)) defs[k] = normalizeShape(v);
    s.definitions = defs;
  }
  if (s.not !== undefined) s.not = normalizeShape(s.not);
  if (s.if !== undefined) s.if = normalizeShape(s.if);
  if (s.then !== undefined) s.then = normalizeShape(s.then);
  if (s.else !== undefined) s.else = normalizeShape(s.else);

  return s;
}

function resolveLocalRef(ref: string, root: Obj): unknown {
  // Support: #/$defs/name, #/definitions/name, #/properties/...
  if (!ref.startsWith("#/")) return undefined;
  const parts = ref
    .slice(2)
    .split("/")
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
  let cur: unknown = root;
  for (const part of parts) {
    if (!isObj(cur) || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function inlineRefs(node: unknown, root: Obj, stack: string[] = []): unknown {
  if (!isObj(node)) return node;
  if (typeof node.$ref === "string") {
    const ref = node.$ref;
    if (stack.includes(ref)) {
      // break cycles with a permissive object
      return { type: "object", additionalProperties: true };
    }
    const target = resolveLocalRef(ref, root);
    if (target === undefined) {
      // unresolved local/external ref: drop $ref into loose object to avoid hard fail
      const { $ref: _drop, ...rest } = node;
      if (Object.keys(rest).length) return inlineRefs(rest, root, stack);
      return { type: "object", additionalProperties: true };
    }
    const merged: Obj = { ...clone(isObj(target) ? target : { const: target }), ...node };
    delete merged.$ref;
    return inlineRefs(merged, root, [...stack, ref]);
  }

  const out: Obj = { ...node };
  if (isObj(out.properties)) {
    const props: Obj = {};
    for (const [k, v] of Object.entries(out.properties)) props[k] = inlineRefs(v, root, stack);
    out.properties = props;
  }
  if (out.items !== undefined) {
    if (Array.isArray(out.items)) out.items = (out.items as unknown[]).map((x) => inlineRefs(x, root, stack));
    else out.items = inlineRefs(out.items, root, stack);
  }
  if (out.additionalProperties && isObj(out.additionalProperties)) {
    out.additionalProperties = inlineRefs(out.additionalProperties, root, stack);
  }
  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    if (Array.isArray(out[key])) out[key] = (out[key] as unknown[]).map((x) => inlineRefs(x, root, stack));
  }
  if (out.not !== undefined) out.not = inlineRefs(out.not, root, stack);
  if (out.if !== undefined) out.if = inlineRefs(out.if, root, stack);
  if (out.then !== undefined) out.then = inlineRefs(out.then, root, stack);
  if (out.else !== undefined) out.else = inlineRefs(out.else, root, stack);
  // Keep defs only on root; nested copies are fine but root inlining uses original root
  if (isObj(out.$defs)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(out.$defs)) defs[k] = inlineRefs(v, root, stack);
    out.$defs = defs;
  }
  if (isObj(out.definitions)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(out.definitions)) defs[k] = inlineRefs(v, root, stack);
    out.definitions = defs;
  }
  return out;
}

function pruneDefsIfUnused(schema: Obj): Obj {
  // After inlining, local $ref should be gone. Drop $defs/definitions to avoid
  // confusing validators that still try to walk them.
  const s = clone(schema);
  delete s.$defs;
  delete s.definitions;
  return s;
}

function hasLocalRef(node: unknown): boolean {
  if (!isObj(node)) return false;
  if (typeof node.$ref === "string" && node.$ref.startsWith("#/")) return true;
  if (isObj(node.properties)) {
    for (const v of Object.values(node.properties)) if (hasLocalRef(v)) return true;
  }
  if (node.items !== undefined) {
    if (Array.isArray(node.items)) {
      for (const it of node.items) if (hasLocalRef(it)) return true;
    } else if (hasLocalRef(node.items)) return true;
  }
  if (node.additionalProperties && hasLocalRef(node.additionalProperties)) return true;
  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    if (Array.isArray(node[key])) {
      for (const p of node[key] as unknown[]) if (hasLocalRef(p)) return true;
    }
  }
  return false;
}

/** Ensure tool parameters root is a plain object schema. */
export function normalizeToolParameters(parameters: unknown): Obj {
  if (!isObj(parameters)) {
    return { type: "object", properties: {} };
  }

  // Collect defs from the original tree first (before any collapse).
  const bag = { defs: {} as Obj, definitions: {} as Obj };
  collectDefs(parameters, bag);

  let shaped = normalizeShape(parameters);
  if (!isObj(shaped)) return { type: "object", properties: {} };
  let s: Obj = shaped;

  // Root still a union? force collapse once more.
  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const collapsed = collapseUnion(s[key] as unknown[]);
      if (collapsed) {
        s = {
          ...collapsed,
          ...(typeof s.title === "string" ? { title: s.title } : {}),
          ...(typeof s.description === "string" ? { description: s.description } : {}),
        };
      } else {
        s = { type: "object", properties: {} };
      }
      break;
    }
  }

  // Re-attach hoisted defs
  const defs = mergeDefs(bag.defs, isObj(s.$defs) ? (s.$defs as Obj) : undefined);
  const definitions = mergeDefs(
    bag.definitions,
    isObj(s.definitions) ? (s.definitions as Obj) : undefined,
  );
  if (defs) s.$defs = defs;
  if (definitions) s.definitions = definitions;

  if (!hasObjectType(s) && typeof s.$ref !== "string") {
    s = {
      type: "object",
      properties: {},
      ...(typeof s.description === "string" ? { description: s.description } : {}),
      ...(defs ? { $defs: defs } : {}),
      ...(definitions ? { definitions } : {}),
    };
  }

  if (s.type !== "object" && hasObjectType(s)) s.type = "object";
  if (!isObj(s.properties) && hasObjectType(s)) s.properties = {};

  // Inline local refs using this schema as root document.
  const inlined = inlineRefs(s, s);
  s = isObj(inlined) ? inlined : s;

  // If still no remaining local refs, drop defs to keep payload small/clean.
  if (!hasLocalRef(s)) s = pruneDefsIfUnused(s);

  if (s.type !== "object" && hasObjectType(s)) s.type = "object";
  if (!isObj(s.properties) && hasObjectType(s)) s.properties = {};
  if (s.additionalProperties === undefined && isObj(s.properties) && Object.keys(s.properties).length === 0) {
    s.additionalProperties = true;
  }

  // Final root guarantee for Grok
  if (!hasObjectType(s)) {
    return { type: "object", properties: {} };
  }
  if (s.type !== "object") s.type = "object";
  if (!isObj(s.properties)) s.properties = {};
  return s;
}

/** xAI Responses tools we pass through as-is (after light field cleanup). */
const XAI_RESPONSE_TOOL_TYPES = new Set([
  "function",
  "web_search",
  "x_search",
  "image_generation",
  "collections_search",
  "file_search",
  "code_execution",
  "code_interpreter",
  "mcp",
  "shell",
]);

function pickToolName(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickToolDescription(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

/** Field name used when wrapping freeform custom tool payloads (cc-switch compatible). */
export const CUSTOM_TOOL_INPUT_FIELD = "input";

const CUSTOM_TOOL_INPUT_DESCRIPTION =
  "Raw string input for the original custom tool. Preserve formatting exactly and follow the original tool definition embedded in the description.";

function freeformInputParameters(): Obj {
  return {
    type: "object",
    properties: {
      [CUSTOM_TOOL_INPUT_FIELD]: {
        type: "string",
        description: CUSTOM_TOOL_INPUT_DESCRIPTION,
      },
    },
    required: [CUSTOM_TOOL_INPUT_FIELD],
    additionalProperties: false,
  };
}

function isFreeformCustomFormat(fmt: unknown): boolean {
  if (!isObj(fmt)) return true;
  const fmtType = String(fmt.type || "").toLowerCase();
  if (fmtType === "json_schema" || isObj(fmt.schema) || isObj(fmt.json_schema)) return false;
  // grammar / text / freeform / missing type => freeform
  return true;
}

function extractJsonSchemaParameters(source: Obj): unknown | undefined {
  if (source.parameters !== undefined) return source.parameters;
  if (source.input_schema !== undefined) return source.input_schema;
  if (source.inputSchema !== undefined) return source.inputSchema;
  if (isObj(source.format)) {
    const fmt = source.format;
    if (isObj(fmt.schema)) return fmt.schema;
    if (isObj(fmt.json_schema)) {
      const js = fmt.json_schema;
      if (isObj(js.schema)) return js.schema;
      return js;
    }
  }
  return undefined;
}

function extractToolParameters(source: Obj): unknown {
  const jsonish = extractJsonSchemaParameters(source);
  if (jsonish !== undefined) return jsonish;
  // Freeform / grammar tools (e.g. Codex apply_patch)
  return freeformInputParameters();
}

function preserveCustomToolDescription(tool: Obj, fallback?: string): string {
  // Keep original custom tool definition in description so agents still know freeform grammar.
  let embedded = "";
  try {
    embedded = JSON.stringify(tool);
  } catch {
    embedded = "";
  }
  const head =
    fallback ||
    (typeof tool.description === "string" ? tool.description : "") ||
    "Original custom tool definition for compatibility.";
  if (!embedded) return head;
  return `${head}\n\nOriginal tool definition:\n\`\`\`json\n${embedded}\n\`\`\``;
}

/**
 * Map OpenAI Responses `custom` tools to function tools (cc-switch style).
 * Freeform/grammar custom tools ALWAYS become:
 *   parameters: { type:object, properties:{ input: string }, required:["input"] }
 * never try to reuse grammar as JSON schema.
 */
function customToolToFunction(tool: Obj, style: "flat" | "nested"): Obj | null {
  const custom = isObj(tool.custom) ? tool.custom : tool;
  const name = pickToolName(custom.name, tool.name, tool.tool_name);
  if (!name) return null;

  const freeform = isFreeformCustomFormat(custom.format ?? tool.format);
  const description = freeform
    ? preserveCustomToolDescription(tool, pickToolDescription(custom.description, tool.description))
    : pickToolDescription(custom.description, tool.description);

  const parameters = freeform
    ? freeformInputParameters()
    : normalizeToolParameters(extractToolParameters(custom) ?? extractToolParameters(tool));

  if (style === "nested") {
    return {
      type: "function",
      function: {
        name,
        ...(description ? { description } : {}),
        parameters,
      },
    };
  }

  return {
    type: "function",
    name,
    ...(description ? { description } : {}),
    parameters,
  };
}

function toolSearchToFunction(style: "flat" | "nested"): Obj {
  const parameters = {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query for tools or connectors to load." },
      limit: { type: "integer", description: "Maximum number of tool groups to return." },
    },
    required: ["query"],
  };
  const description =
    "Search and load Codex tools, plugins, connectors, and MCP namespaces for the current task.";
  if (style === "nested") {
    return {
      type: "function",
      function: { name: "tool_search", description, parameters },
    };
  }
  return { type: "function", name: "tool_search", description, parameters };
}

function flattenNamespaceTools(tool: Obj, style: "flat" | "nested"): Obj[] {
  const ns = pickToolName(tool.name, tool.namespace);
  const children = Array.isArray(tool.tools)
    ? tool.tools
    : Array.isArray(tool.children)
      ? tool.children
      : [];
  const out: Obj[] = [];
  for (const child of children) {
    if (!isObj(child)) continue;
    const childType = String(child.type || "").toLowerCase();
    if (childType && childType !== "function" && !isObj(child.function)) continue;
    const childName = pickToolName(
      isObj(child.function) ? child.function.name : undefined,
      child.name,
    );
    if (!childName) continue;
    const flatName = ns ? `${ns}__${childName}` : childName;
    const description = pickToolDescription(
      isObj(child.function) ? child.function.description : undefined,
      child.description,
    );
    const paramsRaw =
      (isObj(child.function) ? child.function.parameters ?? child.function.input_schema : undefined) ??
      child.parameters ??
      child.input_schema ??
      { type: "object", properties: {} };
    const parameters = normalizeToolParameters(paramsRaw);
    if (style === "nested") {
      out.push({
        type: "function",
        function: {
          name: flatName,
          ...(description ? { description } : {}),
          parameters,
        },
      });
    } else {
      out.push({
        type: "function",
        name: flatName,
        ...(description ? { description } : {}),
        parameters,
      });
    }
  }
  return out;
}

function nestedFunctionToFlat(tool: Obj): Obj {
  const fn = isObj(tool.function) ? tool.function : {};
  const name = pickToolName(fn.name, tool.name);
  const description = pickToolDescription(fn.description, tool.description);
  const parameters = normalizeToolParameters(
    fn.parameters ?? fn.input_schema ?? tool.parameters ?? { type: "object", properties: {} },
  );
  return {
    type: "function",
    name: name || "tool",
    ...(description ? { description } : {}),
    parameters,
  };
}

function unknownToolToFunction(tool: Obj, style: "flat" | "nested"): Obj {
  // Last-resort conversion: never drop a tool; always map to function
  const name =
    pickToolName(tool.name, tool.tool_name, isObj(tool.custom) ? tool.custom.name : undefined) ||
    (typeof tool.type === "string" && tool.type.trim() ? String(tool.type).trim() : "tool");
  const description = pickToolDescription(
    tool.description,
    isObj(tool.custom) ? tool.custom.description : undefined,
    typeof tool.type === "string" ? `Converted from unsupported tool type: ${tool.type}` : undefined,
  );
  const parameters = normalizeToolParameters(extractToolParameters(isObj(tool.custom) ? tool.custom : tool));
  if (style === "nested") {
    return {
      type: "function",
      function: {
        name,
        ...(description ? { description } : {}),
        parameters,
      },
    };
  }
  return {
    type: "function",
    name,
    ...(description ? { description } : {}),
    parameters,
  };
}

function normalizeOneTool(
  tool: unknown,
  opts?: { mode?: "responses" | "chat" },
): unknown | unknown[] {
  if (!isObj(tool)) return tool;
  const t = clone(tool);
  const mode = opts?.mode ?? "chat";
  const style = mode === "responses" ? "flat" : "nested";
  const type = String(t.type || "").toLowerCase();

  // Codex namespace tools → flattened function tools (cc-switch)
  if (type === "namespace") {
    const expanded = flattenNamespaceTools(t, style);
    return expanded.length ? expanded : unknownToolToFunction(t, style);
  }

  // Codex tool_search → function tool
  if (type === "tool_search") {
    return toolSearchToFunction(style);
  }

  // OpenAI Responses `custom` tools → function tools with freeform {input}
  if (type === "custom" || isObj(t.custom)) {
    return (
      customToolToFunction(t, style) ||
      unknownToolToFunction(t, style)
    );
  }

  // OpenAI chat.completions nested function tools
  if (isObj(t.function) || type === "function") {
    if (mode === "responses") {
      // xAI responses expects flat function tools, not {function:{...}}
      if (isObj(t.function) || t.name != null || t.parameters != null) {
        return nestedFunctionToFlat(t);
      }
    }
    if (isObj(t.function)) {
      const fn = { ...t.function };
      if (fn.parameters !== undefined) fn.parameters = normalizeToolParameters(fn.parameters);
      if (fn.input_schema !== undefined) fn.input_schema = normalizeToolParameters(fn.input_schema);
      t.function = fn;
      if (t.type == null) t.type = "function";
      return t;
    }
    // already flat function (responses style) used on chat path — wrap for safety
    if (mode === "chat" && (t.name != null || t.parameters != null) && !isObj(t.function)) {
      return {
        type: "function",
        function: {
          name: pickToolName(t.name) || "tool",
          ...(typeof t.description === "string" ? { description: t.description } : {}),
          parameters: normalizeToolParameters(t.parameters ?? { type: "object", properties: {} }),
        },
      };
    }
  }

  // Known xAI server-side tools: pass through with light schema cleanup
  if (mode === "responses" && type && XAI_RESPONSE_TOOL_TYPES.has(type) && type !== "function") {
    // strip OpenAI-only flags that xAI rejects on tools
    delete t.external_web_access;
    delete t.strict;
    if (t.parameters !== undefined) t.parameters = normalizeToolParameters(t.parameters);
    if (t.input_schema !== undefined) t.input_schema = normalizeToolParameters(t.input_schema);
    if (t.inputSchema !== undefined) t.inputSchema = normalizeToolParameters(t.inputSchema);
    return t;
  }

  // Unknown / unsupported type: convert to function (never drop)
  if (mode === "responses" && type && !XAI_RESPONSE_TOOL_TYPES.has(type)) {
    return unknownToolToFunction(t, "flat");
  }

  // Flat / Responses-ish shapes
  delete t.external_web_access;
  if (t.parameters !== undefined) t.parameters = normalizeToolParameters(t.parameters);
  if (t.input_schema !== undefined) t.input_schema = normalizeToolParameters(t.input_schema);
  if (t.inputSchema !== undefined) t.inputSchema = normalizeToolParameters(t.inputSchema);
  return t;
}

function normalizeToolChoice(choice: unknown, mode: "responses" | "chat"): unknown {
  if (!isObj(choice)) return choice;
  const type = String(choice.type || "").toLowerCase();
  if (type === "custom") {
    const name = pickToolName(choice.name, isObj(choice.custom) ? choice.custom.name : undefined);
    if (!name) return "auto";
    if (mode === "responses") return { type: "function", name };
    return { type: "function", function: { name } };
  }
  // responses: {type:"function", name} ; chat: {type:"function", function:{name}}
  if (type === "function") {
    if (mode === "responses") {
      const name = pickToolName(choice.name, isObj(choice.function) ? choice.function.name : undefined);
      return name ? { type: "function", name } : choice;
    }
    if (!isObj(choice.function)) {
      const name = pickToolName(choice.name);
      return name ? { type: "function", function: { name } } : choice;
    }
  }
  return choice;
}

/**
 * OpenAI Responses / Codex fields that xAI currently rejects.
 * Strip only known-unsupported keys; keep tools (converted above).
 */
const UNSUPPORTED_RESPONSE_BODY_KEYS = [
  "external_web_access",
  // OpenAI extras sometimes injected by clients; strip if present
  "include_obfuscation",
  "prompt_cache_retention",
] as const;

/** Server-side tools that require external web access. */
const EXTERNAL_WEB_TOOL_TYPES = new Set([
  "web_search",
  "x_search",
  // image/video understanding often follows search results
  "view_image",
  "view_x_video",
]);

/** Subset of xAI server tools eligible for default injection on /v1/responses. */
export const INJECTABLE_SERVER_TOOL_TYPES = ["web_search", "x_search"] as const;
const INJECTABLE_SERVER_TOOL_TYPE_SET = new Set<string>(INJECTABLE_SERVER_TOOL_TYPES);

/** True when the request already declares web_search and/or x_search. */
export function bodyHasServerSearchTool(body: unknown): boolean {
  if (!isObj(body) || !Array.isArray(body.tools)) return false;
  for (const tool of body.tools) {
    if (!isObj(tool)) continue;
    const type = String(tool.type || "").toLowerCase();
    if (INJECTABLE_SERVER_TOOL_TYPE_SET.has(type)) return true;
  }
  return false;
}

/**
 * Auto-append injectable xAI server tools when the client omitted them.
 * Pure/sync. Respects enabled flag and external_web_access === false.
 * Does not duplicate an existing tool of the same type.
 */
export function injectDefaultServerTools(
  body: unknown,
  opts: { enabled: boolean; tools: string[] },
): unknown {
  if (!opts?.enabled) return body;
  if (!isObj(body)) return body;
  if (body.external_web_access === false) return body;

  const wanted: string[] = [];
  const seenWanted = new Set<string>();
  for (const raw of opts.tools || []) {
    const t = String(raw ?? "").toLowerCase().trim();
    if (!INJECTABLE_SERVER_TOOL_TYPE_SET.has(t) || seenWanted.has(t)) continue;
    seenWanted.add(t);
    wanted.push(t);
  }
  if (wanted.length === 0) return body;

  const existing = Array.isArray(body.tools) ? [...body.tools] : [];
  const have = new Set<string>();
  for (const tool of existing) {
    if (!isObj(tool)) continue;
    const type = String(tool.type || "").toLowerCase();
    if (type) have.add(type);
  }

  let changed = false;
  for (const type of wanted) {
    if (have.has(type)) continue;
    existing.push({ type });
    have.add(type);
    changed = true;
  }
  if (!changed) return body;
  return { ...body, tools: existing };
}

function stripUnsupportedResponseFields(body: Obj): Obj {
  const b = { ...body };
  for (const k of UNSUPPORTED_RESPONSE_BODY_KEYS) {
    if (k in b) delete b[k];
  }
  return b;
}

function isExternalWebTool(tool: unknown): boolean {
  if (!isObj(tool)) return false;
  const type = String(tool.type || "").toLowerCase();
  if (EXTERNAL_WEB_TOOL_TYPES.has(type)) return true;
  // after conversion, custom web tools are functions; only drop explicit server web tools
  return false;
}

/**
 * Map OpenAI external_web_access onto xAI tools:
 * - false => remove web/x search server tools
 * - true / omitted => keep them
 * Custom/function tools are never removed by this flag.
 */
function applyExternalWebAccessPolicy(body: Obj, externalWebAccess: unknown): Obj {
  if (externalWebAccess !== false) return body;
  const b = { ...body };
  if (Array.isArray(b.tools)) {
    b.tools = b.tools.filter((tool) => !isExternalWebTool(tool));
  }
  // If tool_choice forced a web tool, relax to auto
  if (isObj(b.tool_choice)) {
    const tc = b.tool_choice;
    const t = String(tc.type || "").toLowerCase();
    if (EXTERNAL_WEB_TOOL_TYPES.has(t)) b.tool_choice = "auto";
  }
  return b;
}

/** Normalize tools on a chat.completions / responses request body. */
export function normalizeToolsInBody(
  body: unknown,
  opts?: { mode?: "responses" | "chat" },
): unknown {
  if (!isObj(body)) return body;
  let b = { ...body };
  const mode = opts?.mode ?? "chat";

  // Read before stripping OpenAI-only fields
  const externalWebAccess = b.external_web_access;

  if (mode === "responses") {
    b = applyExternalWebAccessPolicy(b, externalWebAccess);
    b = stripUnsupportedResponseFields(b);
  }

  if (Array.isArray(b.tools)) {
    const next: unknown[] = [];
    for (const tool of b.tools) {
      const n = normalizeOneTool(tool, { mode });
      if (Array.isArray(n)) next.push(...n);
      else if (n != null) next.push(n);
    }
    b.tools = next;
  }

  // Legacy OpenAI functions field
  if (Array.isArray(b.functions)) {
    b.functions = b.functions.map((fn) => {
      if (!isObj(fn)) return fn;
      const f = { ...fn };
      if (f.parameters !== undefined) f.parameters = normalizeToolParameters(f.parameters);
      return f;
    });
  }

  if (b.tool_choice !== undefined) {
    b.tool_choice = normalizeToolChoice(b.tool_choice, mode);
  }

  // xAI rejects: tool_choice set but tools missing/empty (common on /compact)
  const toolsEmpty = !Array.isArray(b.tools) || b.tools.length === 0;
  const functionsEmpty = !Array.isArray(b.functions) || b.functions.length === 0;
  if (toolsEmpty && functionsEmpty) {
    if (b.tool_choice !== undefined) delete b.tool_choice;
    // Codex compact often also leaves this orphan flag
    if (b.parallel_tool_calls !== undefined) delete b.parallel_tool_calls;
    if (b.max_tool_calls !== undefined) delete b.max_tool_calls;
  }
  // Normalize empty arrays away so upstream sees "no tools"
  if (Array.isArray(b.tools) && b.tools.length === 0) delete b.tools;
  if (Array.isArray(b.functions) && b.functions.length === 0) delete b.functions;

  return b;
}
