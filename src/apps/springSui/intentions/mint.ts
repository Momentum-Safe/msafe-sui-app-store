import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface MintIntentionData {
  amount: string;
}

export class MintIntention extends SpringSuiBaseIntention<MintIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MINT;

  constructor(public readonly data: MintIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, lstClient } = input;
    console.log('MintIntention.build', suiClient, account, lstClient);

    const transaction = new Transaction();
    lstClient.mintAndRebalanceAndSendToUser(transaction as any, account.address, this.data.amount);

    return transaction;
  }

  static fromData(data: MintIntentionData) {
    console.log('MintIntention.fromData', data);
    return new MintIntention(data);
  }
}
