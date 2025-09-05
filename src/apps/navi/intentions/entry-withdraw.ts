import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { withdrawToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryWithdrawIntentionData {
  amount: number;
  assetId: number;
}

export class EntryWithdrawIntention extends BaseIntention<EntryWithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryWithdraw;

  constructor(public readonly data: EntryWithdrawIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { assetId, amount } = this.data;
    const tx = new Transaction();
    console.log('build', this.data);

    const pool = await getPoolConfigByAssetId(assetId);

    const txb = await withdrawToken(tx, pool, amount, input.account.address);
    return txb;
  }

  static fromData(data: EntryWithdrawIntentionData) {
    return new EntryWithdrawIntention(data);
  }
}
