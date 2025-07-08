/* eslint-disable no-restricted-syntax */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import type { Rewarder, ExtendedPoolWithApr } from '@mmt-finance/clmm-sdk/dist/types';
import { mappedMmtV3Pool } from '@mmt-finance/clmm-sdk/dist/utils/poolUtils';
import { Transaction, TransactionArgument } from '@mysten/sui/transactions';

import { getExactCoinByAmount, normalizeSuiCoinType } from './common';
import { getCoinObject, getLimitSqrtPriceUsingSlippage } from './liquidity';

export type SwapRoute = {
  poolId: string;
  poolSource: string;
  tokenXReserve: string;
  tokenYReserve: string;
  protocolFeesPercent: string;
  lpFeesPercent: string;
  feeRate: number;
  isStable: boolean;
  tokenXType: string;
  tokenYType: string;
  tvl: string;
  apy: string;
  tokenX: {
    coinType: string;
    ticker: string;
    name: string;
    decimals: number;
    iconUrl: string;
    description: string;
    price: string;
    isVerified: boolean;
    isMmtWhitelisted: boolean;
    tokenType: string;
  };
  tokenY: {
    coinType: string;
    ticker: string;
    name: string;
    decimals: number;
    iconUrl: string;
    description: string;
    price: string;
    isVerified: boolean;
    isMmtWhitelisted: boolean;
    tokenType: string;
  };
  fees24h: string;
  currentSqrtPrice: string;
  currentTickIndex: string;
  liquidity: string;
  liquidityHM: string;
  tickSpacing: number;
  volume24h: string;
  timestamp: string;
  rewarders: [
    {
      coinType: string;
      flowRate: number;
      hasEnded: boolean;
      rewardAmount: number;
      rewardsAllocated: number;
    },
    {
      coinType: string;
      flowRate: number;
      hasEnded: boolean;
      rewardAmount: number;
      rewardsAllocated: number;
    },
    {
      coinType: string;
      flowRate: number;
      hasEnded: boolean;
      rewardAmount: number;
      rewardsAllocated: 66078579096424;
    },
  ];
  aprBreakdown: {
    total: string;
    rewards: [
      {
        coinType: string;
        apr: string;
        amountPerDay: number;
      },
    ];
    fee: string;
  };
};

export type Pools = {
  poolId: string;
  tokenXReserve: string;
  lspSupply: string;
  protocolFeesPercent: string;
  createdAt?: string;
  farmSource?: string;
  volume: number;
  packageId: string;
  farmId?: string;
  objectId: string;
  poolSource: string;
  lspType?: string;
  lpFeesPercent?: string;
  tokenYType: string;
  data?: string;
  updatedAt?: string;
  isStable: boolean;
  tokenXType: string;
  tokenYReserve: string;
  tokenX: {
    coinType: string;
    ticker: string;
    tokenName: string;
    updatedAt?: string;
    createdAt?: string;
    decimals: number;
    iconUrl: string;
    description: string;
    price: string;
  };
  tokenY: {
    coinType: string;
    ticker: string;
    tokenName: string;
    updatedAt?: string;
    createdAt?: string;
    decimals: number;
    iconUrl: string;
    description: string;
    price: string;
  };
  tvl: number;
  apy: number;
  feeApy?: number;
  lspBalance?: number;
  currentSqrtPrice?: string;
  currentTickIndex?: string;
  liquidity?: string;
  rewarders?: Rewarder[];
  feeRate?: number;
  tickSpacing?: number;
  volume24h?: string;
  fees24h?: string;
  fees?: number;
  aprBreakdown?: ExtendedPoolWithApr['aprBreakdown'];
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
  route: SwapRoute[],
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
    const { poolId: objectId, tokenX: routeTokenX, tokenY: routeTokenY, isStable } = route[i]!;

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
      tokenX: routeTokenX as any,
      tokenY: routeTokenY as any,
      slippagePercentage: slippage,
      isTokenX: isXtoY,
      suiClient: mmtSdk.rpcClient,
    });

    let outputCoin = mmtSdk.Pool.swap(
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
