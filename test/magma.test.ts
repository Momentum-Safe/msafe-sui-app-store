import sortKeysRecursive from 'sort-keys-recursive';

import { CreatePoolIntention } from '@/apps/magma/intentions/create-pool';

const testData = {
  tick_spacing: 200,
  initialize_sqrt_price: '1234567890',
  uri: '',
  fix_amount_a: true,
  amount_a: '100000000',
  amount_b: '10000',
  coinTypeA: '0x26b3bc67befc214058ca78ea9a2690298d731a2d4309485ec3d40198063c4abc::magma::MAGMA',
  coinTypeB: '0x0588cff9a50e0eaf4cd50d337c1a36570bc1517793fd3303e1513e8ad4d2aa96::usdc::USDC',
  slippage: 0.005,
  metadata_a: '',
  metadata_b: '',
  tick_lower: -10000,
  tick_upper: 10000,
};

describe('Magma App', () => {
  it('Test Magma intention serialization', () => {
    const intention = CreatePoolIntention.fromData({
      txbParams: testData,
      action: 'OpenAndAddLiquidity',
    });

    expect(intention.serialize()).toBe(
      `{"action":"OpenAndAddLiquidity","txbParams":${JSON.stringify(sortKeysRecursive(testData))}}`,
    );
  });
});
