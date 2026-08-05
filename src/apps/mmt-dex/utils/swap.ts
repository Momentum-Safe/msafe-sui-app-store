import { MmtSDK, Types, Utils } from '@mmt-finance/clmm-sui-sdk';
import { Transaction } from '@mysten/sui/transactions';

import { normalizeSuiCoinType } from './common';
// eslint-disable-next-line import/no-cycle
import { getCoinObject, getLimitSqrtPriceUsingSlippage } from './liquidity';
import { NormalizedPool, SwapIntentionParams, Tokens } from '../types';

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

export type ResolvedSwapParams = {
  route: NormalizedPool[];
  tokenIn: Tokens;
  /** Human-readable amount for getCoinObject / toBaseUnits */
  amountIn: string;
  address: string;
  slippage: number;
};

function isPoolIdRoute(route: SwapIntentionParams['route']): route is string[] {
  return Array.isArray(route) && (route.length === 0 || typeof route[0] === 'string');
}

function isTokensObject(tokenIn: SwapIntentionParams['tokenIn']): tokenIn is Tokens {
  return typeof tokenIn === 'object' && tokenIn !== null && 'coinType' in tokenIn && 'decimals' in tokenIn;
}

/** Convert base-unit integer string back to a human-readable decimal string. */
export function fromBaseUnits(amount: string, decimals: number): string {
  if (!/^\d+$/.test(amount)) {
    return amount;
  }
  if (decimals <= 0) {
    return amount.replace(/^0+/, '') || '0';
  }

  const value = BigInt(amount);
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === 0n) {
    return whole.toString();
  }
  const fracStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fracStr}`;
}

function toNormalizedPool(pool: Types.ExtendedPoolWithApr): NormalizedPool {
  return {
    poolSource: 'mmt-v3',
    poolId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
    lpFeesPercent: pool.lpFeesPercent,
    feeRate: Number(pool.lpFeesPercent) || 0,
    protocolFeesPercent: pool.protocolFeesPercent,
    isStable: pool.isStable,
    currentSqrtPrice: pool.currentSqrtPrice,
    currentTickIndex: pool.currentTickIndex,
    liquidity: pool.liquidity,
    liquidityHM: pool.liquidityHM,
    tokenXReserve: pool.tokenXReserve,
    tokenYReserve: pool.tokenYReserve,
    tvl: pool.tvl,
    apy: pool.apy,
    volume24h: pool.volume24h,
    fees24h: pool.fees24h,
    timestamp: pool.timestamp,
    rewarders: (pool.rewarders || []).map((rewarder) => ({
      coinType: rewarder.coin_type,
      flowRate: rewarder.flow_rate,
      hasEnded: rewarder.hasEnded,
      rewardAmount: rewarder.reward_amount,
      rewardsAllocated: rewarder.rewards_allocated,
    })),
    tokenX: pool.tokenX,
    tokenY: pool.tokenY,
    aprBreakdown: {
      total: pool.aprBreakdown?.total ?? pool.apy ?? '0',
      fee: pool.aprBreakdown?.fee ?? '0',
      rewards: (pool.aprBreakdown?.rewards || []).map((reward) => ({
        coinType: reward.coinType,
        apr: reward.rewarderApr?.toString?.() ?? String(reward.rewarderApr ?? '0'),
        amountPerDay: Number(reward.amountPerDay ?? 0),
      })),
    },
  };
}

function findTokenInRoute(route: NormalizedPool[], coinType: string): Tokens | undefined {
  const normalized = normalizeSuiCoinType(coinType);
  for (const pool of route) {
    if (normalizeSuiCoinType(pool.tokenX?.coinType || '') === normalized) {
      return pool.tokenX as Tokens;
    }
    if (normalizeSuiCoinType(pool.tokenY?.coinType || '') === normalized) {
      return pool.tokenY as Tokens;
    }
  }
  return undefined;
}

/**
 * Normalize Swap intention params from either:
 * - legacy web-app shape (NormalizedPool[] + Tokens + human amount)
 * - mmt-dex-v3 shape (poolId[] + coinType string + base-unit amount)
 */
export async function resolveSwapIntentionParams(
  mmtSdk: MmtSDK,
  params: SwapIntentionParams,
): Promise<ResolvedSwapParams> {
  if ((params as { mode?: string }).mode === 'aggregator') {
    throw new Error('Swap Failed: aggregator mode is not supported in MSafe rebuild path yet');
  }

  const address = params.address;
  const slippage = params.slippage ?? (params as { slippagePct?: number }).slippagePct;
  if (typeof slippage !== 'number') {
    throw new Error('Swap Failed: missing slippage');
  }

  // Legacy shape: full pool objects + token object.
  if (!isPoolIdRoute(params.route) && isTokensObject(params.tokenIn)) {
    return {
      route: params.route,
      tokenIn: params.tokenIn,
      amountIn: params.amountIn,
      address,
      slippage,
    };
  }

  if (!isPoolIdRoute(params.route)) {
    throw new Error('Swap Failed: route must be NormalizedPool[] or poolId string[]');
  }
  if (typeof params.tokenIn !== 'string') {
    throw new Error('Swap Failed: tokenIn must be a coinType string when route is poolId[]');
  }
  if (params.route.length === 0) {
    throw new Error('Swap Failed: empty route');
  }

  const pools = await Promise.all(params.route.map((poolId) => mmtSdk.Pool.getPool(poolId)));
  const route = pools.map(toNormalizedPool);

  let tokenIn = findTokenInRoute(route, params.tokenIn);
  if (!tokenIn) {
    const fetched = await mmtSdk.Pool.getToken(params.tokenIn);
    tokenIn = {
      coinType: fetched.coinType,
      tokenName: fetched.name,
      ticker: fetched.ticker,
      iconUrl: fetched.iconUrl,
      decimals: fetched.decimals,
      price: fetched.price,
      description: fetched.description,
      isVerified: fetched.isVerified,
    };
  }

  // mmt-dex-v3 sends amountIn already in base units; convert back for getCoinObject.
  const amountIn = fromBaseUnits(params.amountIn, tokenIn.decimals);

  return {
    route,
    tokenIn,
    amountIn,
    address,
    slippage,
  };
}

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
    const routePool = route[i]!;
    const { poolId, tokenX: routeTokenX, tokenY: routeTokenY, isStable, currentSqrtPrice } = routePool;

    if (!routeTokenX?.coinType || !routeTokenY?.coinType) {
      throw new Error(
        `Swap Failed: route[${i}] is missing tokenX/tokenY after resolve. poolId=${routePool.poolId}`,
      );
    }

    const { id: v3PoolId, isReverse } = Utils.mappedMmtV3Pool[poolId as keyof typeof Utils.mappedMmtV3Pool] || {
      id: poolId,
      isReverse: false,
    };

    let isXtoY = normalizeSuiCoinType(routeTokenX.coinType) === normalizeSuiCoinType(inputCoinType);
    isXtoY = isReverse ? !isXtoY : isXtoY;

    // Align with mmt-dex-v3: reverse pool tokens before building swap pool params / limit price.
    const poolTokenX = isReverse ? routeTokenY : routeTokenX;
    const poolTokenY = isReverse ? routeTokenX : routeTokenY;

    const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
      poolId: v3PoolId,
      tokenX: poolTokenX,
      tokenY: poolTokenY,
      slippagePercentage: slippage,
      isTokenX: isXtoY,
      suiClient: mmtSdk.rpcClient,
      currentSqrtPrice,
    });

    const result = mmtSdk.Pool.swap({
      txb: tx,
      pool: {
        poolId: v3PoolId,
        tokenXType: poolTokenX.coinType,
        tokenYType: poolTokenY.coinType,
        tickSpacing: routePool.tickSpacing,
        isStable,
      },
      amount: inputAmount,
      inputCoin,
      isXtoY,
      limitSqrtPrice,
    });

    if (!result?.outputCoin) {
      throw new Error('Swap Failed: empty swap result');
    }

    // leftoverCoin is the residual input coin after flash/swap split (same as mmt-dex-v3 trade.ts).
    tx.transferObjects([inputCoin], tx.pure.address(address));
    inputCoin = result.outputCoin as typeof inputCoin;
    inputCoinType = isXtoY ? poolTokenY.coinType : poolTokenX.coinType;

    inputAmount = tx.moveCall({
      target: '0x2::coin::value',
      typeArguments: [inputCoinType],
      arguments: [inputCoin],
    });
  }

  tx.transferObjects([inputCoin], tx.pure.address(address));
};
