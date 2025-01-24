import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient } from '@suilend/springsui-sdk';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface StakeIntentionData {
  amount: string;
  outCoinType: string;
}

export class StakeIntention extends SpringSuiBaseIntention<StakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.STAKE;

  constructor(public readonly data: StakeIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'StakeIntention.build',
      suiClient,
      account,
      suilendClient,
      LIQUID_STAKING_INFO_MAP,
      obligationOwnerCap,
      obligation,
    );

    const outLstClient = await LstClient.initialize(
      suiClient,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.outCoinType),
    );

    //

    const transaction = new Transaction();
    outLstClient.mintAmountAndRebalanceAndSendToUser(transaction, account.address, this.data.amount);

    return transaction;
  }

  static fromData(data: StakeIntentionData) {
    console.log('StakeIntention.fromData', data);
    return new StakeIntention(data);
  }
}
