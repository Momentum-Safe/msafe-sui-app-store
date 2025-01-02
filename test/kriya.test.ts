import sortKeysRecursive from 'sort-keys-recursive';

import { AddLiquidityIntention } from '@/apps/kriya/intentions/v2/add-liquidity';
import { TransactionSubType } from '@/apps/kriya/types';

const testData = {
  address: '0x69994bce41891b4d4c07276b0edd66e25b2e9fcbb77e8990ee92c7997374dd09',
  amountA: '0.01',
  amountB: '0.02',
  pool: {
    poolId: '0xf385dee283495bb70500f5f8491047cd5a2ef1b7ff5f410e6dfe8a3c3ba58716',
    tokenXType: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
    tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    lspType:
      '0x2::balance::Supply<0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66::spot_dex::LSP<0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT, 0x2::sui::SUI>>',
    lpFeesPercent: '75',
    protocolFeesPercent: '25',
    isStable: false,
    tokenXReserve: '3025668495914240',
    tokenYReserve: '5162890505425404',
    lpSupply: '4086488326024544',
    tvl: '35322899.44443315',
    volume: '5000000',
    fees: '0',
    apy: '0',
    feeApy: '0.38749650270165276',
    timestamp: '2024-12-26T14:07:30.203Z',
    tokenX: {
      coinType: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      name: 'voloSUI',
      ticker: 'vSUI',
      iconUrl: 'https://kriya-assets.s3.ap-southeast-1.amazonaws.com/assets/voloSUI.webp',
      decimals: 9,
      description: 'Liquid Staked SUI',
      isVerified: true,
      isKriyaWhitelisted: true,
      tokenType: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      price: '4.41133394',
    },
    tokenY: {
      coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      name: 'SUI',
      ticker: 'SUI',
      iconUrl: 'https://hop.ag/tokens/SUI.svg',
      decimals: 9,
      description: '',
      isVerified: true,
      isKriyaWhitelisted: true,
      tokenType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      price: '4.25693775',
    },
  },
};

describe('Kriya App', () => {
  it('Test AddLiquidity intention serialization', () => {
    const intention = AddLiquidityIntention.fromData({
      params: testData,
      action: TransactionSubType.AddLiquidity,
    });

    expect(intention.serialize()).toBe(
      `{"action":"AddLiquidity","params":${JSON.stringify(sortKeysRecursive(testData))}}`,
    );
  });
});
