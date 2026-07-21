import { BinaryModeEvent, Header, EventDocument } from '../gen/messages_pb';
import { binaryToStructured } from './binary_to_structured';
import { parseEvent } from './parse_event';
import { ctx } from './testkit';

function h(name: string, value: string): Header {
  const header = new Header();
  header.setName(name);
  header.setValue(value);
  return header;
}

function ev(headers: Header[], body = ''): BinaryModeEvent {
  const e = new BinaryModeEvent();
  e.setHeadersList(headers);
  e.setBody(body);
  return e;
}

describe('BinaryToStructured', () => {
  it('maps every ce-* header to its context attribute (hand-computed against the HTTP protocol binding spec table)', async () => {
    const result = await binaryToStructured(ctx, ev([
      h('ce-id', 'A234-1234'),
      h('ce-source', '/mycontext'),
      h('ce-specversion', '1.0'),
      h('ce-type', 'com.example.test'),
      h('ce-subject', 'mysubject'),
      h('ce-time', '2018-04-05T17:31:00Z'),
      h('ce-dataschema', 'https://example.com/schema.json'),
      h('Content-Type', 'application/json'),
    ], JSON.stringify({ a: 1 })));
    expect(result.getOk()).toBe(true);
    const e = result.getEvent()!;
    expect(e.getId()).toBe('A234-1234');
    expect(e.getSource()).toBe('/mycontext');
    expect(e.getSpecversion()).toBe('1.0');
    expect(e.getType()).toBe('com.example.test');
    expect(e.getSubject()).toBe('mysubject');
    expect(e.getTime()).toBe('2018-04-05T17:31:00Z');
    expect(e.getDataschema()).toBe('https://example.com/schema.json');
    expect(e.getHasDatacontenttype()).toBe(true);
    expect(e.getDatacontenttype()).toBe('application/json');
    expect(e.getDataEncoding()).toBe('json');
    expect(JSON.parse(e.getData())).toEqual({ a: 1 });
  });

  it('maps an unrecognized ce-<name> header to an extension attribute', async () => {
    const result = await binaryToStructured(ctx, ev([
      h('ce-id', '1'), h('ce-source', '/x'), h('ce-specversion', '1.0'), h('ce-type', 't'),
      h('ce-comexampleextension1', 'value'),
    ]));
    const ext = result.getEvent()!.getExtensionsList();
    expect(ext.length).toBe(1);
    expect(ext[0].getName()).toBe('comexampleextension1');
    expect(ext[0].getValue()).toBe('value');
  });

  it('keeps a non-JSON body as text', async () => {
    const result = await binaryToStructured(ctx, ev([
      h('ce-id', '1'), h('ce-source', '/x'), h('ce-specversion', '1.0'), h('ce-type', 't'),
      h('Content-Type', 'text/plain'),
    ], 'hello world'));
    const e = result.getEvent()!;
    expect(e.getDataEncoding()).toBe('text');
    expect(e.getData()).toBe('hello world');
  });

  it('cross-checks against ParseEvent: the equivalent structured JSON parses to the same core attributes', async () => {
    const structuredJson = JSON.stringify({
      id: 'X1', source: '/svc', specversion: '1.0', type: 'com.example.thing', subject: 'sub1',
    });
    const inputDoc = new EventDocument();
    inputDoc.setJson(structuredJson);
    const parsed = await parseEvent(ctx, inputDoc);
    const converted = await binaryToStructured(ctx, ev([
      h('ce-id', 'X1'), h('ce-source', '/svc'), h('ce-specversion', '1.0'), h('ce-type', 'com.example.thing'), h('ce-subject', 'sub1'),
    ]));
    expect(converted.getEvent()!.getId()).toBe(parsed.getEvent()!.getId());
    expect(converted.getEvent()!.getSource()).toBe(parsed.getEvent()!.getSource());
    expect(converted.getEvent()!.getType()).toBe(parsed.getEvent()!.getType());
    expect(converted.getEvent()!.getSubject()).toBe(parsed.getEvent()!.getSubject());
  });

  it('returns ok=false when a required ce-* header is missing', async () => {
    const result = await binaryToStructured(ctx, ev([h('ce-id', '1'), h('ce-source', '/x'), h('ce-specversion', '1.0')]));
    expect(result.getOk()).toBe(false);
    expect(result.getError()).toContain('type');
  });

  it('returns ok=false for an oversized header list', async () => {
    const headers = Array.from({ length: 501 }, (_, i) => h(`ce-ext${i}`, 'v'));
    const result = await binaryToStructured(ctx, ev(headers));
    expect(result.getOk()).toBe(false);
  });
});
