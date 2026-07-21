import { BinaryModeEvent, Header } from '../gen/messages_pb';
import { detectMode } from './detect_mode';
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

describe('DetectMode', () => {
  it('detects "structured" from a cloudevents+json Content-Type', async () => {
    const result = await detectMode(ctx, ev([h('Content-Type', 'application/cloudevents+json; charset=utf-8')]));
    expect(result.getOk()).toBe(true);
    expect(result.getMode()).toBe('structured');
  });

  it('detects "batch" from a cloudevents-batch+json Content-Type', async () => {
    const result = await detectMode(ctx, ev([h('content-type', 'application/cloudevents-batch+json')]));
    expect(result.getMode()).toBe('batch');
  });

  it('detects "binary" from a ce-id header with an ordinary Content-Type', async () => {
    const result = await detectMode(ctx, ev([h('ce-id', '1234'), h('Content-Type', 'application/json')]));
    expect(result.getMode()).toBe('binary');
  });

  it('detects "binary" from a ce-id header with no Content-Type at all', async () => {
    const result = await detectMode(ctx, ev([h('ce-id', '1234')]));
    expect(result.getMode()).toBe('binary');
  });

  it('returns "unknown" when neither signal is present', async () => {
    const result = await detectMode(ctx, ev([h('X-Custom', 'value')]));
    expect(result.getMode()).toBe('unknown');
  });

  it('header name matching is case-insensitive', async () => {
    const result = await detectMode(ctx, ev([h('CE-ID', '1234')]));
    expect(result.getMode()).toBe('binary');
  });
});
