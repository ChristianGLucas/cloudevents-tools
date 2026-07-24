import { BatchDocument, BatchParseResult, BatchItem } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, extractRequired, buildStructuredEvent } from './lib';

/**
 * Parse a CloudEvents batch document (a JSON array of structured-mode
 * events) into individual parsed events, one BatchItem per array element.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function batchParse(ax: AxiomContext, input: BatchDocument): Promise<BatchParseResult> {
  const out = new BatchParseResult();
  const parsed = safeParseJson(input.getJson() || '');
  if (!parsed.ok) {
    out.setOk(false);
    out.setError(parsed.error);
    return out;
  }
  if (!Array.isArray(parsed.value)) {
    out.setOk(false);
    out.setError('document is not a JSON array');
    return out;
  }

  const items: BatchItem[] = [];
  for (let i = 0; i < parsed.value.length; i++) {
    const item = new BatchItem();
    item.setIndex(i);
    const el = parsed.value[i];
    if (!isPlainObject(el)) {
      item.setOk(false);
      item.setError('array element is not a JSON object');
      items.push(item);
      continue;
    }
    const required = extractRequired(el);
    if (!required.ok) {
      item.setOk(false);
      item.setError(required.error);
      items.push(item);
      continue;
    }
    item.setOk(true);
    item.setEvent(buildStructuredEvent(el));
    items.push(item);
  }

  out.setOk(true);
  out.setEventsList(items);
  return out;
}
