import { mint } from '@alphafi/stsui-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { MintIntentionData, TransactionSubType } from '../types';

export class MintIntention extends BaseIntention<MintIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MINT;

  constructor(public readonly data: MintIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { amount } = this.data;
    const txb = await mint(amount, { address: account.address });
    return txb;
  }

  static fromData(data: MintIntentionData) {
    console.log('MintIntention.fromData', data);
    return new MintIntention(data);
  }
}
