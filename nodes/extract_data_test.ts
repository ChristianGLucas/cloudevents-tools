import { EventDocument } from '../gen/messages_pb';
import { extractData } from './extract_data';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ExtractData', () => {
  it('classifies a JSON object payload as "json" with compact re-encoding', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: { z: 1, a: 2 },
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getHasData()).toBe(true);
    expect(result.getDataEncoding()).toBe('json');
    expect(JSON.parse(result.getData())).toEqual({ z: 1, a: 2 });
  });

  it('classifies a JSON array payload as "json"', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: [1, 2, 3],
    })));
    expect(result.getDataEncoding()).toBe('json');
    expect(JSON.parse(result.getData())).toEqual([1, 2, 3]);
  });

  it('classifies a JSON string payload as "text"', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data: 'plain text body',
    })));
    expect(result.getDataEncoding()).toBe('text');
    expect(result.getData()).toBe('plain text body');
  });

  it('classifies data_base64 as "base64" and leaves data empty', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', data_base64: 'SGVsbG8=',
    })));
    expect(result.getDataEncoding()).toBe('base64');
    expect(result.getDataBase64()).toBe('SGVsbG8=');
    expect(result.getData()).toBe('');
  });

  it('classifies as "empty" when neither data nor data_base64 is present', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
    })));
    expect(result.getHasData()).toBe(false);
    expect(result.getDataEncoding()).toBe('empty');
  });

  it('reports the datacontenttype alongside the payload', async () => {
    const result = await extractData(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', datacontenttype: 'application/json', data: { a: 1 },
    })));
    expect(result.getDatacontenttype()).toBe('application/json');
  });

  it('returns ok=false for malformed JSON, not a throw', async () => {
    const result = await extractData(ctx, doc('{bad'));
    expect(result.getOk()).toBe(false);
  });
});
