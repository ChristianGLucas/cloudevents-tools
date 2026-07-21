import { EventDocument, BinaryModeEvent } from '../gen/messages_pb';
import { structuredToBinary } from './structured_to_binary';
import { binaryToStructured } from './binary_to_structured';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('StructuredToBinary', () => {
  it('emits ce-id/ce-source/ce-specversion/ce-type for the required attributes', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({
      id: 'A234-1234', source: '/mycontext', specversion: '1.0', type: 'com.example.test',
    })));
    expect(result.getOk()).toBe(true);
    const byName = new Map(result.getHeadersList().map((h) => [h.getName(), h.getValue()]));
    expect(byName.get('ce-id')).toBe('A234-1234');
    expect(byName.get('ce-source')).toBe('/mycontext');
    expect(byName.get('ce-specversion')).toBe('1.0');
    expect(byName.get('ce-type')).toBe('com.example.test');
  });

  it('emits Content-Type only when datacontenttype was set on the source event', async () => {
    const withCt = await structuredToBinary(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', datacontenttype: 'application/json', data: { a: 1 },
    })));
    expect(new Map(withCt.getHeadersList().map((h) => [h.getName(), h.getValue()])).get('content-type')).toBe('application/json');

    const withoutCt = await structuredToBinary(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: { a: 1 },
    })));
    expect(withoutCt.getHeadersList().some((h) => h.getName() === 'content-type')).toBe(false);
  });

  it('emits a ce-<name> header for each extension attribute', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', comexampleextension1: 'value',
    })));
    const byName = new Map(result.getHeadersList().map((h) => [h.getName(), h.getValue()]));
    expect(byName.get('ce-comexampleextension1')).toBe('value');
  });

  it('body carries the JSON data payload as compact text', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: { z: 1 },
    })));
    expect(JSON.parse(result.getBody())).toEqual({ z: 1 });
  });

  it('body carries the base64 text verbatim for a data_base64 payload', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data_base64: 'AAECAw==',
    })));
    expect(result.getBody()).toBe('AAECAw==');
  });

  it('body is empty when there is no data payload', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({ id: '1', source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getBody()).toBe('');
  });

  it('round-trips through BinaryToStructured back to equivalent core attributes', async () => {
    const original = {
      id: 'RT-1', source: '/roundtrip', specversion: '1.0', type: 'com.example.rt',
      subject: 'rt-subject', datacontenttype: 'application/json', data: { ok: true },
    };
    const toBinary = await structuredToBinary(ctx, doc(JSON.stringify(original)));
    expect(toBinary.getOk()).toBe(true);

    const bme = new BinaryModeEvent();
    bme.setHeadersList(toBinary.getHeadersList());
    bme.setBody(toBinary.getBody());
    const back = await binaryToStructured(ctx, bme);

    expect(back.getOk()).toBe(true);
    const e = back.getEvent()!;
    expect(e.getId()).toBe(original.id);
    expect(e.getSource()).toBe(original.source);
    expect(e.getType()).toBe(original.type);
    expect(e.getSubject()).toBe(original.subject);
    expect(e.getDatacontenttype()).toBe(original.datacontenttype);
    expect(JSON.parse(e.getData())).toEqual(original.data);
  });

  it('returns ok=false when a required attribute is missing', async () => {
    const result = await structuredToBinary(ctx, doc(JSON.stringify({ source: '/x', specversion: '1.0', type: 't' })));
    expect(result.getOk()).toBe(false);
  });

  it('returns ok=false for malformed JSON', async () => {
    const result = await structuredToBinary(ctx, doc('{bad'));
    expect(result.getOk()).toBe(false);
  });
});
