import { ClosePosition } from '@/apps/bluefin/intentions/close-position';
import { CollectFee } from '@/apps/bluefin/intentions/collect-fee';
import { CollectFeeAndRewards } from '@/apps/bluefin/intentions/collect-fee-and-rewards';
import { CollectRewards } from '@/apps/bluefin/intentions/collect-rewards';
import { OpenAndAddLiquidity } from '@/apps/bluefin/intentions/open-position-with-liquidity copy';
import { ProvideLiquidity } from '@/apps/bluefin/intentions/provide-liquidity';
import { RemoveLiquidity } from '@/apps/bluefin/intentions/remove-liquidity';
import { TransactionSubType } from '@/apps/bluefin/types';

describe('Bluefin App', () => {
  it('Test `OpenAndAddLiquidity` intention serialization', () => {
    const intention = OpenAndAddLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5,
        isCoinA: true,
        slippage: 0.025,
      },
      action: TransactionSubType.OpenAndAddLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"OpenAndAddLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
    );
  });

  it('Test `ProvideLiquidity` intention serialization', () => {
    const intention = ProvideLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5,
        isCoinA: true,
        slippage: 0.025,
      },
      action: TransactionSubType.ProvideLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"ProvideLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
    );
  });

  it('Test `RemoveLiquidity` intention serialization', () => {
    const intention = RemoveLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5,
        isCoinA: true,
        slippage: 0.025,
      },
      action: TransactionSubType.RemoveLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"RemoveLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
    );
  });

  it('Test `ClosePosition` intention serialization', () => {
    const intention = ClosePosition.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.ClosePosition,
    });
    expect(intention.serialize()).toBe(
      '{"action":"ClosePosition","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectFee` intention serialization', () => {
    const intention = CollectFee.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectFee,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectFee","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectRewards` intention serialization', () => {
    const intention = CollectRewards.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectRewards,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectFeeAndRewards` intention serialization', () => {
    const intention = CollectFeeAndRewards.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectFeeAndRewards,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectFeeAndRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });
});
