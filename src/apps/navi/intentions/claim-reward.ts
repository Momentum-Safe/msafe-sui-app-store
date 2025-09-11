import { TransactionType } from '@msafe/sui3-utils';
import type { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { claimReward } from '../api/incentiveV2';
import { TransactionSubType } from '../types';

export interface ClaimRewardIntentionData {
  type: string;
}

export class ClaimRewardIntention extends BaseIntention<ClaimRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimReward;

  constructor(public readonly data: ClaimRewardIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { type } = this.data;
    console.log('claim reward', type);
    const txb = await claimReward(input.suiClient, input.account.address);
    return txb;
  }

  static fromData(data: ClaimRewardIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
