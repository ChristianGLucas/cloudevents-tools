// Shared bounds, JSON-safety helpers, and CloudEvents v1.0 attribute
// extraction/validation logic used by every node in this package. Not a
// node and not a test file, so it is neither registered nor collected.
//
// WHY THIS FILE EXISTS INSTEAD OF USING cloudevents' `CloudEvent` CLASS
// DIRECTLY: the CNCF SDK's `CloudEvent` constructor — and everything built
// on it (`HTTP.deserialize`/`HTTP.toEvent`, `HTTP.binary`, `HTTP.structured`)
// — silently FABRICATES a missing `id` via `uuid.v4()` and a missing `time`
// via `new Date().toISOString()` (see cloudevents/dist/event/cloudevent.js:
// `this.id = properties.id || uuid_1.v4()`; `this.time = properties.time ||
// new Date().toISOString()`, unconditional even in non-strict mode). Every
// node in this package must NEVER generate an id or read the wall clock —
// a missing required attribute is a validation failure to report, not a
// value to invent. So this package never constructs a `CloudEvent` and never
// calls the SDK's HTTP transport helpers; it deep-imports ONLY the SDK's
// compiled, side-effect-free v1.0 JSON Schema validator
// (cloudevents/dist/schema/v1 — an ajv-generated pure function: given data,
// returns a boolean and sets `.errors`; no uuid, no Date, no I/O) for
// structural/format conformance checking (source/dataschema URI-reference
// format, time RFC 3339 format — exactly the CNCF reference SDK's own
// encoding of the spec, not a hand-rolled regex), and hand-writes the rest
// (attribute extraction, extension detection, binary<->structured header
// mapping) as straightforward, spec-mechanical glue.

import validateV1SchemaRaw from 'cloudevents/dist/schema/v1';
import { StructuredEvent, ExtensionAttribute, Header } from '../gen/messages_pb';

/** ajv attaches `.errors` to the validate function itself after a failed
 * call; the shipped .d.ts for the deep schema module doesn't declare it. */
interface AjvValidateFn {
  (data: unknown): boolean;
  errors?: Array<{ instancePath: string; schemaPath: string; keyword: string; params: Record<string, unknown>; message?: string }> | null;
}
const validateV1Schema = validateV1SchemaRaw as unknown as AjvValidateFn;

// ---- Bounds --------------------------------------------------------------
// A real CloudEvent is typically well under a few KB; these ceilings are
// generous (comfortably under the platform's ~4 MiB node-transport cap,
// with headroom) while still bounding worst-case cost from a hostile caller.
export const MAX_DOCUMENT_CHARS = 1_000_000; // one EventDocument / BinaryModeEvent body
export const MAX_BATCH_CHARS = 3_000_000; // one BatchDocument
export const MAX_BATCH_EVENTS = 1_000;
export const MAX_HEADERS = 500;
export const MAX_HEADER_NAME_CHARS = 256;
export const MAX_HEADER_VALUE_CHARS = 65_536;
export const MAX_FILTER_FIELD_CHARS = 4_096;
export const MAX_ATTRIBUTE_NAME_CHARS = 4_096;
// JSON nesting depth ceiling, enforced by an iterative (non-recursive) walk
// BEFORE any operation (JSON.stringify, further traversal) that could
// recurse on the parsed structure — bounding cost independent of
// MAX_DOCUMENT_CHARS, since a pathologically deep document ("[[[[...") can
// be small in bytes yet deep enough to overflow a native recursive stack.
export const MAX_JSON_DEPTH = 64;

// ---- CloudEvents v1.0 attribute vocabulary --------------------------------
export const REQUIRED_ATTRS = ['id', 'source', 'specversion', 'type'] as const;
export const OPTIONAL_ATTRS = ['datacontenttype', 'dataschema', 'subject', 'time'] as const;
export const KNOWN_CONTEXT_ATTRS = new Set<string>([...REQUIRED_ATTRS, ...OPTIONAL_ATTRS]);
export const DATA_KEYS = new Set<string>(['data', 'data_base64']);
/** CloudEvents v1.0 §2.1: attribute names MUST be lower-case ASCII letters
 * or digits only. `data_base64` is a spec-defined literal exception (see
 * cloudevents/dist/event/spec.js's own `key !== "data_base64"` skip). */
