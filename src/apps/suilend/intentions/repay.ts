import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import { IntentionInput } from '../helper';

export interface RepayIntentionData {
  coinType: string;
  value: string;
}

export class RepayIntention extends SuilendBaseIntention<RepayIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REPAY;

  constructor(public readonly data: RepayIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCaps, obligations } = input;
    console.log('RepayIntention.build', suiClient, account, suilendClient, obligationOwnerCaps, obligations);

    const transaction = new Transaction();
    await suilendClient.repayIntoObligation(
      account.address,
      obligations[0].id,
      this.data.coinType,
      this.data.value,
      transaction as any,
    );

    return transaction;
  }

  static fromData(data: RepayIntentionData) {
    console.log('RepayIntention.fromData', data);
    return new RepayIntention(data);
  }
}
