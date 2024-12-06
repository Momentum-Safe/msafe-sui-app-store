import { DepositDoubleAssetIntention } from '@/apps/alphafi/intentions/deposit-double-asset';

describe('Bucket App', () => {
  it('Test Bucket intention serialization', () => {
    const intention = DepositDoubleAssetIntention.fromData({
      poolName: 'ALPHA-SUI',
      amount: '1000000',
      isAmountA: true,
    });
    // console.log(intention.serialize());

    expect(intention.serialize()).toBe('{"amount":"1000000","isAmountA":true,"poolName":"ALPHA-SUI"}');
  });
});
