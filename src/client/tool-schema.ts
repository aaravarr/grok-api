/**
 * Normalize tool JSON Schemas for xAI / Grok chat.completions.
 *
 * Codex / CC Switch may emit function.parameters roots as anyOf/oneOf unions
 * (often object | null). Upstream Grok rejects those with:
 *   "tool parameter root must be an object type
 *    (root schema is an anyOf/oneOf union with a non-object branch)"
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

function mergeObjectSchemas(parts: Obj[]): Obj {
  const out: Obj = { type: "object", properties: {} };
  const props: Obj = {};
  const required = new Set<string>();
  let additional: unknown = undefined;
  let description: string | undefined;

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
    for (const key of ["title", "$id", "$schema", "examples", "default"] as const) {
      if (out[key] === undefined && p[key] !== undefined) out[key] = p[key];
    }
  }

  out.properties = props;
  if (required.size) out.required = [...required];
  if (additional !== undefined) out.additionalProperties = additional;
  if (description) out.description = description;
  return out;
}

function collapseUnion(schemas: unknown[]): Obj | undefined {
  const objs: Obj[] = [];
  for (const s of schemas) {
    if (!isObj(s) || isNullSchema(s)) continue;
    const n = normalizeSchema(s);
    if (isObj(n) && hasObjectType(n)) objs.push(n);
  }
  if (!objs.length) return undefined;
  if (objs.length === 1) return objs[0];
  return mergeObjectSchemas(objs);
}

function normalizeSchema(schema: unknown): unknown {
  if (!isObj(schema)) return schema;
  const s = clone(schema);

  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const collapsed = collapseUnion(s[key] as unknown[]);
      if (collapsed) {
        const meta: Obj = {};
        for (const k of ["title", "description", "default", "examples", "$id", "$schema"] as const) {
          if (s[k] !== undefined) meta[k] = s[k];
        }
        return normalizeSchema({ ...collapsed, ...meta });
      }
    }
  }

  if (Array.isArray(s.allOf)) {
    const parts = (s.allOf as unknown[])
      .map((p) => normalizeSchema(p))
      .filter(isObj);
    const objParts = parts.filter(hasObjectType);
    if (objParts.length) {
      const merged = mergeObjectSchemas(objParts);
      for (const k of ["title", "description", "default", "examples"] as const) {
        if (s[k] !== undefined) merged[k] = s[k];
      }
      return normalizeSchema(merged);
    }
  }

  if (Array.isArray(s.type)) {
    const types = (s.type as unknown[]).filter(
      (t): t is string => typeof t === "string" && t !== "null",
    );
    if (types.length === 1) s.type = types[0];
    else if (types.length > 1) s.type = types;
    else if ((s.type as unknown[]).includes("null") && hasObjectType(s)) s.type = "object";
  }

  if (isObj(s.properties)) {
    const next: Obj = {};
    for (const [k, v] of Object.entries(s.properties)) next[k] = normalizeSchema(v);
    s.properties = next;
  }
  if (s.items !== undefined) {
    if (Array.isArray(s.items)) s.items = (s.items as unknown[]).map((x) => normalizeSchema(x));
    else s.items = normalizeSchema(s.items);
  }
  if (s.additionalProperties && isObj(s.additionalProperties)) {
    s.additionalProperties = normalizeSchema(s.additionalProperties);
  }
  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    if (Array.isArray(s[key])) s[key] = (s[key] as unknown[]).map((x) => normalizeSchema(x));
  }
  if (isObj(s.$defs)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(s.$defs)) defs[k] = normalizeSchema(v);
    s.$defs = defs;
  }
  if (isObj(s.definitions)) {
    const defs: Obj = {};
    for (const [k, v] of Object.entries(s.definitions)) defs[k] = normalizeSchema(v);
    s.definitions = defs;
  }

  return s;
}

/** Ensure tool parameters root is a plain object schema. */
export function normalizeToolParameters(parameters: unknown): Obj {
  if (!isObj(parameters)) {
    return { type: "object", properties: {} };
  }

  const normalized = normalizeSchema(parameters);
  if (!isObj(normalized)) return { type: "object", properties: {} };
  let s: Obj = normalized;

  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const collapsed = collapseUnion(s[key] as unknown[]);
      if (collapsed) {
        const meta: Obj = {};
        for (const k of ["title", "description", "default", "examples"] as const) {
          if (s[k] !== undefined) meta[k] = s[k];
        }
        s = { ...collapsed, ...meta };
      } else {
        s = { type: "object", properties: {} };
      }
      break;
    }
  }

  if (!hasObjectType(s)) {
    return {
      type: "object",
      properties: {},
      ...(typeof s.description === "string" ? { description: s.description } : {}),
    };
  }

  if (s.type !== "object") s.type = "object";
  if (!isObj(s.properties)) s.properties = {};
  if (s.additionalProperties === undefined && Object.keys(s.properties as Obj).length === 0) {
    s.additionalProperties = true;
  }
  return s;
}

function normalizeOneTool(tool: unknown): unknown {
  if (!isObj(tool)) return tool;
  const t = clone(tool);

  // OpenAI chat.completions:
  // { type:"function", function:{ name, description, parameters } }
  if (isObj(t.function)) {
    const fn = { ...t.function };
    if (fn.parameters !== undefined) fn.parameters = normalizeToolParameters(fn.parameters);
    if (fn.input_schema !== undefined) fn.input_schema = normalizeToolParameters(fn.input_schema);
    t.function = fn;
    if (t.type == null) t.type = "function";
    return t;
  }

  // Flat / Responses-ish shapes
  if (t.parameters !== undefined) t.parameters = normalizeToolParameters(t.parameters);
  if (t.input_schema !== undefined) t.input_schema = normalizeToolParameters(t.input_schema);
  if (t.inputSchema !== undefined) t.inputSchema = normalizeToolParameters(t.inputSchema);
  if (isObj(t.custom) && (t.custom as Obj).input_schema !== undefined) {
    t.custom = {
      ...t.custom,
      input_schema: normalizeToolParameters((t.custom as Obj).input_schema),
    };
  }
  return t;
}

/** Normalize tools on a chat.completions request body. */
export function normalizeToolsInBody(body: unknown): unknown {
  if (!isObj(body)) return body;
  const b = { ...body };

  if (Array.isArray(b.tools)) {
    b.tools = b.tools.map((tool) => normalizeOneTool(tool));
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

  return b;
}
