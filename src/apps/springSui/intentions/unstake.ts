import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient } from '@suilend/springsui-sdk';

import { UnstakeIntentionData } from '@/apps/springSui/types/intention';

import { SpringSuiBaseIntention } from './springSuiBaseIntention';
import { IntentionInput, TransactionSubType } from '../types/helper';

export class UnstakeIntention extends SpringSuiBaseIntention<UnstakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UNSTAKE;

  constructor(public readonly data: UnstakeIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'UnstakeIntention.build',
      suiClient,
      account,
      suilendClient,
      LIQUID_STAKING_INFO_MAP,
      obligationOwnerCap,
      obligation,
    );

    const inLstClient = await LstClient.initialize(
      suiClient,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.inCoinType),
    );

    //

    const transaction = new Transaction();
    inLstClient.redeemAmountAndSendToUser(transaction, account.address, this.data.amount);

    return transaction;
  }

  static fromData(data: UnstakeIntentionData) {
    console.log('UnstakeIntention.fromData', data);
    return new UnstakeIntention(data);
  }
}
