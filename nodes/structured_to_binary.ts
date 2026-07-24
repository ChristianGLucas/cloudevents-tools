import { EventDocument, ModeConversionResult, Header } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  safeParseJson,
  isPlainObject,
  extractRequired,
  extractOptional,
  classifyData,
  extractExtensions,
  ATTR_TO_CE_HEADER,
  CE_HEADER_PREFIX,
  CONTENT_TYPE_HEADER,
} from './lib';

function header(name: string, value: string): Header {
  const h = new Header();
  h.setName(name);
  h.setValue(value);
  return h;
}

/**
 * Convert a structured-mode CloudEvents v1.0 JSON document into binary-mode:
 * `ce-*`-prefixed HTTP headers plus a body.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function structuredToBinary(ax: AxiomContext, input: EventDocument): Promise<ModeConversionResult> {
  const out = new ModeConversionResult();
  const parsed = safeParseJson(input.getJson() || '');
  if (!parsed.ok) {
    out.setOk(false);
    out.setError(parsed.error);
    return out;
  }
  if (!isPlainObject(parsed.value)) {
    out.setOk(false);
    out.setError('document is not a JSON object');
    return out;
  }
  const obj = parsed.value;
  const required = extractRequired(obj);
  if (!required.ok) {
    out.setOk(false);
    out.setError(required.error);
    return out;
  }
  const optional = extractOptional(obj);
  const data = classifyData(obj);
  const extensions = extractExtensions(obj);

  const headers: Header[] = [];
  headers.push(header(ATTR_TO_CE_HEADER.id, required.id));
  headers.push(header(ATTR_TO_CE_HEADER.source, required.source));
  headers.push(header(ATTR_TO_CE_HEADER.specversion, required.specversion));
  headers.push(header(ATTR_TO_CE_HEADER.type, required.type));
  if (optional.hasTime) headers.push(header(ATTR_TO_CE_HEADER.time, optional.time));
  if (optional.hasSubject) headers.push(header(ATTR_TO_CE_HEADER.subject, optional.subject));
  if (optional.hasDataschema) headers.push(header(ATTR_TO_CE_HEADER.dataschema, optional.dataschema));
  // Content-Type is emitted only when the source event set datacontenttype
  // itself — never invented, per this package's no-fabrication rule.
  if (optional.hasDatacontenttype) headers.push(header(CONTENT_TYPE_HEADER, optional.datacontenttype));

  for (const ext of extensions) {
    headers.push(header(`${CE_HEADER_PREFIX}${ext.name}`, ext.value));
  }

  let body: string;
  if (data.encoding === 'base64') {
    // A data_base64 payload's base64 text is carried through as the body
    // verbatim — this package works over text-only representations, never
    // raw bytes, so there is no lossless "decode to bytes" step to perform.
    body = data.dataBase64;
  } else if (data.encoding === 'json' || data.encoding === 'text') {
    body = data.data;
  } else {
    body = '';
  }

  out.setOk(true);
  out.setHeadersList(headers);
  out.setBody(body);
  return out;
}
