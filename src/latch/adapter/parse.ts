import { LATCH_CATALOG_ID } from "@/latch/adapter/schema";

export type NormalizedAction = {
  name: string;
  context?: Record<string, unknown>;
};

export type NormalizedComponent = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  action?: NormalizedAction;
};

export type SurfaceTheme = {
  primaryColor?: string;
  iconUrl?: string;
  agentDisplayName?: string;
};

export type SurfaceModel = {
  id: string;
  catalogId?: string;
  rootId?: string;
  ready: boolean;
  created: boolean;
  deleted: boolean;
  components: Map<string, NormalizedComponent>;
  data: Record<string, unknown>;
  theme?: SurfaceTheme;
};

export type ParseIssue = {
  message: string;
  line?: number;
};

export type ParsedA2ui = {
  surfaces: SurfaceModel[];
  issues: ParseIssue[];
};

const MESSAGE_KEYS = [
  "createSurface",
  "updateComponents",
  "updateDataModel",
  "deleteSurface",
  "surfaceUpdate",
  "dataModelUpdate",
  "beginRendering",
] as const;

export function parseA2ui(input: string | unknown): ParsedA2ui {
  const issues: ParseIssue[] = [];
  const messages = coerceMessages(input, issues);
  const surfaces = new Map<string, SurfaceModel>();

  messages.forEach((message, index) => {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      issues.push({ message: "Message is not an object.", line: index + 1 });
      return;
    }
    const record = message as Record<string, unknown>;
    const key = MESSAGE_KEYS.find((candidate) => candidate in record);
    if (!key) {
      if (Array.isArray(record.components)) {
        applyComponents(surfaces, "main", record.components, issues, index);
        return;
      }
      issues.push({ message: "Message has no A2UI envelope key.", line: index + 1 });
      return;
    }
    const body = record[key];
    if (!body || typeof body !== "object") {
      issues.push({ message: `${key} is empty.`, line: index + 1 });
      return;
    }
    const payload = body as Record<string, unknown>;
    const surfaceId = typeof payload.surfaceId === "string" ? payload.surfaceId : "main";

    if (key === "createSurface" || key === "beginRendering") {
      const surface = ensure(surfaces, surfaceId);
      surface.created = true;
      surface.ready = true;
      if (typeof payload.catalogId === "string") surface.catalogId = payload.catalogId;
      if (typeof payload.root === "string") surface.rootId = payload.root;
      if (payload.theme && typeof payload.theme === "object") {
        surface.theme = payload.theme as SurfaceTheme;
      }
      return;
    }

    if (key === "deleteSurface") {
      const surface = ensure(surfaces, surfaceId);
      surface.deleted = true;
      return;
    }

    if (key === "updateDataModel" || key === "dataModelUpdate") {
      const surface = ensure(surfaces, surfaceId);
      applyData(surface, payload);
      return;
    }

    applyComponents(surfaces, surfaceId, payload.components, issues, index);
  });

  for (const surface of surfaces.values()) {
    if (surface.ready && !surface.rootId && surface.components.has("root")) surface.rootId = "root";
  }

  return { surfaces: [...surfaces.values()], issues };
}

export function resolveValue(value: unknown, data: Record<string, unknown>): unknown {
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, data));
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if (typeof record.path === "string" && Object.keys(record).length === 1) {
    return readPath(data, record.path);
  }
  if (record.call === "formatString" && record.args && typeof record.args === "object") {
    const template = (record.args as Record<string, unknown>).value;
    if (typeof template === "string") return interpolate(template, data);
  }
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(record)) out[key] = resolveValue(nested, data);
  return out;
}

function coerceMessages(input: string | unknown, issues: ParseIssue[]): unknown[] {
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // JSONL: one message per line.
    }
    const lines = trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line, index) => {
        try {
          return [JSON.parse(line) as unknown];
        } catch {
          issues.push({ message: "Could not parse JSONL line.", line: index + 1 });
          return [];
        }
      });
    return lines;
  }
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") return [input];
  issues.push({ message: "Input is empty." });
  return [];
}

