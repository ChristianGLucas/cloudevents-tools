import { EventDocument, SpecVersionResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, MAX_DOCUMENT_CHARS } from './lib';

/**
 * Extract just the `specversion` attribute from a CloudEvents JSON document.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function getSpecVersion(ax: AxiomContext, input: EventDocument): Promise<SpecVersionResult> {
  const out = new SpecVersionResult();
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
  const sv = parsed.value['specversion'];
  if (typeof sv !== 'string') {
    out.setOk(false);
    out.setError('missing or non-string specversion');
    return out;
  }
  out.setOk(true);
  out.setSpecversion(sv);
  return out;
}
