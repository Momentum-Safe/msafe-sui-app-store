import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { ClaimRewardsIntentionData, TransactionSubType } from '../types';
import { claimV3Rewards } from '../utils/reward';

export class ClaimRewardsIntention extends BaseIntention<ClaimRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRewards;

  constructor(public override readonly data: ClaimRewardsIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, position, pool } = params;
    const tx = new Transaction();

    claimV3Rewards(sdk, address, position, pool, tx);

    return tx;
  }

  static fromData(data: ClaimRewardsIntentionData) {
    return new ClaimRewardsIntention(data);
  }
}
