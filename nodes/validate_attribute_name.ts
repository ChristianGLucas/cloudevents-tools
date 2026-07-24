import { AttributeNameRequest, AttributeNameResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { ATTR_NAME_RE, RECOMMENDED_MAX_NAME_LEN } from './lib';

/**
 * Validate a single attribute name against the CloudEvents v1.0 naming rule
 * (lower-case ASCII letters and digits only), independent of any event.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function validateAttributeName(ax: AxiomContext, input: AttributeNameRequest): Promise<AttributeNameResult> {
  const out = new AttributeNameResult();
  const name = input.getName() || '';
  if (name.length === 0) {
    out.setValid(false);
    out.setReason('attribute name must not be empty');
    return out;
  }
  if (!ATTR_NAME_RE.test(name)) {
    out.setValid(false);
    out.setReason("attribute names MUST consist of lower-case letters (a-z) or digits (0-9) only");
    out.setExceedsRecommendedLength(name.length > RECOMMENDED_MAX_NAME_LEN);
    return out;
  }
  out.setValid(true);
  out.setReason('');
  out.setExceedsRecommendedLength(name.length > RECOMMENDED_MAX_NAME_LEN);
  return out;
}
