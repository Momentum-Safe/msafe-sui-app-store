import { MmtSDK } from '@mmt-finance/clmm-sui-sdk';
import { Transaction } from '@mysten/sui/transactions';

import { V3PositionType, ClaimRewardsAsParams, NormalizedPool } from '../types';

export const claimV3Rewards = (
  mmt: MmtSDK,
  address: string,
  position: V3PositionType,
  pool: NormalizedPool,
  tx: Transaction,
) => {
  const poolModel = {
    poolId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  if (pool?.rewarders && pool?.rewarders.length > 0) {
    mmt.Pool.collectAllRewards({
      txb: tx,
      pool: poolModel,
      rewarders: pool.rewarders.map((rewarder) => ({
        coin_type: rewarder.coinType,
        flow_rate: rewarder.flowRate,
        reward_amount: rewarder.rewardAmount,
        rewards_allocated: rewarder.rewardsAllocated,
        hasEnded: rewarder.hasEnded,
      })),
      positionId: position.objectId,
      transferToAddress: address,
    });
  }

  mmt.Pool.collectFee({
    txb: tx,
    pool: poolModel,
    positionId: position.objectId,
    transferToAddress: address,
  });
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
    poolId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  const rewarderCoinTypes = pool.rewarders.map((rewarder) => rewarder.coinType);
  // Align with mmt-dex-v3: pass pools into both claimRewardsAs and claimFeeAs.
  const pools = await sdk.Pool.getAllPools();

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
      pools,
    });
  }

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
