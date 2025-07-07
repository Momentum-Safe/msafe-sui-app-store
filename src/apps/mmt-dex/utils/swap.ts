/* eslint-disable no-restricted-syntax */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import type { Rewarder, ExtendedPoolWithApr } from '@mmt-finance/clmm-sdk/dist/types';
import { mappedMmtV3Pool } from '@mmt-finance/clmm-sdk/dist/utils/poolUtils';
import { Transaction, TransactionArgument } from '@mysten/sui/transactions';

import { getExactCoinByAmount, normalizeSuiCoinType } from './common';
import { getLimitSqrtPriceUsingSlippage } from './liquidity';

export type Pools = {
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
  route: Pools[],
  tokenIn: Tokens,
  amountIn: string,
  address: string,
  tx: Transaction,
  slippage: number,
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
    const { objectId, tokenX: routeTokenX, tokenY: routeTokenY, isStable } = route[i]!;

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
      limitSqrtPrice.toString(),
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
