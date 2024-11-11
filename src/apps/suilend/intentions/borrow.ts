import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export interface BorrowIntentionData {
  coinType: string;
  value: string;
}

export class BorrowIntention extends SuilendBaseIntention<BorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.BORROW;

  constructor(public readonly data: BorrowIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCaps, obligations } = input;
    console.log('BorrowIntention.build', suiClient, account, suilendClient, obligationOwnerCaps, obligations);

    const obligationOwnerCap = obligationOwnerCaps[0];
    const obligation = obligations[0];
    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    await suilendClient.borrowFromObligation(
      account.address,
      obligationOwnerCaps[0].id,
      obligations[0].id,
      this.data.coinType,
      this.data.value,
      transaction as any,
    );

    return transaction;
  }

  static fromData(data: BorrowIntentionData) {
    console.log('BorrowIntention.fromData', data);
    return new BorrowIntention(data);
  }
}
