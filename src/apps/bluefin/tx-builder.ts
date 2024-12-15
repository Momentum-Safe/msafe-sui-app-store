import { BN, ClmmPoolUtil, LiquidityInput } from '@firefly-exchange/library-sui';
import { Pool } from '@firefly-exchange/library-sui/dist/src/spot/types';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getBluefinSpotSDK } from './config';
import {
  ClosePositionIntentionData,
  CollectFeeAndRewardsIntentionData,
  CollectFeeIntentionData,
  CollectRewardsIntentionData,
  OpenAndAddLiquidityIntentionData,
  ProvideLiquidityIntentionData,
  RemoveLiquidityIntentionData,
  SuiNetworks,
} from './types';

export default class TxBuilder {
  static async openPositionAndAddLiquidity(
    txParams: OpenAndAddLiquidityIntentionData,
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
    )) as Transaction;

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

    const txb: Transaction = (await sdk.provideLiquidityWithFixedAmount(pool, txParams.position, res, {
      returnTx: true,
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

    const res = this.prototype.buildLiqInput(pool, txParams);

    const txb: Transaction = (await sdk.removeLiquidity(pool, txParams.position, res, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async closePosition(
    txParams: ClosePositionIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb: Transaction = (await sdk.closePosition(pool, txParams.position, {
      returnTx: true,
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
      rewardCoinsType: txParams.rewardCoinsType,
      returnTx: true,
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
    })) as any as Transaction;

    return txb;
  }

  static async collectFeeAndRewards(
    txParams: CollectFeeAndRewardsIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txParams.pool);

    const txb: Transaction = (await sdk.collectFeeAndRewards(pool, txParams.position, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
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
