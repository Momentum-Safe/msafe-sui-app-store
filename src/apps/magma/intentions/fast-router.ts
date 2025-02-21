import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getSwapRouterTxb } from '../api/swap';
import { MagmaIntentionData, TransactionSubType } from '../types';

export class FastRouterIntention extends BaseIntention<MagmaIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.FastRouterSwap;

  constructor(public readonly data: MagmaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { txbParams } = this.data;
    const txb = await getSwapRouterTxb(txbParams, account);
    return txb;
  }

  static fromData(data: MagmaIntentionData) {
    return new FastRouterIntention(data);
  }
}
