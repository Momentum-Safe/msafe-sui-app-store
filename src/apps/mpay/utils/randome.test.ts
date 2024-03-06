import { generateGroupId } from './random';

describe('Test random', () => {
  it('UUID', () => {
    const uuid = generateGroupId();
    expect(uuid.length).toBe(21);
  });
});
