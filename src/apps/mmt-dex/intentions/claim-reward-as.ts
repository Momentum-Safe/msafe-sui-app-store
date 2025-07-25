import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { ClaimRewardsAsIntentionData, TransactionSubType } from '../types';
import { claimRewardsAsTargetCoin } from '../utils/reward';

export class ClaimRewardAsIntention extends BaseIntention<ClaimRewardsAsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRewardsAs;

  constructor(public override readonly data: ClaimRewardsAsIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const txb = new Transaction();

    await Promise.all(
      params.claimParams.map((param) =>
        claimRewardsAsTargetCoin({
          ...param,
          sdk,
          txb,
        }),
      ),
    );

    return txb;
  }

  static fromData(data: ClaimRewardsAsIntentionData) {
    return new ClaimRewardAsIntention(data);
  }
}
