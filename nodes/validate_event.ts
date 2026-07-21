import { EventDocument, ValidateEventResult, Violation } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, structuralViolations, buildStructuredEvent, MAX_DOCUMENT_CHARS } from './lib';

/**
 * Validate a CloudEvents v1.0 JSON document against the spec's structural
 * rules, using the CNCF reference SDK's own compiled JSON Schema.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function validateEvent(ax: AxiomContext, input: EventDocument): Promise<ValidateEventResult> {
  const out = new ValidateEventResult();
  const parsed = safeParseJson(input.getJson() || '', MAX_DOCUMENT_CHARS);
  if (!parsed.ok) {
    out.setValid(false);
    const v = new Violation();
    v.setAttribute('');
    v.setMessage(parsed.error);
    out.addViolations(v);
    return out;
  }
  if (!isPlainObject(parsed.value)) {
    out.setValid(false);
    const v = new Violation();
    v.setAttribute('');
    v.setMessage('document is not a JSON object');
    out.addViolations(v);
    return out;
  }
  const issues = structuralViolations(parsed.value);
  out.setValid(issues.length === 0);
  for (const issue of issues) {
    const v = new Violation();
    v.setAttribute(issue.attribute);
    v.setMessage(issue.message);
    out.addViolations(v);
  }
  // Best-effort event population even when invalid: buildStructuredEvent
  // only requires the four required attrs to build a meaningful object;
  // when they're absent it still returns a (mostly empty) StructuredEvent
  // rather than throwing, since it never enforces presence itself.
  out.setEvent(buildStructuredEvent(parsed.value));
  return out;
}
