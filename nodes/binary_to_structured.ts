import { BinaryModeEvent, ModeConversionResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  sanitizeHeaders,
  extractRequired,
  buildStructuredEvent,
  safeParseJson,
  looksLikeJsonContentType,
  ATTR_TO_CE_HEADER,
  CE_HEADER_TO_ATTR,
  CE_HEADER_PREFIX,
  CONTENT_TYPE_HEADER,
  MAX_DOCUMENT_CHARS,
} from './lib';

/**
 * Convert a caller-supplied binary-mode CloudEvent (`ce-`-prefixed HTTP
 * headers + body) into structured-mode: a single JSON document.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function binaryToStructured(ax: AxiomContext, input: BinaryModeEvent): Promise<ModeConversionResult> {
  const out = new ModeConversionResult();
  const sanitized = sanitizeHeaders(input.getHeadersList());
  if (!sanitized.ok) {
    out.setOk(false);
    out.setError(sanitized.error);
    return out;
  }
  const h = sanitized.map;

  const body = input.getBody() || '';
  if (body.length > MAX_DOCUMENT_CHARS) {
    out.setOk(false);
    out.setError(`body exceeds maximum length of ${MAX_DOCUMENT_CHARS} characters (got ${body.length})`);
    return out;
  }

  // Build a synthetic structured-mode object from the binary headers, then
  // reuse the same extraction/build pipeline structured-mode JSON goes
  // through, for one consistent code path.
  const obj: Record<string, unknown> = {};
  for (const [attr, header] of Object.entries(ATTR_TO_CE_HEADER)) {
    if (h[header] !== undefined) obj[attr] = h[header];
  }
  if (h[CONTENT_TYPE_HEADER] !== undefined) obj['datacontenttype'] = h[CONTENT_TYPE_HEADER];

  const knownHeaders = new Set(Object.keys(CE_HEADER_TO_ATTR));
  for (const headerName of Object.keys(h)) {
    if (headerName === CONTENT_TYPE_HEADER) continue;
    if (!headerName.startsWith(CE_HEADER_PREFIX)) continue;
    if (knownHeaders.has(headerName)) continue;
    const extName = headerName.substring(CE_HEADER_PREFIX.length);
    if (extName.length === 0) continue;
    obj[extName] = h[headerName];
  }

  const required = extractRequired(obj);
  if (!required.ok) {
    out.setOk(false);
    out.setError(`missing required ce-* header(s): ${required.error.replace('missing or non-string required attribute(s): ', '')}`);
    return out;
  }

  if (body.length > 0) {
    const contentType = typeof obj['datacontenttype'] === 'string' ? (obj['datacontenttype'] as string) : '';
    if (contentType.length === 0 || looksLikeJsonContentType(contentType)) {
      const parsedBody = safeParseJson(body, MAX_DOCUMENT_CHARS);
      if (parsedBody.ok) {
        obj['data'] = parsedBody.value;
      } else {
        // Claimed/assumed JSON but didn't parse — fall back to text rather
        // than failing the whole conversion; the body is preserved verbatim.
        obj['data'] = body;
      }
    } else {
      obj['data'] = body;
    }
  }

  out.setOk(true);
  const event = buildStructuredEvent(obj);
  out.setEvent(event);
  out.setStructuredJson(JSON.stringify(obj));
  return out;
}
