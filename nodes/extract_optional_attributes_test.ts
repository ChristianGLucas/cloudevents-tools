import { EventDocument } from '../gen/messages_pb';
import { extractOptionalAttributes } from './extract_optional_attributes';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ExtractOptionalAttributes', () => {
  it('extracts every optional attribute with has_* = true when present', async () => {
    const result = await extractOptionalAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
      datacontenttype: 'application/json', dataschema: 'https://example.com/schema.json',
      subject: 'mysubject', time: '2018-04-05T17:31:00Z',
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getHasDatacontenttype()).toBe(true);
    expect(result.getDatacontenttype()).toBe('application/json');
    expect(result.getHasDataschema()).toBe(true);
    expect(result.getHasSubject()).toBe(true);
    expect(result.getHasTime()).toBe(true);
    expect(result.getTime()).toBe('2018-04-05T17:31:00Z');
  });

  it('has_* is false and value is empty when an optional attribute is absent', async () => {
    const result = await extractOptionalAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't',
    })));
    expect(result.getHasDatacontenttype()).toBe(false);
    expect(result.getDatacontenttype()).toBe('');
    expect(result.getHasSubject()).toBe(false);
    expect(result.getHasTime()).toBe(false);
    expect(result.getHasDataschema()).toBe(false);
  });

  it('distinguishes an explicitly empty-string optional attribute from an absent one', async () => {
    const result = await extractOptionalAttributes(ctx, doc(JSON.stringify({
      id: '1', source: '/x', specversion: '1.0', type: 't', subject: '',
    })));
    expect(result.getHasSubject()).toBe(true);
    expect(result.getSubject()).toBe('');
  });

  it('returns ok=false for a non-object document', async () => {
    const result = await extractOptionalAttributes(ctx, doc('"just a string"'));
    expect(result.getOk()).toBe(false);
  });
});
