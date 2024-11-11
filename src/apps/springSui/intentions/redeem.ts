import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface RedeemIntentionData {
  amount: string;
}

export class RedeemIntention extends SpringSuiBaseIntention<RedeemIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REDEEM;

  constructor(public readonly data: RedeemIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, lstClient } = input;
    console.log('RedeemIntention.build', suiClient, account, lstClient);

    const transaction = new Transaction();
    lstClient.redeemAndSendToUser(transaction as any, account.address, this.data.amount);

    return transaction;
  }

  static fromData(data: RedeemIntentionData) {
    console.log('RedeemIntention.fromData', data);
    return new RedeemIntention(data);
  }
}
