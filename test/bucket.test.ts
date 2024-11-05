import { BucketHelper } from "@/apps/bucket/helper";
import { PsmInIntention } from "@/apps/bucket/intentions/psmIn";
import { MSafeApps } from "@/apps/registry";

describe('Bucket App', () => {
  it('Test Bucket intention serialization', () => {
    const intention = PsmInIntention.fromData({
      coinType: '0x2::sui::SUI',
      amount: "1000000",
    });

    expect(intention.serialize()).toBe(
      '{"action":"psm","txbParams":{"amount":"1000000","coin":"0x2::sui::SUI","isIn":true}}',
    );
  });

  it('Test psm-in deserialize', () => {
    const helper = new BucketHelper();
  });
});
