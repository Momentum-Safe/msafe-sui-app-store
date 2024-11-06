import { MintIntention } from '@/apps/springSui/intentions/mint';

describe('SpringSui', () => {
  it('Test Mint intention serialization', () => {
    const intention = MintIntention.fromData({
      amount: '10000',
    });

    expect(intention.serialize()).toBe('{"amount":"10000"}');
  });
});
