import { StakeIntention } from '@/apps/springSui/intentions/stake';

describe('SpringSui', () => {
  it('Test Stake intention serialization', () => {
    const intention = StakeIntention.fromData({
      amount: '10000',
      outCoinType: '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI',
    });

    expect(intention.serialize()).toBe(
      '{"amount":"10000","outCoinType":"0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI"}',
    );
  });
});
