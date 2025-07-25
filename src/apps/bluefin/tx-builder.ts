// eslint-disable-next-line import/no-extraneous-dependencies
import { buildTx, getQuote } from '@bluefin-exchange/bluefin7k-aggregator-sdk';
import { BN, ClmmPoolUtil, LiquidityInput } from '@firefly-exchange/library-sui';
import { Pool } from '@firefly-exchange/library-sui/dist/src/spot/types';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Decimal } from 'turbos-clmm-sdk';

import { getBluefinSpotSDK } from './config';
import {
  ClosePositionIntentionData,
  CollectRewardsAndFeeIntentionData,
  CollectFeeIntentionData,
  CollectRewardsIntentionData,
  OpenPositionIntentionData,
  ProvideLiquidityIntentionData,
  RemoveLiquidityIntentionData,
  SuiNetworks,
  Aggregator7KSwapIntentionData,
} from './types';

export default class TxBuilder {
  static async OpenPosition(
    txParams: OpenPositionIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const liquidityInput = this.prototype.buildLiqInput(pool, { ...txParams, slippage: 0 });

    const txb: Transaction = (await sdk.openPositionWithFixedAmount(
      pool,
      txParams.lowerTick,
      txParams.upperTick,
      liquidityInput,
      {
        returnTx: true,
        sender: account.address,
      },
    )) as unknown as Transaction;

    return txb;
  }

  static async provideLiquidity(
    txParams: ProvideLiquidityIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const res = this.prototype.buildLiqInput(pool, txParams);

    const txb = (await sdk.provideLiquidityWithFixedAmount(pool, txParams.position, res, {
      returnTx: true,
      sender: account.address,
    })) as any as Transaction;

    return txb;
  }

  static async removeLiquidity(
    txParams: RemoveLiquidityIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb = (await sdk.removeLiquidity(
      pool,
      txParams.position,
      {
        liquidityAmount: new BN(txParams.liquidity),
        tokenMaxA: new BN(txParams.maxAmountTokenA),
        tokenMaxB: new BN(txParams.maxAmountTokenB),
      } as any as LiquidityInput,
      {
        returnTx: true,
        sender: account.address,
      },
    )) as any as Transaction;

    return txb;
  }

  static async closePosition(
    txParams: ClosePositionIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb = (await sdk.closePosition(pool, txParams.position, {
      returnTx: true,
      sender: account.address,
    })) as any as Transaction;

    return txb;
  }

  static async collectRewards(
    txParams: CollectRewardsIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb: Transaction = (await sdk.collectRewards(pool, txParams.position, {
      rewardCoinsType: txParams.collectRewardTokens,
      returnTx: true,
      sender: account.address,
    })) as any as Transaction;

    return txb;
  }

  static async collectFee(
    txParams: CollectFeeIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb: Transaction = (await sdk.collectFee(pool, txParams.position, {
      returnTx: true,
      sender: account.address,
    })) as any as Transaction;

    return txb;
  }

  static async collectRewardsAndFee(
    txParams: CollectRewardsAndFeeIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    console.log(txParams.position);
    const txb: Transaction = (await sdk.collectFeeAndRewards(pool, txParams.position, {
      returnTx: true,
      sender: account.address,
    })) as any as Transaction;

    return txb;
  }

  static async aggregator7KSwap(
    txParams: Aggregator7KSwapIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const _ = getBluefinSpotSDK(network, account);

    const quoteResponse = await getQuote({
      tokenIn: txParams.tokenIn.address,
      tokenOut: txParams.tokenOut.address,
      amountIn: new Decimal(txParams.amountIn).mul(10 ** txParams.tokenIn.decimals).toString(),
    });

    const txb = await buildTx({
      quoteResponse,
      accountAddress: account.address,
      slippage:
        typeof txParams.maxSlippage === 'string' || typeof txParams.maxSlippage === 'number'
          ? txParams.maxSlippage
          : txParams.maxSlippage.toNumber?.(),
      commission: {
        partner: '0x956d6ea2da156a037952964badc51f997cc5581c86a0e05f74049e6effab9347',
        commissionBps: 0,
      },
    });

    (txb.tx as Transaction).setSender(account.address);

    return txb.tx as Transaction;
  }

  /// Method to create the liquidity input payload
  private buildLiqInput(pool: Pool, params: any): LiquidityInput {
    const res = ClmmPoolUtil.estLiquidityAndCoinAmountFromOneAmounts(
      params.lowerTick,
      params.upperTick,
      new BN(params.tokenAmount),
      params.isTokenAFixed,
      true,
      0,
      new BN(pool.current_sqrt_price),
    );
    return { ...res, tokenMaxA: new BN(params.maxAmountTokenA), tokenMaxB: new BN(params.maxAmountTokenB) };
  }
}
