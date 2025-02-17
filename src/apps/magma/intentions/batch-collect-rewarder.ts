import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getBatchCollectRewarderTxb } from '../api/rewarder';
import { MagmaIntentionData, TransactionSubType } from '../types';

export class BatchCollectRewardIntention extends BaseIntention<MagmaIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.BatchCollectRewarder;

  constructor(public readonly data: MagmaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { txbParams } = this.data;
    const txb = await getBatchCollectRewarderTxb(txbParams, account);
    return txb;
  }

  static fromData(data: MagmaIntentionData) {
    return new BatchCollectRewardIntention(data);
  }
}