function ensure(surfaces: Map<string, SurfaceModel>, id: string) {
  const existing = surfaces.get(id);
  if (existing) return existing;
  const surface: SurfaceModel = {
    id,
    catalogId: LATCH_CATALOG_ID,
    ready: false,
    created: false,
    deleted: false,
    components: new Map(),
    data: {},
  };
  surfaces.set(id, surface);
  return surface;
}

function applyComponents(
  surfaces: Map<string, SurfaceModel>,
  surfaceId: string,
  components: unknown,
  issues: ParseIssue[],
  index: number,
) {
  if (!Array.isArray(components)) {
    issues.push({ message: "components must be an array.", line: index + 1 });
    return;
  }
  const surface = ensure(surfaces, surfaceId);
  for (const raw of components) {
    const component = normalizeComponent(raw);
    if (!component) {
      issues.push({ message: "Skipped a component with no id or type.", line: index + 1 });
      continue;
    }
    surface.components.set(component.id, component);
  }
}

function applyData(surface: SurfaceModel, payload: Record<string, unknown>) {
  if ("value" in payload) {
    const path = typeof payload.path === "string" ? payload.path : "/";
    writePath(surface.data, path, payload.value);
    return;
  }
  const contents = payload.contents;
  if (Array.isArray(contents)) {
    const path = typeof payload.path === "string" ? payload.path : "/";
    const base = path === "/" ? surface.data : (readPath(surface.data, path) as Record<string, unknown>);
    const target = base && typeof base === "object" ? (base as Record<string, unknown>) : surface.data;
    for (const entry of contents) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      if (typeof record.key !== "string") continue;
      target[record.key] =
        record.valueString ?? record.valueNumber ?? record.valueBoolean ?? record.value ?? null;
    }
    return;
  }
  if (contents && typeof contents === "object") {
    Object.assign(surface.data, contents);
  }
}

export function normalizeComponent(raw: unknown): NormalizedComponent | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id) return null;
  const component = record.component;
  if (typeof component === "string") {
    const props = { ...record };
    delete props.id;
    delete props.component;
    const action = normalizeAction(props.action);
    delete props.action;
    return { id: record.id, type: component, props: unwrap(props) as Record<string, unknown>, action };
  }
  if (component && typeof component === "object" && !Array.isArray(component)) {
    const entries = Object.entries(component as Record<string, unknown>);
    if (entries.length !== 1) return null;
    const [type, props] = entries[0];
    const unwrapped = unwrap(props) as Record<string, unknown>;
    const action = normalizeAction(unwrapped?.action);
    if (unwrapped && typeof unwrapped === "object") delete unwrapped.action;
    return {
      id: record.id,
      type,
      props: unwrapped && typeof unwrapped === "object" ? unwrapped : {},
      action,
    };
  }
  return null;
}

function normalizeAction(action: unknown): NormalizedAction | undefined {
  if (!action || typeof action !== "object") return undefined;
  const record = action as Record<string, unknown>;
  const context = record.context && typeof record.context === "object" ? (record.context as Record<string, unknown>) : undefined;
  if (typeof record.name === "string") return { name: record.name, context };
  if (record.event && typeof record.event === "object") {
    const name = (record.event as Record<string, unknown>).name;
    if (typeof name === "string") return { name, context };
  }
  return undefined;
}

function unwrap(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(unwrap);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 1 && typeof record.literalString === "string") return record.literalString;
  if (keys.length === 1 && typeof record.path === "string") return { path: record.path };
  if (keys.length === 1 && Array.isArray(record.explicitList)) return record.explicitList.map(unwrap);
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(record)) out[key] = unwrap(nested);
  return out;
}

function writePath(data: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) {
    for (const key of Object.keys(data)) delete data[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(data, value);
    }
    return;
  }
  let cursor: Record<string, unknown> = data;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export function readPath(data: Record<string, unknown>, path: string): unknown {
  const parts = path.split("/").filter(Boolean);
  let cursor: unknown = data;
  for (const part of parts) {
    if (!cursor || typeof cursor !== "object" || !(part in (cursor as Record<string, unknown>))) return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

function interpolate(template: string, data: Record<string, unknown>) {
  return template.replace(/\$\{\/?([^}]+)\}/g, (_, raw: string) => {
    const value = readPath(data, raw.startsWith("/") ? raw : `/${raw}`);
    return value == null ? "" : String(value);
  });
}
