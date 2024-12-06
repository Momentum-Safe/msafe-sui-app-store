import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../types';
import { BorrowIntentionData, getBorrowTx } from '../api/lending';

export class BorrowIntention extends BaseIntention<BorrowIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Borrow;

  constructor(public readonly data: BorrowIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getBorrowTx(this.data, account, network);
    return tx;
  }

  static fromData(data: BorrowIntentionData) {
    return new BorrowIntention(data);
  }
}