export const ATTR_NAME_RE = /^[a-z0-9]+$/;
export const RECOMMENDED_MAX_NAME_LEN = 20;

export type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

export function classifyJsonType(v: unknown): JsonType {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  const t = typeof v;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  return 'object';
}

/** Best-effort plain-string rendering of a JSON value (numbers/booleans
 * stringified, objects/arrays JSON-encoded). Use value_json for a lossless
 * round-trip instead. */
export function bestEffortString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Iteratively (explicit stack, never JS call recursion) verify that a
 * parsed JSON value never nests deeper than maxDepth. Call this BEFORE any
 * recursive operation (JSON.stringify, further walks) on caller-supplied
 * data — it is the only thing standing between a deeply-nested payload and
 * a native stack overflow, which no try/catch can reliably contain. */
export function checkJsonDepth(root: unknown, maxDepth: number): void {
  const stack: Array<{ v: unknown; d: number }> = [{ v: root, d: 0 }];
  while (stack.length > 0) {
    const top = stack.pop() as { v: unknown; d: number };
    if (top.d > maxDepth) {
      throw new Error(`JSON nesting depth exceeds maximum of ${maxDepth}`);
    }
    if (Array.isArray(top.v)) {
      for (const item of top.v) stack.push({ v: item, d: top.d + 1 });
    } else if (top.v !== null && typeof top.v === 'object') {
      for (const key of Object.keys(top.v as Record<string, unknown>)) {
        stack.push({ v: (top.v as Record<string, unknown>)[key], d: top.d + 1 });
      }
    }
  }
}

export interface SafeParseResult {
  ok: boolean;
  error: string;
  value: unknown;
}

/** JSON.parse with a hard size cap (checked BEFORE parsing) and a hard
 * nesting-depth cap (checked immediately after, before the value is used
 * for anything else). Never throws — malformed/oversized input is reported
 * as a structured result. */
export function safeParseJson(text: string, maxChars: number): SafeParseResult {
  if (text.length > maxChars) {
    return { ok: false, error: `input exceeds maximum length of ${maxChars} characters (got ${text.length})`, value: undefined };
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `invalid JSON: ${e instanceof Error ? e.message : String(e)}`, value: undefined };
  }
  try {
    checkJsonDepth(value, MAX_JSON_DEPTH);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), value: undefined };
  }
  return { ok: true, error: '', value };
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ---- Attribute extraction --------------------------------------------------

export interface RequiredFields {
  ok: boolean;
  error: string;
  id: string;
  source: string;
  specversion: string;
  type: string;
}

/** Presence + string-type check only (no format/URI/RFC3339 validation —
 * that is ValidateEvent's job via the SDK's compiled schema). */
export function extractRequired(obj: Record<string, unknown>): RequiredFields {
  const out: RequiredFields = { ok: true, error: '', id: '', source: '', specversion: '', type: '' };
  const missing: string[] = [];
  for (const key of REQUIRED_ATTRS) {
    const v = obj[key];
    if (typeof v !== 'string') {
      missing.push(key);
    } else {
      (out as unknown as Record<string, string>)[key] = v;
    }
  }
  if (missing.length > 0) {
    out.ok = false;
    out.error = `missing or non-string required attribute(s): ${missing.join(', ')}`;
  }
  return out;
}

export interface OptionalFields {
  datacontenttype: string;
  hasDatacontenttype: boolean;
  dataschema: string;
  hasDataschema: boolean;
  subject: string;
  hasSubject: boolean;
  time: string;
  hasTime: boolean;
}

export function extractOptional(obj: Record<string, unknown>): OptionalFields {
  const out: OptionalFields = {
    datacontenttype: '', hasDatacontenttype: false,
    dataschema: '', hasDataschema: false,
    subject: '', hasSubject: false,
    time: '', hasTime: false,
  };
  if (typeof obj.datacontenttype === 'string') { out.datacontenttype = obj.datacontenttype; out.hasDatacontenttype = true; }
  if (typeof obj.dataschema === 'string') { out.dataschema = obj.dataschema; out.hasDataschema = true; }
  if (typeof obj.subject === 'string') { out.subject = obj.subject; out.hasSubject = true; }
  if (typeof obj.time === 'string') { out.time = obj.time; out.hasTime = true; }
  return out;
}

