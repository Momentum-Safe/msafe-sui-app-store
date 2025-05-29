import { normalizeStructTag } from '@mysten/sui/utils';
import { ClaimRewardsReward, Side, SuilendClient } from '@suilend/sdk';
import { Obligation } from '@suilend/sdk/_generated/suilend/obligation/structs';
import { isSendPoints } from '@suilend/sui-fe';
import BigNumber from 'bignumber.js';

const getRewards = (suilendClient: SuilendClient, obligation: Obligation<string>) => {
  const rewardsMap: Record<Side, ClaimRewardsReward[]> = {
    [Side.DEPOSIT]: [],
    [Side.BORROW]: [],
  };

  suilendClient.lendingMarket.reserves.forEach((reserve) => {
    [Side.DEPOSIT, Side.BORROW].forEach((side) => {
      const reservePrm = side === Side.DEPOSIT ? reserve.depositsPoolRewardManager : reserve.borrowsPoolRewardManager;

      const sideUrm = obligation.userRewardManagers.find((urm) => urm.poolRewardManagerId === reservePrm.id);
      if (!sideUrm) {
        return;
      }

      rewardsMap[side] = reservePrm.poolRewards
        .map((pr, index) => ({
          reserveArrayIndex: reserve.arrayIndex,
          rewardIndex: BigInt(index),
          rewardCoinType: normalizeStructTag(pr.coinType.name),
          side,
        }))
        .filter(
          (r) =>
            !isSendPoints(r.rewardCoinType) &&
            !!sideUrm.rewards[Number(r.rewardIndex)] &&
            new BigNumber(sideUrm.rewards[Number(r.rewardIndex)].earnedRewards.value.toString()).gt(0),
        );
    });
  });

  return Object.values(rewardsMap).flat();
};

export default getRewards;
