import { BinaryModeEvent, DetectModeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { sanitizeHeaders, detectHttpMode } from './lib';

/**
 * Determine which CloudEvents HTTP representation mode a caller-supplied
 * headers+body pair is in — "structured", "batch", "binary", or "unknown".
 * Pure header/content-type inspection; the body is never parsed.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function detectMode(ax: AxiomContext, input: BinaryModeEvent): Promise<DetectModeResult> {
  const out = new DetectModeResult();
  const sanitized = sanitizeHeaders(input.getHeadersList());
  if (!sanitized.ok) {
    out.setOk(false);
    out.setError(sanitized.error);
    return out;
  }
  out.setOk(true);
  out.setMode(detectHttpMode(sanitized.map));
  return out;
}