export interface ExtensionField {
  name: string;
  value: string;
  valueJson: string;
  valueType: JsonType;
}

/** Every top-level key outside the fixed context-attribute set and
 * data/data_base64, in document order. */
export function extractExtensions(obj: Record<string, unknown>): ExtensionField[] {
  const out: ExtensionField[] = [];
  for (const key of Object.keys(obj)) {
    if (KNOWN_CONTEXT_ATTRS.has(key) || DATA_KEYS.has(key)) continue;
    const v = obj[key];
    out.push({ name: key, value: bestEffortString(v), valueJson: JSON.stringify(v), valueType: classifyJsonType(v) });
  }
  return out;
}

export type DataEncoding = 'json' | 'text' | 'base64' | 'empty';

export interface DataFields {
  hasData: boolean;
  encoding: DataEncoding;
  data: string;
  dataBase64: string;
}

/** Classifies and extracts the `data`/`data_base64` payload. `data_base64`
 * takes precedence when both are (unusually) present, matching the spec's
 * "MUST NOT both be present" expectation — we don't reject that here (it's
 * ValidateEvent's job to flag), just pick a deterministic winner. */
export function classifyData(obj: Record<string, unknown>): DataFields {
  const db64 = obj['data_base64'];
  if (typeof db64 === 'string' && db64.length > 0) {
    return { hasData: true, encoding: 'base64', data: '', dataBase64: db64 };
  }
  if (!Object.prototype.hasOwnProperty.call(obj, 'data') || obj['data'] === undefined) {
    return { hasData: false, encoding: 'empty', data: '', dataBase64: '' };
  }
  const v = obj['data'];
  if (typeof v === 'string') {
    return { hasData: true, encoding: 'text', data: v, dataBase64: '' };
  }
  return { hasData: true, encoding: 'json', data: JSON.stringify(v), dataBase64: '' };
}

// ---- Structural validation (SDK's own compiled v1.0 JSON Schema) ---------

export interface ValidationIssue {
  attribute: string;
  message: string;
}

/** Runs the CNCF SDK's compiled v1.0 JSON Schema (required attrs, string
 * types, source/dataschema URI(-reference) format, time RFC 3339 format)
 * against a parsed document, PLUS the spec's attribute-naming rule (§2.1)
 * across every top-level key. Pure: no CloudEvent object is constructed. */
