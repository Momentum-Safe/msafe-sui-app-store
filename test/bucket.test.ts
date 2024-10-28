import { PsmIntention } from '@/apps/bucket/intentions/psm';

describe('Bucket App', () => {
  it('Test Bucket intention serialization', () => {
    const intention = PsmIntention.fromData({
      txbParams: {
        amount: "1000000",
        coin: '0x2::sui::SUI',
        isIn: true,
      },
      action: 'psm',
    });

    expect(intention.serialize()).toBe(
      '{"action":"psm","txbParams":{"amount":"1000000","coin":"0x2::sui::SUI","isIn":true}}',
    );
  });
});
