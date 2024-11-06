import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import { IntentionInput } from '../helper';

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
    const { suiClient, account, suilendClient, obligationOwnerCaps, obligations } = input;
    console.log('WithdrawIntention.build', suiClient, account, suilendClient, obligationOwnerCaps, obligations);

    const obligationOwnerCap = obligationOwnerCaps[0];
    const obligation = obligations[0];
    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    await suilendClient.withdrawFromObligation(
      account.address,
      obligationOwnerCaps[0].id,
      obligations[0].id,
      this.data.coinType,
      this.data.value,
      transaction as any,
    );

    return transaction;
  }

  static fromData(data: WithdrawIntentionData) {
    console.log('WithdrawIntention.fromData', data);
    return new WithdrawIntention(data);
  }
}
