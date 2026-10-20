import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { WithdrawIntentionData } from '@/apps/suilend/types/helper';
import { IntentionInput } from '@/apps/suilend/types/intention';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export class WithdrawIntention extends SuilendBaseIntention<WithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WITHDRAW;

  constructor(public readonly data: WithdrawIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;

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
    return new WithdrawIntention(data);
  }
}
