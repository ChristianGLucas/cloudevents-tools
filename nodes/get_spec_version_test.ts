import { EventDocument } from '../gen/messages_pb';
import { getSpecVersion } from './get_spec_version';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('GetSpecVersion', () => {
  it('extracts specversion', async () => {
    const result = await getSpecVersion(ctx, doc(JSON.stringify({ id: '1', source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getOk()).toBe(true);
    expect(result.getSpecversion()).toBe('1.0');
  });

  it('returns ok=false when specversion is missing', async () => {
    const result = await getSpecVersion(ctx, doc(JSON.stringify({ id: '1', source: '/x', type: 't' })));
    expect(result.getOk()).toBe(false);
  });

  it('returns ok=false when specversion is not a string', async () => {
    const result = await getSpecVersion(ctx, doc(JSON.stringify({ id: '1', source: '/x', specversion: 1.0, type: 't' })));
    expect(result.getOk()).toBe(false);
  });

  it('returns ok=false for malformed JSON', async () => {
    const result = await getSpecVersion(ctx, doc('nope'));
    expect(result.getOk()).toBe(false);
  });
});
