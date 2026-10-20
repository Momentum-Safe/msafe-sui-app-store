import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { RepayIntentionData } from '@/apps/suilend/types/helper';
import { IntentionInput } from '@/apps/suilend/types/intention';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export class RepayIntention extends SuilendBaseIntention<RepayIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REPAY;

  constructor(public readonly data: RepayIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;

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
    return new RepayIntention(data);
  }
}
