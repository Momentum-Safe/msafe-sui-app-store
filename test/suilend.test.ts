import { DepositIntention } from '@/apps/suilend/intentions/deposit';

describe('Suilend', () => {
  it('Test Deposit intention serialization', () => {
    const intention = DepositIntention.fromData({
      coinType: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      value: '10000',
    });

    expect(intention.serialize()).toBe(
      '{"coinType":"0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP","value":"10000"}',
    );
  });
});
