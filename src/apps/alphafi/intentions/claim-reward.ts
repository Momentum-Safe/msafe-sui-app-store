import { claimRewardTxb } from '@alphafi/alphafi-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { EmptyIntentionData, TransactionSubType } from '../types';

export class ClaimRewardIntention extends BaseIntention<EmptyIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CLAIM_REWARD;

  constructor(public readonly data: EmptyIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const txb = await claimRewardTxb(account.address);
    return txb;
  }

  static fromData(data: EmptyIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
