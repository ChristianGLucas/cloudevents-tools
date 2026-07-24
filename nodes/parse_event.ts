import { EventDocument, ParseEventResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, extractRequired, buildStructuredEvent } from './lib';

/**
 * Parse a structured-mode CloudEvents v1.0 JSON document into its fully
 * broken-out attributes and data.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function parseEvent(ax: AxiomContext, input: EventDocument): Promise<ParseEventResult> {
  const out = new ParseEventResult();
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
  if (!required.ok) {
    out.setOk(false);
    out.setError(required.error);
    return out;
  }
  out.setOk(true);
  out.setEvent(buildStructuredEvent(parsed.value));
  return out;
}
