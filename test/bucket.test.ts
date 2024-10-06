import { PsmInIntention } from "@/apps/bucket/intentions/psm-in";

describe('Bucket Protocol', () => {
  it('Test Bucket PSM in transaction', () => {
    const intention = PsmInIntention.fromData({
      txbParams: {
        amount: '1000',
        coinType: '0x2::sui::SUI',
      },
      action: 'psmIn',
    });

    expect(intention.serialize()).toBe(
      '{"action":"psmIn","txbParams":{"amount":"1000","coinType":"0x2::sui::SUI"}}',
    );
  });
});
