import { EventDocument, RequiredAttributesResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, extractRequired } from './lib';

/**
 * Extract just the four REQUIRED CloudEvents v1.0 context attributes — id,
 * source, specversion, type.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function extractRequiredAttributes(ax: AxiomContext, input: EventDocument): Promise<RequiredAttributesResult> {
  const out = new RequiredAttributesResult();
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
  const required = extractRequired(parsed.value);
  out.setOk(required.ok);
  out.setError(required.error);
  out.setId(required.id);
  out.setSource(required.source);
  out.setSpecversion(required.specversion);
  out.setType(required.type);
  return out;
}
