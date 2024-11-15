import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui.js/utils';
import { Side } from '@suilend/sdk';
import BigNumber from 'bignumber.js';

import { isSendPoints } from '../constants';
import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export interface ClaimRewardsIntentionData {
  value: Record<string, string>;
}

export class ClaimRewardsIntention extends SuilendBaseIntention<ClaimRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CLAIM_REWARDS;

  constructor(public readonly data: ClaimRewardsIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('ClaimRewardsIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    type Reward = {
      reserveArrayIndex: bigint;
      rewardIndex: number;
      rewardCoinType: string;
      side: Side;
    };

    const rewardsMap: Record<Side, Reward[]> = {
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
            rewardIndex: index,
            rewardCoinType: normalizeStructTag(pr.coinType.name),
            side,
          }))
          .filter(
            (r) =>
              !isSendPoints(r.rewardCoinType) &&
              !!sideUrm.rewards[r.rewardIndex] &&
              new BigNumber(sideUrm.rewards[r.rewardIndex].earnedRewards.value.toString()).gt(0),
          );
      });
    });

    const transaction = new Transaction();
    suilendClient.claimRewardsAndSendToUser(
      account.address,
      Object.values(rewardsMap)
        .flat()
        .map((r) => ({
          obligationOwnerCapId: obligationOwnerCap.id,
          reserveArrayIndex: r.reserveArrayIndex,
          rewardIndex: BigInt(r.rewardIndex),
          rewardType: r.rewardCoinType,
          side: r.side,
        })),
      transaction as any,
    );

    return transaction;
  }

  static fromData(data: ClaimRewardsIntentionData) {
    console.log('ClaimRewardsIntention.fromData', data);
    return new ClaimRewardsIntention(data);
  }
}
