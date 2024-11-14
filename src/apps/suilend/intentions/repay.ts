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
    const { suiClient, account, suilendUtils } = input;
    const { suilendClient, obligationOwnerCaps, obligations } = suilendUtils;
    console.log('RepayIntention.build', suiClient, account, suilendClient, obligationOwnerCaps, obligations);

    const obligationOwnerCap = obligationOwnerCaps[0];
    const obligation = obligations[0];
    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

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
