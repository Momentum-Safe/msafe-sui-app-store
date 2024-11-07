import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';
import { LIQUID_STAKING_INFO } from '../constants';
import { IntentionInput } from '../helper';

export interface MintIntentionData {
  amount: string;
}

export class MintIntention extends SpringSuiBaseIntention<MintIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MINT;

  constructor(public readonly data: MintIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, lstClient } = input;
    console.log('MintIntention.build', suiClient, account, lstClient);

    const transaction = new Transaction();

    //

    const [sui] = transaction.splitCoins(transaction.gas, [BigInt(this.data.amount)]);
    const rSui = lstClient.mint(transaction as any, sui);
    transaction.transferObjects([rSui], account.address);

    lstClient.rebalance(transaction as any, LIQUID_STAKING_INFO.weightHookId);

    //

    return transaction;
  }

  static fromData(data: MintIntentionData) {
    console.log('MintIntention.fromData', data);
    return new MintIntention(data);
  }
}
