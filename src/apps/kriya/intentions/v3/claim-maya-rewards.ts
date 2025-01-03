import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { KriyaSDK } from 'kriya-dev-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { KRIYAIntentionData, TransactionSubType } from '../../types';

export class ClaimV3MayaRewardsIntention extends BaseIntention<KRIYAIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.ClaimV3MayaRewards;

  constructor(public override readonly data: KRIYAIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = new KriyaSDK();
    const { params } = this.data;

    return sdk.Clmm.getTxbClaimMayaRewards(params);
  }

  static fromData(data: KRIYAIntentionData) {
    return new ClaimV3MayaRewardsIntention(data);
  }
}
