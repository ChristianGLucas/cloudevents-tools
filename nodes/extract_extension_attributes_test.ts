import { EventDocument } from '../gen/messages_pb';
import { extractExtensionAttributes } from './extract_extension_attributes';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ExtractExtensionAttributes', () => {
  it('extracts only attributes outside the context set and data/data_base64', async () => {
    const result = await extractExtensionAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', datacontenttype: 'application/json',
      dataschema: 's', subject: 'sub', time: '2020-01-01T00:00:00Z', data: { a: 1 }, data_base64: undefined,
      comexampletracestate: 'congestion=42', comexamplepriority: 3,
    })));
    expect(result.getOk()).toBe(true);
    const names = result.getExtensionsList().map((e) => e.getName()).sort();
    expect(names).toEqual(['comexamplepriority', 'comexampletracestate']);
  });

  it('detects value_type for each JSON scalar/compound kind', async () => {
    const result = await extractExtensionAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
      extstr: 'hello', extnum: 42, extbool: false, extnull: null, extobj: { k: 'v' }, extarr: [1, 2],
    })));
    const byName = new Map(result.getExtensionsList().map((e) => [e.getName(), e]));
    expect(byName.get('extstr')!.getValueType()).toBe('string');
    expect(byName.get('extnum')!.getValueType()).toBe('number');
    expect(byName.get('extbool')!.getValueType()).toBe('boolean');
    expect(byName.get('extnull')!.getValueType()).toBe('null');
    expect(byName.get('extobj')!.getValueType()).toBe('object');
    expect(byName.get('extarr')!.getValueType()).toBe('array');
  });

  it('value_json round-trips losslessly for a compound value', async () => {
    const original = { nested: [1, 'two', { three: 3 }] };
    const result = await extractExtensionAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', extcompound: original,
    })));
    const ext = result.getExtensionsList()[0];
    expect(JSON.parse(ext.getValueJson())).toEqual(original);
  });

  it('returns an empty list (not an error) when there are no extensions', async () => {
    const result = await extractExtensionAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getExtensionsList().length).toBe(0);
  });

  it('returns ok=false for malformed JSON', async () => {
    const result = await extractExtensionAttributes(ctx, doc('{{{'));
    expect(result.getOk()).toBe(false);
  });
});
