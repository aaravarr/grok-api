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
