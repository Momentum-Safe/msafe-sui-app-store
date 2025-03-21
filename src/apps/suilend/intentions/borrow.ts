import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BorrowIntentionData } from '@/apps/suilend/types/helper';
import { IntentionInput } from '@/apps/suilend/types/intention';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';

export class BorrowIntention extends SuilendBaseIntention<BorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.BORROW;

  constructor(public readonly data: BorrowIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('BorrowIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    await suilendClient.borrowAndSendToUser(
      account.address,
      obligationOwnerCap.id,
      obligation.id,
      this.data.coinType,
      this.data.value,
      transaction,
    );

    return transaction;
  }

  static fromData(data: BorrowIntentionData) {
    console.log('BorrowIntention.fromData', data);
    return new BorrowIntention(data);
  }
}
