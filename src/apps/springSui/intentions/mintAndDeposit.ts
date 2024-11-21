import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface MintAndDepositIntentionData {
  amount: string;
}

export class MintAndDepositIntention extends SpringSuiBaseIntention<MintAndDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MINT_AND_DEPOSIT;

  constructor(public readonly data: MintAndDepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, lstClient, suilendClient, obligationOwnerCap, obligation } = input;
    console.log(
      'MintAndDepositIntention.build',
      suiClient,
      account,
      lstClient,
      suilendClient,
      obligationOwnerCap,
      obligation,
    );

    const transaction = new Transaction();
    suilendClient.depositCoin(
      account.address,
      lstClient.mintAndRebalance(transaction as any, this.data.amount),
      lstClient.liquidStakingObject.type,
      transaction as any,
      obligationOwnerCap?.id,
    );

    return transaction;
  }

  static fromData(data: MintAndDepositIntentionData) {
    console.log('MintAndDepositIntention.fromData', data);
    return new MintAndDepositIntention(data);
  }
}
