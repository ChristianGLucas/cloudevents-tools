import { EventDocument } from '../gen/messages_pb';
import { extractRoutingFields } from './extract_routing_fields';
import { ctx } from './testkit';

function doc(json: string): EventDocument {
  const d = new EventDocument();
  d.setJson(json);
  return d;
}

describe('ExtractRoutingFields', () => {
  it('extracts type, source, and subject', async () => {
    const result = await extractRoutingFields(ctx, doc(JSON.stringify({
      id: '1', source: '/orders', specversion: '1.0', type: 'com.example.order.created', subject: 'order-42',
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getType()).toBe('com.example.order.created');
    expect(result.getSource()).toBe('/orders');
    expect(result.getSubject()).toBe('order-42');
  });

  it('subject is empty when absent, without failing', async () => {
    const result = await extractRoutingFields(ctx, doc(JSON.stringify({
      id: '1', source: '/orders', specversion: '1.0', type: 't',
    })));
    expect(result.getOk()).toBe(true);
    expect(result.getSubject()).toBe('');
  });

  it('returns ok=false when type or source is missing', async () => {
    const result = await extractRoutingFields(ctx, doc(JSON.stringify({ id: '1', specversion: '1.0', type: 't' })));
    expect(result.getOk()).toBe(false);
  });
});
