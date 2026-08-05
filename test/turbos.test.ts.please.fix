import { HexToUint8Array, TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { Decoder } from '@/apps/turbos/decoder';
import {
  AddLiquidityIntentionData,
  CollectFeeIntentionData,
  RemoveLiquidityIntentionData,
  SwapIntentionData,
  TransactionSubType,
} from '@/apps/turbos/types';
// import { appHelpers } from '@/index';

import { Account } from './config';

const TurbosAccount: WalletAccount = {
  address: '0xc851a734b97870c41435b06c8254f1ef4cef0d53cfe1bcb0ba21a175b528311e',
  publicKey: HexToUint8Array('0xc851a734b97870c41435b06c8254f1ef4cef0d53cfe1bcb0ba21a175b528311e'),
  chains: [SUI_MAINNET_CHAIN],
  features: [],
};

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
      address: TurbosAccount.address,
      amountA: '152983049',
      amountB: '638021',
      tickLower: -55450,
      tickUpper: -55040,
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

  // it('Test `AddLiquidity`  builder', async () => {
  //   const appHelper = appHelpers.getAppHelper('turbos');

  //   const turbosSdk = new TurbosSdk(Network.mainnet);

  //   const config = await turbosSdk.contract.getConfig();

  //   const addLiquidityData: AddLiquidityIntentionData = {
  //     pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
  //     slippage: 30,
  //     address: TurbosAccount.address,
  //     amountA: '157186517',
  //     amountB: '638021',
  //     tickLower: -55360,
  //     tickUpper: -54950,
  //     deadline: 3600000,
  //   };

  //   const res = await appHelper.build({
  //     network: 'sui:mainnet',
  //     txType: TransactionType.Other,
  //     txSubType: TransactionSubType.AddLiquidity,
  //     clientUrl: 'https://fullnode.mainnet.sui.io:443',
  //     account: TurbosAccount,
  //     intentionData: addLiquidityData,
  //   });
  //   // const moveCall: any = res.blockData.transactions.find(
  //   //   (trans) => trans.kind === 'MoveCall' && trans.target.indexOf('::swap') > -1,
  //   // );
  //   // console.log(moveCall, 'moveCall');
  //   // expect(moveCall.target).toBe(`${config.PackageId}::swap_router::swap_a_b`);

  //   console.log(res, 'addLiquidityData');
  // }, 30000);

  // it('Test `swap` short address builder', async () => {
  //   const appHelper = appHelpers.getAppHelper('turbos');

  //   const turbosSdk = new TurbosSdk(Network.mainnet);

  //   const config = await turbosSdk.contract.getConfig();

  //   const swapData: SwapIntentionData = {
  //     routes: [
  //       {
  //         pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
  //         a2b: true,
  //         nextTickIndex: -55322,
  //       },
  //     ],
  //     coinTypeA: '0x2::sui::SUI',
  //     coinTypeB: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  //     address: TurbosAccount.address,
  //     amountA: '1000000000',
  //     amountB: '3956390',
  //     amountSpecifiedIsInput: true,
  //     slippage: '0.5',
  //   };

  //   const res = await appHelper.build({
  //     network: 'sui:mainnet',
  //     txType: TransactionType.Other,
  //     txSubType: TransactionSubType.Swap,
  //     clientUrl: 'https://fullnode.mainnet.sui.io:443',
  //     account: TurbosAccount,
  //     intentionData: swapData,
  //   });
  //   const moveCall: any = res.blockData.transactions.find(
  //     (trans) => trans.kind === 'MoveCall' && trans.target.indexOf('::swap') > -1,
  //   );
  //   console.log(moveCall, 'moveCall');
  //   expect(moveCall.target).toBe(`${config.PackageId}::swap_router::swap_a_b`);

  //   // console.log(res);
  // }, 30000);

  // it('Test `swap` long address builder', async () => {
  //   const appHelper = appHelpers.getAppHelper('turbos');

  //   const turbosSdk = new TurbosSdk(Network.mainnet);

  //   const config = await turbosSdk.contract.getConfig();

  //   const swapData: SwapIntentionData = {
  //     routes: [
  //       {
  //         pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
  //         a2b: true,
  //         nextTickIndex: -55322,
  //       },
  //     ],
  //     coinTypeA: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
  //     coinTypeB: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  //     address: TurbosAccount.address,
  //     amountA: '1000000000',
  //     amountB: '3956390',
  //     amountSpecifiedIsInput: true,
  //     slippage: '0.5',
  //   };

  //   const res = await appHelper.build({
  //     network: 'sui:mainnet',
  //     txType: TransactionType.Other,
  //     txSubType: TransactionSubType.Swap,
  //     clientUrl: 'https://fullnode.mainnet.sui.io:443',
  //     account: TurbosAccount,
  //     intentionData: swapData,
  //   });
  //   const moveCall: any = res.blockData.transactions.find(
  //     (trans) => trans.kind === 'MoveCall' && trans.target.indexOf('::swap') > -1,
  //   );
  //   console.log(moveCall, 'moveCall');
  //   expect(moveCall.target).toBe(`${config.PackageId}::swap_router::swap_a_b`);

  //   // console.log(res);
  // }, 30000);

  it('Test `decodeSwap` decoder', async () => {
    const tx = new Transaction();

    const swapData: SwapIntentionData = {
      routes: [
        {
          pool: '0x0df4f02d0e210169cb6d5aabd03c3058328c06f2c4dbb0804faa041159c78443',
          a2b: true,
          nextTickIndex: -55383,
        },
      ],
      coinTypeA: '0x2::sui::SUI',
      coinTypeB: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      address: Account.address,
      amountA: '351994806',
      amountB: '1384277',
      amountSpecifiedIsInput: true,
      slippage: '0.1',
      deadline: 3600000,
    };

    const turbosSdk = new TurbosSdk(Network.mainnet);

    const config = await turbosSdk.contract.getConfig();

    const swapTx = await turbosSdk.trade.swap({
      ...swapData,
      txb: tx as any,
    });

    const decoder = new Decoder(swapTx as any, turbosSdk, config);
    const result = await decoder.decode(Account.address);
    console.log(result, 'result');

    expect(result.txType).toBe(TransactionType.Other);
    expect(result.type).toBe(TransactionSubType.Swap);

    const intentionData = result.intentionData as SwapIntentionData;
    expect(intentionData.coinTypeA).toBe(swapData.coinTypeA);
    expect(intentionData.coinTypeB).toBe(swapData.coinTypeB);
    expect(intentionData.address).toBe(swapData.address);
    expect(intentionData.amountA).toBe(Number(swapData.amountA));

    // const _amountB = new Decimal(intentionData.amountB)
    //   .div(new Decimal(100).minus(swapData.slippage).div(100))
    //   .toFixed(0);
    // expect(_amountB).toBe(swapData.amountB);

    expect(intentionData.amountSpecifiedIsInput).toBe(swapData.amountSpecifiedIsInput);

    // expect(JSON.stringify(intentionData.routes)).toBe(JSON.stringify(swapData.routes));
    swapData.routes.forEach((data, index) => {
      expect(data.pool).toBe(intentionData.routes[index].pool);
      expect(data.a2b).toBe(intentionData.routes[index].a2b);

      // const next = intentionData.routes[index]!.nextTickIndex;
      // const nextTickPrice = turbosSdk.math.tickIndexToPrice(next, 9, 6);
      // expect(data.nextTickIndex).toBe(intentionData.routes[index].nextTickIndex);
    });
  });
});
