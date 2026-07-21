import { EventDocument, RoutingFieldsResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, MAX_DOCUMENT_CHARS } from './lib';

/**
 * Extract the three attributes a router typically keys decisions on — type,
 * source, subject — in one call.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function extractRoutingFields(ax: AxiomContext, input: EventDocument): Promise<RoutingFieldsResult> {
  const out = new RoutingFieldsResult();
  const parsed = safeParseJson(input.getJson() || '', MAX_DOCUMENT_CHARS);
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
  const type = parsed.value['type'];
  const source = parsed.value['source'];
  if (typeof type !== 'string' || typeof source !== 'string') {
    out.setOk(false);
    out.setError('missing or non-string required attribute(s): type and/or source');
    return out;
  }
  const subject = parsed.value['subject'];
  out.setOk(true);
  out.setType(type);
  out.setSource(source);
  out.setSubject(typeof subject === 'string' ? subject : '');
  return out;
}
