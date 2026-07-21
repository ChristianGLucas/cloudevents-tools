import { EventDocument, OptionalAttributesResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, extractOptional, MAX_DOCUMENT_CHARS } from './lib';

/**
 * Extract the four OPTIONAL CloudEvents v1.0 context attributes —
 * datacontenttype, dataschema, subject, time — each with a has_* presence
 * flag.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function extractOptionalAttributes(ax: AxiomContext, input: EventDocument): Promise<OptionalAttributesResult> {
  const out = new OptionalAttributesResult();
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
  const optional = extractOptional(parsed.value);
  out.setOk(true);
  out.setDatacontenttype(optional.datacontenttype);
  out.setHasDatacontenttype(optional.hasDatacontenttype);
  out.setDataschema(optional.dataschema);
  out.setHasDataschema(optional.hasDataschema);
  out.setSubject(optional.subject);
  out.setHasSubject(optional.hasSubject);
  out.setTime(optional.time);
  out.setHasTime(optional.hasTime);
  return out;
}
