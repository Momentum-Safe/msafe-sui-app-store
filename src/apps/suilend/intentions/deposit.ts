import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import { IntentionInput } from '../helper';

export interface DepositIntentionData {
  coinType: string;
  value: string;
}

export class DepositIntention extends SuilendBaseIntention<DepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.DEPOSIT;

  constructor(public readonly data: DepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCaps } = input;
    console.log('DepositIntention.build', suiClient, account, suilendClient, obligationOwnerCaps);

    const transaction = new Transaction();
    await suilendClient.depositIntoObligation(
      account.address,
      this.data.coinType,
      this.data.value,
      transaction as any,
      obligationOwnerCaps[0]?.id,
    );

    return transaction;
  }

  static fromData(data: DepositIntentionData) {
    return new DepositIntention(data);
  }
}
