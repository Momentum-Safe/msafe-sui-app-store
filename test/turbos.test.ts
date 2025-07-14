import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { Decoder } from '@/apps/turbos/decoder';
import {
  AddLiquidityIntentionData,
  CollectFeeIntentionData,
  RemoveLiquidityIntentionData,
  TransactionSubType,
} from '@/apps/turbos/types';

import { Account } from './config';

describe('Turbos App', () => {
  it('Test `decodeCollectFee` decoder', async () => {
    const tx = new Transaction();

    const collectFeeData: CollectFeeIntentionData = {
      pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
      address: Account.address,
      nft: '0x2abc123def456789012345678901234567890123456789012345678901234567',
      collectAmountA: '1000000',
      collectAmountB: '2000000',
      deadline: 1735689600000,
    };

    const turbosSdk = new TurbosSdk(Network.mainnet);

    const config = await turbosSdk.contract.getConfig();

    const collectFeeTx = await turbosSdk.pool.collectFee({
      pool: collectFeeData.pool,
      address: collectFeeData.address,
      nft: collectFeeData.nft,
      collectAmountA: collectFeeData.collectAmountA,
      collectAmountB: collectFeeData.collectAmountB,
      deadline: collectFeeData.deadline,
      txb: tx as any,
    });

    const decoder = new Decoder(collectFeeTx as any, turbosSdk, config);
    const result = await decoder.decode(Account.address);
    console.log(result, 'result');

    expect(result.txType).toBe(TransactionType.Other);
    expect(result.type).toBe(TransactionSubType.CollectFee);

    const intentionData = result.intentionData as CollectFeeIntentionData;
    expect(intentionData.pool).toBe(collectFeeData.pool);
    expect(intentionData.address).toBe(collectFeeData.address);
    expect(intentionData.nft).toBe(collectFeeData.nft);
    expect(intentionData.collectAmountA).toBe(Number(collectFeeData.collectAmountA));
    expect(intentionData.collectAmountB).toBe(Number(collectFeeData.collectAmountB));
    // expect(intentionData.deadline).toBe(collectFeeData.deadline.toString());
  });

  it('Test `CollectFeeIntention` serialization', () => {
    const collectFeeData: CollectFeeIntentionData = {
      pool: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
      address: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
      nft: '0x2abc123def456789012345678901234567890123456789012345678901234567',
      collectAmountA: '1000000',
      collectAmountB: '2000000',
      deadline: 1735689600000,
    };

    const expectedSerialization = JSON.stringify({
      pool: collectFeeData.pool,
      address: collectFeeData.address,
      nft: collectFeeData.nft,
      collectAmountA: collectFeeData.collectAmountA,
      collectAmountB: collectFeeData.collectAmountB,
      deadline: collectFeeData.deadline,
    });

    expect(JSON.stringify(collectFeeData)).toBe(expectedSerialization);
  });

  it('Test `decodeRemoveLiquidity` decoder', async () => {
    const tx = new Transaction();

    const removeLiquidityData: RemoveLiquidityIntentionData = {
      pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
      decreaseLiquidity: '589258512',
      nft: '0xdd23a3dad13784101dd6ba28bbf6c3ce9788a180e63f3269839a7702401d1733',
      amountA: '0',
      amountB: '709209',
      slippage: 30,
      address: Account.address,
      collectAmountA: '1004161450',
      collectAmountB: '1015750',
      rewardAmounts: ['0', '5698820', '0'],
      deadline: 3600000,
    };

    const turbosSdk = new TurbosSdk(Network.mainnet);

    const config = await turbosSdk.contract.getConfig();

    const removeLiquidityTx = await turbosSdk.pool.removeLiquidity({
      pool: removeLiquidityData.pool,
      address: removeLiquidityData.address,
      nft: removeLiquidityData.nft,
      amountA: removeLiquidityData.amountA,
      amountB: removeLiquidityData.amountB,
      deadline: removeLiquidityData.deadline,
      collectAmountA: removeLiquidityData.collectAmountA,
      collectAmountB: removeLiquidityData.collectAmountB,
      decreaseLiquidity: removeLiquidityData.decreaseLiquidity,
      slippage: removeLiquidityData.slippage,
      rewardAmounts: removeLiquidityData.rewardAmounts,
      txb: tx as any,
    });

    const decoder = new Decoder(removeLiquidityTx as any, turbosSdk, config);
    const result = await decoder.decode(Account.address);
    console.log(result, 'result');

    expect(result.txType).toBe(TransactionType.Other);
    expect(result.type).toBe(TransactionSubType.RemoveLiquidity);

    const intentionData = result.intentionData as RemoveLiquidityIntentionData;
    expect(intentionData.pool).toBe(removeLiquidityData.pool);
    expect(intentionData.address).toBe(removeLiquidityData.address);
    expect(intentionData.nft).toBe(removeLiquidityData.nft);
    expect(intentionData.amountA).toBe(removeLiquidityData.amountA);
    expect(intentionData.amountB).toBe(removeLiquidityData.amountB);
    expect(intentionData.collectAmountA).toBe(Number(removeLiquidityData.collectAmountA));
    expect(intentionData.collectAmountB).toBe(Number(removeLiquidityData.collectAmountB));
    expect(intentionData.decreaseLiquidity).toBe(Number(removeLiquidityData.decreaseLiquidity));
    expect(intentionData.slippage).toBe(30);

    removeLiquidityData.rewardAmounts.forEach((item, index) => {
      expect(intentionData.rewardAmounts[index]).toBe(Number(item));
    });
  });

  it('Test `decodeAddLiquidity` decoder', async () => {
    const tx = new Transaction();

    const addLiquidityData: AddLiquidityIntentionData = {
      pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
      slippage: 30,
      address: Account.address,
      amountA: '92743111',
      amountB: '349983',
      tickLower: -56680,
      tickUpper: -55030,
      deadline: 3600000,
    };

    const turbosSdk = new TurbosSdk(Network.mainnet);

    const config = await turbosSdk.contract.getConfig();

    const addLiquidityTx = await turbosSdk.pool.addLiquidity({
      pool: addLiquidityData.pool,
      address: addLiquidityData.address,
      amountA: addLiquidityData.amountA,
      amountB: addLiquidityData.amountB,
      deadline: addLiquidityData.deadline,
      slippage: addLiquidityData.slippage,
      tickLower: addLiquidityData.tickLower,
      tickUpper: addLiquidityData.tickUpper,
      txb: tx as any,
    });

    const decoder = new Decoder(addLiquidityTx as any, turbosSdk, config);
    const result = await decoder.decode(Account.address);
    console.log(result, 'result');

    expect(result.txType).toBe(TransactionType.Other);
    expect(result.type).toBe(TransactionSubType.AddLiquidity);

    const intentionData = result.intentionData as AddLiquidityIntentionData;
    expect(intentionData.pool).toBe(addLiquidityData.pool);
    expect(intentionData.address).toBe(addLiquidityData.address);
    expect(intentionData.amountA).toBe(Number(addLiquidityData.amountA));
    expect(intentionData.amountB).toBe(Number(addLiquidityData.amountB));
    expect(intentionData.slippage).toBe(30);
    expect(intentionData.tickLower).toBe(addLiquidityData.tickLower);
    expect(intentionData.tickUpper).toBe(addLiquidityData.tickUpper);
  });
});
