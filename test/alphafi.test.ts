import { ClaimRewardIntention } from '@/apps/alphafi/intentions/claim-reward';
import { DepositDoubleAssetIntention } from '@/apps/alphafi/intentions/deposit-double-asset';
import { DepositSingleAssetIntention } from '@/apps/alphafi/intentions/deposit-single-asset';
import { WithdrawIntention } from '@/apps/alphafi/intentions/withdraw';
import { WithdrawAlphaIntention } from '@/apps/alphafi/intentions/withdraw-alpha';

describe('AlphaFi App', () => {
  it('Test AlphaFi Double Asset intention serialization', () => {
    const intention = DepositDoubleAssetIntention.fromData({
      poolName: 'ALPHA-SUI',
      amount: '1000000',
      isAmountA: true,
    });

    expect(intention.serialize()).toBe('{"amount":"1000000","isAmountA":true,"poolName":"ALPHA-SUI"}');
  });

  it('Test AlphaFi Single Asset intention serialization', () => {
    const intention = DepositSingleAssetIntention.fromData({
      poolName: 'ALPHA',
      amount: '1000000',
    });

    expect(intention.serialize()).toBe('{"amount":"1000000","poolName":"ALPHA"}');
  });

  it('Test AlphaFi Withdraw Alpha intention serialization', () => {
    const intention = WithdrawAlphaIntention.fromData({
      xTokensAmount: '1000000',
      withdrawFromLocked: true,
    });

    expect(intention.serialize()).toBe('{"withdrawFromLocked":true,"xTokensAmount":"1000000"}');
  });

  it('Test AlphaFi Withdraw intention serialization', () => {
    const intention = WithdrawIntention.fromData({
      xTokensAmount: '1000000',
      poolName: 'ALPHA-SUI',
    });

    expect(intention.serialize()).toBe('{"poolName":"ALPHA-SUI","xTokensAmount":"1000000"}');
  });

  it('Test AlphaFi Claim Reward intention serialization', () => {
    const intention = ClaimRewardIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });
});
