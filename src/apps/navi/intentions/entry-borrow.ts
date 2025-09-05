import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { borrowToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryBorrowIntentionData {
  amount: number;
  assetId: number;
}

export class EntryBorrowIntention extends BaseIntention<EntryBorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryBorrow;

  constructor(public readonly data: EntryBorrowIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { assetId, amount } = this.data;
    const tx = new Transaction();
    console.log('build', this.data);

    const pool = await getPoolConfigByAssetId(assetId);

    const txb = await borrowToken(tx, pool, amount, input.account.address);
    return txb;
  }

  static fromData(data: EntryBorrowIntentionData) {
    return new EntryBorrowIntention(data);
  }
}
