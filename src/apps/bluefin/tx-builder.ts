/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getBluefinSpotSDK } from './config';
import { SuiNetworks } from './types';
import { BN, ClmmPoolUtil, LiquidityInput, TickMath } from '@firefly-exchange/library-sui';
import { Decimal } from 'turbos-clmm-sdk';
import { Pool } from '@firefly-exchange/library-sui/dist/src/spot/types';

export default class TxBuilder {
  static async openPositionAndAddLiquidity(
    txbParams: any,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const res = this.prototype.buildLiqInput(pool, txbParams);

    const txb: Transaction = (await sdk.openPositionWithFixedAmount(
      pool,
      txbParams.lowerTick,
      txbParams.upperTick,
      res,
      { returnTx: true },
    )) as any as Transaction;

    return txb;
  }

  static async provideLiquidity(txbParams: any, account: WalletAccount, network: SuiNetworks): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const res = this.prototype.buildLiqInput(pool, txbParams);

    const txb: Transaction = (await sdk.provideLiquidityWithFixedAmount(pool, txbParams.position, res, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async removeLiquidity(txbParams: any, account: WalletAccount, network: SuiNetworks): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const res = this.prototype.buildLiqInput(pool, txbParams);

    const txb: Transaction = (await sdk.removeLiquidity(pool, txbParams.position, res, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async closePosition(txbParams: any, account: WalletAccount, network: SuiNetworks): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const txb: Transaction = (await sdk.closePosition(pool, txbParams.position, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async collectRewards(txbParams: any, account: WalletAccount, network: SuiNetworks): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const txb: Transaction = (await sdk.collectRewards(pool, txbParams.position, {
      rewardCoinsType: txbParams.rewardCoinsType,
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async collectFee(txbParams: any, account: WalletAccount, network: SuiNetworks): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const txb: Transaction = (await sdk.collectFee(pool, txbParams.position, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  static async collectFeeAndRewards(
    txbParams: any,
    account: WalletAccount,
    network: SuiNetworks,
  ): Promise<Transaction> {
    const sdk = getBluefinSpotSDK(network, account);

    const pool = await sdk.queryChain.getPool(txbParams.pool);

    const txb: Transaction = (await sdk.collectFeeAndRewards(pool, txbParams.position, {
      returnTx: true,
    })) as any as Transaction;

    return txb;
  }

  /// Method to create the liquidity input payload
  private buildLiqInput(pool: Pool, params: any): LiquidityInput {
    return ClmmPoolUtil.estLiquidityAndCoinAmountFromOneAmounts(
      params.lowerTick,
      params.upperTick,
      new BN(
        new Decimal(params.tokenAmount)
          .mul(10 ** (params.isCoinA ? pool.coin_a.decimals : pool.coin_b.decimals))
          .toFixed(0),
      ),
      params.isCoinA,
      true,
      params.slippage,
      TickMath.priceToSqrtPriceX64(new Decimal(pool.current_sqrt_price), pool.coin_a.decimals, pool.coin_b.decimals),
    );
  }
}
