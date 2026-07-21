import { AttributeNameRequest } from '../gen/messages_pb';
import { validateAttributeName } from './validate_attribute_name';
import { ctx } from './testkit';

function req(name: string): AttributeNameRequest {
  const r = new AttributeNameRequest();
  r.setName(name);
  return r;
}

describe('ValidateAttributeName', () => {
  it('accepts a lower-case alphanumeric name', async () => {
    const result = await validateAttributeName(ctx, req('comexampleextension1'));
    expect(result.getValid()).toBe(true);
    expect(result.getReason()).toBe('');
  });

  it('rejects an upper-case character', async () => {
    const result = await validateAttributeName(ctx, req('comExample'));
    expect(result.getValid()).toBe(false);
    expect(result.getReason().length).toBeGreaterThan(0);
  });

  it('rejects a name with a hyphen or underscore', async () => {
    expect((await validateAttributeName(ctx, req('my-ext'))).getValid()).toBe(false);
    expect((await validateAttributeName(ctx, req('my_ext'))).getValid()).toBe(false);
  });

  it('rejects an empty name', async () => {
    const result = await validateAttributeName(ctx, req(''));
    expect(result.getValid()).toBe(false);
  });

  it('flags a name over the recommended 20-character length without making it invalid', async () => {
    const name = 'a'.repeat(25);
    const result = await validateAttributeName(ctx, req(name));
    expect(result.getValid()).toBe(true);
    expect(result.getExceedsRecommendedLength()).toBe(true);
  });

  it('does not flag a 20-character-or-shorter name', async () => {
    const result = await validateAttributeName(ctx, req('a'.repeat(20)));
    expect(result.getExceedsRecommendedLength()).toBe(false);
  });
});
