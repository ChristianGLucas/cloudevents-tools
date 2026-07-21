import { EventDocument } from '../gen/messages_pb';
import { validateEvent } from './validate_event';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ValidateEvent', () => {
  it('accepts a spec-conformant event (independent oracle: the CNCF SDK compiled schema)', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({
      id: 'A234-1234', source: 'https://github.com/cloudevents', specversion: '1.0',
      type: 'com.github.pull_request.opened', time: '2018-04-05T17:31:00Z',
    })));
    expect(result.getValid()).toBe(true);
    expect(result.getViolationsList().length).toBe(0);
  });

  it('reports a violation naming the attribute for a missing required attribute', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({ source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getValid()).toBe(false);
    const violations = result.getViolationsList();
    expect(violations.some((v) => v.getAttribute() === 'id')).toBe(true);
  });

  it('reports a violation for an empty required attribute (minLength 1)', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({ id: '', source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getValid()).toBe(false);
    expect(result.getViolationsList().some((v) => v.getAttribute() === 'id')).toBe(true);
  });

  it('reports a violation for a time that is not RFC 3339', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', time: 'not-a-date',
    })));
    expect(result.getValid()).toBe(false);
    expect(result.getViolationsList().some((v) => v.getAttribute() === 'time')).toBe(true);
  });

  it('reports a violation for an extension attribute name with disallowed characters', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', 'my-Extension': 'v',
    })));
    expect(result.getValid()).toBe(false);
    expect(result.getViolationsList().some((v) => v.getAttribute() === 'my-Extension')).toBe(true);
  });

  it('does not flag data_base64 as an invalid attribute name (spec-defined exception)', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data_base64: 'AAA=',
    })));
    expect(result.getViolationsList().some((v) => v.getAttribute() === 'data_base64')).toBe(false);
  });

  it('still returns a best-effort event when invalid', async () => {
    const result = await validateEvent(ctx, doc(JSON.stringify({ source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getEvent()).toBeDefined();
    expect(result.getEvent()!.getSource()).toBe('/x');
  });

  it('returns valid=false (not a throw) for malformed JSON', async () => {
    const result = await validateEvent(ctx, doc('{not json'));
    expect(result.getValid()).toBe(false);
    expect(result.getViolationsList().length).toBeGreaterThan(0);
  });
});
