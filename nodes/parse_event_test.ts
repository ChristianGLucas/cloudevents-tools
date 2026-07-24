import { EventDocument } from '../gen/messages_pb';
import { parseEvent } from './parse_event';
import { ctx } from './testkit';
function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ParseEvent', () => {
  it('parses a minimal valid structured-mode event', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: 'A234-1234', source: '/mycontext', specversion: '1.0', type: 'com.example.test',
    })));
    expect(result.getOk()).toBe(true);
    const ev = result.getEvent()!;
    expect(ev.getId()).toBe('A234-1234');
    expect(ev.getSource()).toBe('/mycontext');
    expect(ev.getSpecversion()).toBe('1.0');
    expect(ev.getType()).toBe('com.example.test');
    expect(ev.getHasData()).toBe(false);
    expect(ev.getDataEncoding()).toBe('empty');
    expect(ev.getExtensionsList().length).toBe(0);
  });

  it('extracts optional attributes with presence flags', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', subject: 'mysubject.txt',
    })));
    const ev = result.getEvent()!;
    expect(ev.getHasSubject()).toBe(true);
    expect(ev.getSubject()).toBe('mysubject.txt');
    expect(ev.getHasTime()).toBe(false);
    expect(ev.getHasDatacontenttype()).toBe(false);
    expect(ev.getHasDataschema()).toBe(false);
  });

  it('classifies a JSON object data payload and round-trips it', async () => {
    const original = { a: 1, b: [1, 2, 3], c: { nested: true } };
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: original,
    })));
    const ev = result.getEvent()!;
    expect(ev.getHasData()).toBe(true);
    expect(ev.getDataEncoding()).toBe('json');
    expect(JSON.parse(ev.getData())).toEqual(original);
  });

  it('classifies a JSON string data payload as text', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: 'hello world',
    })));
    const ev = result.getEvent()!;
    expect(ev.getDataEncoding()).toBe('text');
    expect(ev.getData()).toBe('hello world');
  });

  it('classifies data_base64 as base64', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data_base64: 'AAECAw==',
    })));
    const ev = result.getEvent()!;
    expect(ev.getDataEncoding()).toBe('base64');
    expect(ev.getDataBase64()).toBe('AAECAw==');
    expect(ev.getData()).toBe('');
  });

  it('extracts extension attributes with lossless value_json round-trip', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
      comexampleextension1: 'value', comexampleothervalue: 5, comexampleflag: true,
    })));
    const ev = result.getEvent()!;
    const byName = new Map(ev.getExtensionsList().map((e) => [e.getName(), e]));
    expect(byName.get('comexampleextension1')!.getValue()).toBe('value');
    expect(byName.get('comexampleextension1')!.getValueType()).toBe('string');
    expect(JSON.parse(byName.get('comexampleextension1')!.getValueJson())).toBe('value');
    expect(byName.get('comexampleothervalue')!.getValueType()).toBe('number');
    expect(JSON.parse(byName.get('comexampleothervalue')!.getValueJson())).toBe(5);
    expect(byName.get('comexampleflag')!.getValueType()).toBe('boolean');
    expect(JSON.parse(byName.get('comexampleflag')!.getValueJson())).toBe(true);
  });

  it('returns ok=false for malformed JSON, not a throw', async () => {
    const result = await parseEvent(ctx, doc('{not json'));
    expect(result.getOk()).toBe(false);
    expect(result.getError().length).toBeGreaterThan(0);
  });

  it('returns ok=false for a JSON array (not an object)', async () => {
    const result = await parseEvent(ctx, doc('[1,2,3]'));
    expect(result.getOk()).toBe(false);
  });

  it('returns ok=false when a required attribute is missing', async () => {
    const result = await parseEvent(ctx, doc(JSON.stringify({ source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toContain('id');
  });

  it('handles a large document without crashing (payload-size caps are the platform\'s job, not this node\'s)', async () => {
    const huge = JSON.stringify({ id: '1', source: '/x', specversion: '1.0', type: 't', data: 'x'.repeat(2_000_000) });
    const result = await parseEvent(ctx, doc(huge));
    expect(result.getOk()).toBe(true);
    expect(result.getEvent()!.getId()).toBe('1');
  });

  it('rejects pathologically deep nesting rather than risking a stack overflow', async () => {
    let deep = '0';
    for (let i = 0; i < 100_000; i++) deep = `[${deep}]`;
    const json = JSON.stringify({ id: '1', source: '/x', specversion: '1.0', type: 't' }).slice(0, -1) + `,"data":${deep}}`;
    const result = await parseEvent(ctx, doc(json));
    expect(result.getOk()).toBe(false);
  });
});
