import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { Reward } from '@mmt-finance/clmm-sdk/dist/types';
import { Transaction } from '@mysten/sui/transactions';

import { NormalizedPool } from './swap';

export type V3PositionType = {
  objectId: string;
  poolId: string;
  upperPrice: number;
  lowerPrice: number;
  upperTick: number;
  lowerTick: number;
  liquidity: string;
  amount: number;
  status: string;
  claimableRewards: number;
  rewarders: Reward[];
  feeAmountXUsd: number;
  feeAmountX: number;
  feeAmountYUsd: number;
  feeAmountY: number;
  claimableMaya: number;
};

export const claimV3Rewards = (
  mmt: MmtSDK,
  address: string,
  position: V3PositionType,
  pool: NormalizedPool,
  tx: Transaction,
) => {
  const poolModel = {
    objectId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
  };

  if (pool?.rewarders && pool?.rewarders.length > 0) {
    mmt.Pool.collectAllRewards(
      tx,
      poolModel,
      pool.rewarders.map((rewarder) => ({
        coin_type: rewarder.coinType,
        flow_rate: rewarder.flowRate,
        reward_amount: rewarder.rewardAmount,
        rewards_allocated: rewarder.rewardsAllocated,
        hasEnded: rewarder.hasEnded,
      })), // Assert non-null
      position.objectId,
      address,
    );
  }

  mmt.Pool.collectFee(
    tx,
    {
      objectId: pool.poolId,
      tokenXType: pool.tokenXType,
      tokenYType: pool.tokenYType,
      isStable: pool.isStable,
      tickSpacing: pool.tickSpacing,
    },
    position.objectId,
    address,
  );
};

export type ClaimRewardsAsParams = {
  sdk: MmtSDK;
  address: string;
  positionId: string;
  pool: NormalizedPool;
  txb: Transaction;
  targetCoinType: string;
  slippage: number;
};

export async function claimRewardsAsTargetCoin({
  sdk,
  address,
  positionId,
  pool,
  txb,
  targetCoinType,
  slippage,
}: ClaimRewardsAsParams) {
  const poolModel = {
    objectId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
  };

  const rewarderCoinTypes = pool.rewarders.map((rewarder) => rewarder.coinType);

  if (rewarderCoinTypes.length > 0) {
    console.log('claimRewardsAsTargetCoin input', {
      pool: poolModel,
      positionId,
      rewarderCoinTypes,
      targetCoinType,
      slippage,
      toAddress: address,
    });
    await sdk.Pool.claimRewardsAs({
      txb,
      pool: poolModel,
      positionId,
      rewarderCoinTypes,
      targetCoinType,
      slippage,
      toAddress: address,
    });
  }

  const pools = await sdk.Pool.getAllPools();

  await sdk.Pool.claimFeeAs({
    txb,
    pool: poolModel,
    positionId,
    targetCoinType,
    slippage,
    toAddress: address,
    pools,
  });

  return txb;
}
