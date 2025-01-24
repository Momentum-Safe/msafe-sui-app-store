import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

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
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('DepositIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    const transaction = new Transaction();
    await suilendClient.depositIntoObligation(
      account.address,
      this.data.coinType,
      this.data.value,
      transaction,
      obligationOwnerCap?.id,
    );

    return transaction;
  }

  static fromData(data: DepositIntentionData) {
    console.log('DepositIntention.fromData', data);
    return new DepositIntention(data);
  }
}
