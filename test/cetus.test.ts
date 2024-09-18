import { XcetusConvertIntention } from '@/apps/cetus/intentions/xcetus-convert';

describe('Cetus App', () => {
  it('Test Cetus intention serialization', () => {
    const intention = XcetusConvertIntention.fromData({
      txbParams: {
        amount: '1000',
        venft_id: 'venftidx1123',
      },
      action: 'xCETUSConvert',
    });

    expect(intention.serialize()).toBe(
      '{"action":"xCETUSConvert","txbParams":{"amount":"1000","venft_id":"venftidx1123"}}',
    );
  });
});
