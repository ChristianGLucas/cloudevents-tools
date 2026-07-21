import { BatchDocument } from '../gen/messages_pb';
import { batchParse } from './batch_parse';
import { ctx } from './testkit';
import { MAX_BATCH_EVENTS } from './lib';

function doc(json: string): BatchDocument {
  const d = new BatchDocument();
  d.setJson(json);
  return d;
}

describe('BatchParse', () => {
  it('parses every event in a valid batch, in order', async () => {
    const batch = [
      { id: '1', source: '/a', specversion: '1.0', type: 't1' },
      { id: '2', source: '/b', specversion: '1.0', type: 't2' },
    ];
    const result = await batchParse(ctx, doc(JSON.stringify(batch)));
    expect(result.getOk()).toBe(true);
    const items = result.getEventsList();
    expect(items.length).toBe(2);
    expect(items[0].getIndex()).toBe(0);
    expect(items[0].getOk()).toBe(true);
    expect(items[0].getEvent()!.getId()).toBe('1');
    expect(items[1].getIndex()).toBe(1);
    expect(items[1].getEvent()!.getId()).toBe('2');
  });

  it('reports a single malformed event on its own item without failing the batch', async () => {
    const batch = [
      { id: '1', source: '/a', specversion: '1.0', type: 't1' },
      { source: '/b', specversion: '1.0', type: 't2' }, // missing id
      { id: '3', source: '/c', specversion: '1.0', type: 't3' },
    ];
    const result = await batchParse(ctx, doc(JSON.stringify(batch)));
    expect(result.getOk()).toBe(true);
    const items = result.getEventsList();
    expect(items.length).toBe(3);
    expect(items[0].getOk()).toBe(true);
    expect(items[1].getOk()).toBe(false);
    expect(items[1].getError().length).toBeGreaterThan(0);
    expect(items[2].getOk()).toBe(true);
  });

  it('reports a non-object array element on its own item', async () => {
    const result = await batchParse(ctx, doc(JSON.stringify(['not-an-event'])));
    expect(result.getOk()).toBe(true);
    expect(result.getEventsList()[0].getOk()).toBe(false);
  });

  it('fails the whole batch for non-array JSON', async () => {
    const result = await batchParse(ctx, doc(JSON.stringify({ id: '1' })));
    expect(result.getOk()).toBe(false);
    expect(result.getError().length).toBeGreaterThan(0);
  });

  it('fails the whole batch for malformed JSON', async () => {
    const result = await batchParse(ctx, doc('[not json'));
    expect(result.getOk()).toBe(false);
  });

  it('fails the whole batch when it exceeds the maximum event count', async () => {
    const batch = Array.from({ length: MAX_BATCH_EVENTS + 1 }, (_, i) => ({
      id: String(i), source: '/x', specversion: '1.0', type: 't',
    }));
    const result = await batchParse(ctx, doc(JSON.stringify(batch)));
    expect(result.getOk()).toBe(false);
  });

  it('parses an empty batch', async () => {
    const result = await batchParse(ctx, doc('[]'));
    expect(result.getOk()).toBe(true);
    expect(result.getEventsList().length).toBe(0);
  });
});
