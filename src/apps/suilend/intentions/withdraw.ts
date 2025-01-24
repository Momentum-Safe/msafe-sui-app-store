import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export interface WithdrawIntentionData {
  coinType: string;
  value: string;
}

export class WithdrawIntention extends SuilendBaseIntention<WithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WITHDRAW;

  constructor(public readonly data: WithdrawIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('WithdrawIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    await suilendClient.withdrawAndSendToUser(
      account.address,
      obligationOwnerCap.id,
      obligation.id,
      this.data.coinType,
      this.data.value,
      transaction,
    );

    return transaction;
  }

  static fromData(data: WithdrawIntentionData) {
    console.log('WithdrawIntention.fromData', data);
    return new WithdrawIntention(data);
  }
}