export function structuralViolations(obj: Record<string, unknown>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const schemaOk = validateV1Schema(obj);
  if (!schemaOk && validateV1Schema.errors) {
    for (const e of validateV1Schema.errors) {
      let attribute = e.instancePath ? e.instancePath.replace(/^\//, '') : '';
      if (!attribute && e.keyword === 'required' && typeof e.params?.missingProperty === 'string') {
        attribute = e.params.missingProperty;
      }
      issues.push({ attribute, message: e.message || e.keyword });
    }
  }
  for (const key of Object.keys(obj)) {
    if (key === 'data_base64') continue;
    if (!ATTR_NAME_RE.test(key)) {
      issues.push({ attribute: key, message: 'attribute names MUST consist of lower-case letters (a-z) or digits (0-9) only' });
    }
  }
  return issues;
}

// ---- Binary-mode <-> structured-mode header mapping -----------------------
// Hand-mapped directly from the CloudEvents v1.0 HTTP Protocol Binding spec
// (§3: the ce-<attr> header <-> JSON attribute correspondence is a fixed,
// one-line-per-attribute table — mechanical, not "the hard part").
export const CE_HEADER_PREFIX = 'ce-';
export const CONTENT_TYPE_HEADER = 'content-type';
/** attribute name -> ce-<attr> header name, for the attributes with a
 * dedicated (non-extension) binary-mode header. datacontenttype maps to the
 * plain Content-Type header instead, handled separately. */
export const ATTR_TO_CE_HEADER: Record<string, string> = {
  id: 'ce-id',
  source: 'ce-source',
  specversion: 'ce-specversion',
  type: 'ce-type',
  time: 'ce-time',
  subject: 'ce-subject',
  dataschema: 'ce-dataschema',
};
export const CE_HEADER_TO_ATTR: Record<string, string> = Object.fromEntries(
  Object.entries(ATTR_TO_CE_HEADER).map(([attr, header]) => [header, attr]),
);
export const MIME_CE_BATCH_PREFIX = 'application/cloudevents-batch';
export const MIME_CE_PREFIX = 'application/cloudevents';

export function looksLikeJsonContentType(contentType: string): boolean {
  const ct = contentType.toLowerCase();
  return ct.includes('json');
}

export interface SanitizedHeaders {
  ok: boolean;
  error: string;
  /** Lower-cased header name -> value. Duplicate names (case-insensitive)
   * resolve last-one-wins, in the order supplied. */
  map: Record<string, string>;
}

/** Bounds and lower-cases a caller-supplied header list. Never throws. */
export function sanitizeHeaders(headers: Header[]): SanitizedHeaders {
  if (headers.length > MAX_HEADERS) {
    return { ok: false, error: `headers exceeds maximum of ${MAX_HEADERS} entries (got ${headers.length})`, map: {} };
  }
  const map: Record<string, string> = {};
  for (const h of headers) {
    const name = h.getName() || '';
    const value = h.getValue() || '';
    if (name.length > MAX_HEADER_NAME_CHARS) {
      return { ok: false, error: `header name exceeds maximum length of ${MAX_HEADER_NAME_CHARS} characters`, map: {} };
    }
    if (value.length > MAX_HEADER_VALUE_CHARS) {
      return { ok: false, error: `header value exceeds maximum length of ${MAX_HEADER_VALUE_CHARS} characters`, map: {} };
    }
    map[name.toLowerCase()] = value;
  }
  return { ok: true, error: '', map };
}

export type HttpMode = 'binary' | 'structured' | 'batch' | 'unknown';

/** Mirrors cloudevents/dist/message/http/index.js's getMode(): Content-Type
 * wins when present (batch prefix, then plain cloudevents prefix), else a
 * ce-id header signals binary mode. */
export function detectHttpMode(sanitized: Record<string, string>): HttpMode {
  const contentType = sanitized[CONTENT_TYPE_HEADER];
  if (contentType) {
    const ct = contentType.toLowerCase();
    if (ct.startsWith(MIME_CE_BATCH_PREFIX)) return 'batch';
    if (ct.startsWith(MIME_CE_PREFIX)) return 'structured';
  }
  if (sanitized['ce-id']) return 'binary';
  return 'unknown';
}

/** Build a fully-populated StructuredEvent proto message from a parsed
 * structured-mode CloudEvent object. Callers must have already verified
 * `obj` carries the four required attributes (via extractRequired) — this
 * function does not itself enforce that. */
export function buildStructuredEvent(obj: Record<string, unknown>): StructuredEvent {
  const required = extractRequired(obj);
  const optional = extractOptional(obj);
  const data = classifyData(obj);
  const extensions = extractExtensions(obj);

  const ev = new StructuredEvent();
  ev.setId(required.id);
  ev.setSource(required.source);
  ev.setSpecversion(required.specversion);
  ev.setType(required.type);
  ev.setDatacontenttype(optional.datacontenttype);
  ev.setHasDatacontenttype(optional.hasDatacontenttype);
  ev.setDataschema(optional.dataschema);
  ev.setHasDataschema(optional.hasDataschema);
  ev.setSubject(optional.subject);
  ev.setHasSubject(optional.hasSubject);
  ev.setTime(optional.time);
  ev.setHasTime(optional.hasTime);
  ev.setHasData(data.hasData);
  ev.setData(data.data);
  ev.setDataBase64(data.dataBase64);
  ev.setDataEncoding(data.encoding);
  for (const ext of extensions) {
    const e = new ExtensionAttribute();
    e.setName(ext.name);
    e.setValue(ext.value);
    e.setValueJson(ext.valueJson);
    e.setValueType(ext.valueType);
    ev.addExtensions(e);
  }
  return ev;
}
