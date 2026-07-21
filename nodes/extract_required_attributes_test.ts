import { EventDocument } from '../gen/messages_pb';
import { extractRequiredAttributes } from './extract_required_attributes';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ExtractRequiredAttributes', () => {
  it('extracts all four required attributes', async () => {
    const result = await extractRequiredAttributes(ctx, doc(JSON.stringify({
      id: 'id-1', source: '/src', specversion: '1.0', type: 'com.example.t', subject: 'ignored-here',
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getId()).toBe('id-1');
    expect(result.getSource()).toBe('/src');
    expect(result.getSpecversion()).toBe('1.0');
    expect(result.getType()).toBe('com.example.t');
  });

  it('reports ok=false naming every missing attribute', async () => {
    const result = await extractRequiredAttributes(ctx, doc(JSON.stringify({ type: 't' })));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toContain('id');
    expect(result.getError()).toContain('source');
    expect(result.getError()).toContain('specversion');
  });

  it('treats a non-string required attribute as missing', async () => {
    const result = await extractRequiredAttributes(ctx, doc(JSON.stringify({
      id: 123, source: '/x', specversion: '1.0', type: 't',
    })));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toContain('id');
  });

  it('returns ok=false for malformed JSON', async () => {
    const result = await extractRequiredAttributes(ctx, doc('not json at all'));
    expect(result.getOk()).toBe(false);
  });
});
