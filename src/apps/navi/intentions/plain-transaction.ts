import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType } from '../types';
import { fromHex } from '@mysten/bcs';

export interface PlainTransactionIntentionData {
  content: string;
  scene: string;
}

export class PlainTransactionIntention extends BaseIntention<PlainTransactionIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.PlainTransaction;

  constructor(public readonly data: PlainTransactionIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    console.log('build', this.data);
    return Transaction.from(this.data.content);
  }

  static fromData(data: PlainTransactionIntentionData) {
    return new PlainTransactionIntention(data);
  }
}
