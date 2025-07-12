/* eslint-disable no-restricted-syntax */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import type { TokenSchema } from '@mmt-finance/clmm-sdk/dist/types';
import { mappedMmtV3Pool } from '@mmt-finance/clmm-sdk/dist/utils/poolUtils';
import { Transaction, TransactionArgument } from '@mysten/sui/transactions';

import { getExactCoinByAmount, normalizeSuiCoinType } from './common';

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

export type NormalizedPool = {
  poolSource: 'mmt-v3';
  poolId: string;
  tokenXType: string;
  tokenYType: string;
  tickSpacing: number;
  lpFeesPercent: string;
  feeRate: number;
  protocolFeesPercent: string;
  isStable: boolean;
  currentSqrtPrice: string;
  currentTickIndex: string;
  liquidity: string;
  liquidityHM: string;
  tokenXReserve: string;
  tokenYReserve: string;
  tvl: string;
  apy: string;
  volume24h: string;
  fees24h: string;
  timestamp: string;
  rewarders: NormalizedRewarder[];
  tokenX: TokenSchema;
  tokenY: TokenSchema;
  aprBreakdown: AprBreakdown;
};

export type Tokens = {
  coinType: string;
  tokenName: string;
  ticker: string;
  iconUrl: string;
  decimals: number;
  price: string;
  description: string;
  source?: 'hop' | 'af';
  tokenType?: 'lst' | 'meme' | 'bridged' | '';
  isVerified?: boolean;
};

export const performMmtSwap = async (
  mmtSdk: MmtSDK,
  route: NormalizedPool[],
  tokenIn: Tokens,
  amountIn: string,
  address: string,
  tx: Transaction,
) => {
  let inputAmount = BigInt(Math.ceil(Number(amountIn) * 10 ** tokenIn.decimals)) as bigint | TransactionArgument;

  let inputCoin = await getExactCoinByAmount(
    mmtSdk,
    address,
    normalizeSuiCoinType(tokenIn.coinType),
    inputAmount as bigint,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tx,
  );

  let inputCoinType = tokenIn.coinType;

  for (let i = 0; i < route.length; i += 1) {
    const { poolId: objectId, tokenX: routeTokenX, tokenY: routeTokenY, isStable } = route[i]!;

    const { id: v3PoolId, isReverse } = mappedMmtV3Pool[objectId as keyof typeof mappedMmtV3Pool] || {
      id: objectId,
      isReverse: false,
    };

    let isXtoY = normalizeSuiCoinType(routeTokenX.coinType) === normalizeSuiCoinType(inputCoinType);

    isXtoY = isReverse ? !isXtoY : isXtoY;

    const tokenXType = isReverse ? routeTokenY.coinType : routeTokenX.coinType;
    const tokenYType = isReverse ? routeTokenX.coinType : routeTokenY.coinType;

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
      // BigInt(limitSqrtPrice.toString())
    );

    tx.transferObjects([inputCoin], tx.pure.address(address));
    inputCoin = outputCoin;

    inputCoinType = isXtoY ? tokenYType : tokenXType;

    [inputAmount] = tx.moveCall({
      target: '0x2::coin::value',
      typeArguments: [inputCoinType],
      arguments: [inputCoin],
    });
  }

  tx.transferObjects([inputCoin], tx.pure.address(address));
};
