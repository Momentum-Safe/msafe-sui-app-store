import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { mappedMmtV3Pool } from '@mmt-finance/clmm-sdk/dist/utils/poolUtils';
import { Transaction } from '@mysten/sui/transactions';

import { normalizeSuiCoinType } from './common';
// eslint-disable-next-line import/no-cycle
import { getCoinObject, getLimitSqrtPriceUsingSlippage } from './liquidity';
import { NormalizedPool, Tokens } from '../types';

export type NormalizedRewarder = {
  coinType: string;
  flowRate: number;
  hasEnded: boolean;
  rewardAmount: number;
  rewardsAllocated: number;
};

export type AprBreakdown = {
  total: string;
  fee: string;
  rewards: {
    coinType: string;
    apr: string;
    amountPerDay: number;
  }[];
};

export const performMmtSwap = async (
  mmtSdk: MmtSDK,
  route: NormalizedPool[],
  tokenIn: Tokens,
  amountIn: string,
  address: string,
  tx: Transaction,
  slippage: number,
) => {
  let inputCoin = await getCoinObject({
    mmt: mmtSdk,
    tx,
    address,
    coinType: tokenIn.coinType,
    coinAmount: amountIn,
    coinDecimals: tokenIn.decimals,
  });

  let inputAmount = tx.moveCall({
    target: '0x2::coin::value',
    typeArguments: [tokenIn.coinType],
    arguments: [inputCoin],
  });

  let inputCoinType = tokenIn.coinType;

  for (let i = 0; i < route.length; i += 1) {
    const { poolId: objectId, tokenX: routeTokenX, tokenY: routeTokenY, isStable, currentSqrtPrice } = route[i]!;

    const { id: v3PoolId, isReverse } = mappedMmtV3Pool[objectId as keyof typeof mappedMmtV3Pool] || {
      id: objectId,
      isReverse: false,
    };

    let isXtoY = normalizeSuiCoinType(routeTokenX.coinType) === normalizeSuiCoinType(inputCoinType);

    isXtoY = isReverse ? !isXtoY : isXtoY;

    const tokenXType = isReverse ? routeTokenY.coinType : routeTokenX.coinType;
    const tokenYType = isReverse ? routeTokenX.coinType : routeTokenY.coinType;

    const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
      poolId: v3PoolId,
      tokenX: routeTokenX,
      tokenY: routeTokenY,
      slippagePercentage: slippage,
      isTokenX: isXtoY,
      suiClient: mmtSdk.rpcClient,
      currentSqrtPrice,
    });

    const outputCoin = mmtSdk.Pool.swap(
      tx,
      {
        objectId: v3PoolId,
        tokenXType,
        tokenYType,
        isStable,
      },
      inputAmount,
      inputCoin,
      isXtoY,
      undefined,
      limitSqrtPrice,
      false, // TODO: check why cannot useMvr
    );
    tx.transferObjects([inputCoin], tx.pure.address(address));
    inputCoin = outputCoin as any;
    inputCoinType = isXtoY ? tokenYType : tokenXType;

    inputAmount = tx.moveCall({
      target: '0x2::coin::value',
      typeArguments: [inputCoinType],
      arguments: [inputCoin],
    });
  }

  tx.transferObjects([inputCoin], tx.pure.address(address));
};
