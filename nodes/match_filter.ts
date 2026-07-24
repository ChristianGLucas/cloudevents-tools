import { MatchFilterRequest, MatchFilterResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject } from './lib';

/**
 * Check a CloudEvent against a caller-supplied structural filter — the pure
 * routing primitive. Every filter field the caller sets must match for
 * `matches` to be true; an unset filter field is not checked.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function matchFilter(ax: AxiomContext, input: MatchFilterRequest): Promise<MatchFilterResult> {
  const out = new MatchFilterResult();
  const parsed = safeParseJson(input.getEventJson() || '');
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

  const type = typeof parsed.value['type'] === 'string' ? (parsed.value['type'] as string) : '';
  const source = typeof parsed.value['source'] === 'string' ? (parsed.value['source'] as string) : '';
  const subject = typeof parsed.value['subject'] === 'string' ? (parsed.value['subject'] as string) : '';

  const reasons: string[] = [];
  let matches = true;

  const check = (name: string, cond: boolean) => {
    reasons.push(`${name}: ${cond ? 'pass' : 'fail'}`);
    if (!cond) matches = false;
  };

  const typeExact = input.getTypeExact();
  if (typeExact.length > 0) check('type_exact', type === typeExact);
  const typePrefix = input.getTypePrefix();
  if (typePrefix.length > 0) check('type_prefix', type.startsWith(typePrefix));
  const sourceExact = input.getSourceExact();
  if (sourceExact.length > 0) check('source_exact', source === sourceExact);
  const sourcePrefix = input.getSourcePrefix();
  if (sourcePrefix.length > 0) check('source_prefix', source.startsWith(sourcePrefix));
  const subjectExact = input.getSubjectExact();
  if (subjectExact.length > 0) check('subject_exact', subject === subjectExact);

  out.setOk(true);
  out.setMatches(matches);
  out.setReasonsList(reasons);
  return out;
}
