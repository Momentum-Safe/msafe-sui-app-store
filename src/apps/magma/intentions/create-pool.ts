import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { createPoolTxb } from '../api/pool';
import { MagmaIntentionData, TransactionSubType } from '../types';

export class CreatePoolIntention extends BaseIntention<MagmaIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.CreatePool;

  constructor(public readonly data: MagmaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { txbParams } = this.data;
    const txb = await createPoolTxb(txbParams, account);
    return txb;
  }

  static fromData(data: MagmaIntentionData) {
    return new CreatePoolIntention(data);
  }
}
