import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

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
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('RepayIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    await suilendClient.repayIntoObligation(
      account.address,
      obligation.id,
      this.data.coinType,
      this.data.value,
      transaction,
    );

    return transaction;
  }

  static fromData(data: RepayIntentionData) {
    console.log('RepayIntention.fromData', data);
    return new RepayIntention(data);
  }
}
