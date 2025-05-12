import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { Reward } from '@mmt-finance/clmm-sdk/dist/types';
import { Transaction } from '@mysten/sui/transactions';

import { Pools } from './swap';

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
  pool: Pools,
  tx: Transaction,
) => {
  const poolModel = {
    objectId: pool.objectId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
  };

  if ((pool?.rewarders?.length ?? 0) > 0) {
    mmt.Pool.collectAllRewards(tx, poolModel, pool.rewarders, position.objectId, address);
  }

  mmt.Pool.collectFee(tx, pool, position.objectId, address);
};
