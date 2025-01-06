import { StakeIntention } from '@/apps/springSui/intentions/stake';

describe('SpringSui', () => {
  it('Test Stake intention serialization', () => {
    const intention = StakeIntention.fromData({
      amount: '10000',
    });

    expect(intention.serialize()).toBe('{"amount":"10000"}');
  });
});
