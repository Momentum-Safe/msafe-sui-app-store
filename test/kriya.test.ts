import { AddLiquidityIntention } from '@/apps/kriya/intentions/add-liquidity';
import { AddLiquiditySingleSideIntention } from '@/apps/kriya/intentions/add-liquiditySingleSided';
import { ClaimRewardsIntention } from '@/apps/kriya/intentions/claim-rewards';
import { RemoveLiquidityIntention } from '@/apps/kriya/intentions/remove-liquidity';
import { StakeLiquidityIntention } from '@/apps/kriya/intentions/stake-liquidity';
import { UnstakeLiquidityIntention } from '@/apps/kriya/intentions/unstake-liquidity';

describe('KRIYA App', () => {
  it('Test AddLiquidity intention serialization', () => {
    const intention = AddLiquidityIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      amountX: '1000',
      amountY: '500',
      minAddAmountX: '100',
      minAddAmountY: '100',
      coinX: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      coinY: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    });

    expect(intention.serialize()).toBe(
      '{"amountX":"1000","amountY":"500","coinX":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI","coinY":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI","minAddAmountX":"100","minAddAmountY":"100","objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });

  it('Test AddLiquiditySingleSide intention serialization', () => {
    const intention = AddLiquiditySingleSideIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      inputCoinType: 'sui',
      inputCoinAmount: '500',
      inputCoin: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    });

    expect(intention.serialize()).toBe(
      '{"inputCoin":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI","inputCoinAmount":"500","inputCoinType":"sui","objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });

  it('Test ClaimRewards intention serialization', () => {
    const intention = ClaimRewardsIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      positionObjectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
    });

    expect(intention.serialize()).toBe(
      '{"objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","positionObjectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });

  it('Test RemoveLiquidity intention serialization', () => {
    const intention = RemoveLiquidityIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      amount: '500',
      kriyaLpToken: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
    });

    expect(intention.serialize()).toBe(
      '{"amount":"500","kriyaLpToken":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });

  it('Test StakeLiquidity intention serialization', () => {
    const intention = StakeLiquidityIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      lpObject: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      lockTime: '1000',
    });

    expect(intention.serialize()).toBe(
      '{"lockTime":"1000","lpObject":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });

  it('Test UnstakeLiquidity intention serialization', () => {
    const intention = UnstakeLiquidityIntention.fromData({
      objectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
      tokenXType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      tokenYType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      positionObjectId: '0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305',
    });

    expect(intention.serialize()).toBe(
      '{"objectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","positionObjectId":"0x5af4976b871fa1813362f352fa4cada3883a96191bb7212db1bd5d13685ae305","tokenXType":"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN","tokenYType":"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"}',
    );
  });
});
