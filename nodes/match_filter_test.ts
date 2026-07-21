import { MatchFilterRequest } from '../gen/messages_pb';
import { matchFilter } from './match_filter';
import { ctx } from './testkit';

const EVENT = JSON.stringify({
  id: '1', source: '/orders/service-a', specversion: '1.0',
  type: 'com.example.order.created', subject: 'order-42',
});

function req(overrides: Partial<{
  eventJson: string; typeExact: string; typePrefix: string; sourceExact: string; sourcePrefix: string; subjectExact: string;
}>): MatchFilterRequest {
  const r = new MatchFilterRequest();
  r.setEventJson(overrides.eventJson ?? EVENT);
  r.setTypeExact(overrides.typeExact ?? '');
  r.setTypePrefix(overrides.typePrefix ?? '');
  r.setSourceExact(overrides.sourceExact ?? '');
  r.setSourcePrefix(overrides.sourcePrefix ?? '');
  r.setSubjectExact(overrides.subjectExact ?? '');
  return r;
}

describe('MatchFilter', () => {
  it('matches on a type prefix', async () => {
    const result = await matchFilter(ctx, req({ typePrefix: 'com.example.order.' }));
    expect(result.getOk()).toBe(true);
    expect(result.getMatches()).toBe(true);
  });

  it('fails a type prefix that does not match', async () => {
    const result = await matchFilter(ctx, req({ typePrefix: 'com.other.' }));
    expect(result.getMatches()).toBe(false);
  });

  it('matches an exact source', async () => {
    const result = await matchFilter(ctx, req({ sourceExact: '/orders/service-a' }));
    expect(result.getMatches()).toBe(true);
  });

  it('requires ALL set filter fields to pass (AND semantics)', async () => {
    const passing = await matchFilter(ctx, req({ typePrefix: 'com.example.', sourceExact: '/orders/service-a' }));
    expect(passing.getMatches()).toBe(true);
    const failing = await matchFilter(ctx, req({ typePrefix: 'com.example.', sourceExact: '/wrong-source' }));
    expect(failing.getMatches()).toBe(false);
  });

  it('is vacuously true when no filter field is set', async () => {
    const result = await matchFilter(ctx, req({}));
    expect(result.getMatches()).toBe(true);
    expect(result.getReasonsList().length).toBe(0);
  });

  it('does not check an unset filter field (only set fields count)', async () => {
    const result = await matchFilter(ctx, req({ typeExact: 'com.example.order.created' }));
    expect(result.getMatches()).toBe(true);
    expect(result.getReasonsList().length).toBe(1);
  });

  it('matches subject exactly', async () => {
    const match = await matchFilter(ctx, req({ subjectExact: 'order-42' }));
    expect(match.getMatches()).toBe(true);
    const noMatch = await matchFilter(ctx, req({ subjectExact: 'order-99' }));
    expect(noMatch.getMatches()).toBe(false);
  });

  it('returns ok=false for malformed event JSON', async () => {
    const result = await matchFilter(ctx, req({ eventJson: '{not json' }));
    expect(result.getOk()).toBe(false);
  });
});
