import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient, convertLstsAndRebalanceAndSendToUser } from '@suilend/springsui-sdk';

import { ConvertIntentionData } from '@/apps/springSui/types/intention';

import { SpringSuiBaseIntention } from './springSuiBaseIntention';
import { IntentionInput, TransactionSubType } from '../types/helper';

export class ConvertIntention extends SpringSuiBaseIntention<ConvertIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CONVERT;

  constructor(public readonly data: ConvertIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'ConvertIntention.build',
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
    const outLstClient = await LstClient.initialize(
      suiClient,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.outCoinType),
    );

    //

    const transaction = new Transaction();
    convertLstsAndRebalanceAndSendToUser(inLstClient, outLstClient, transaction, account.address, this.data.amount);

    return transaction;
  }

  static fromData(data: ConvertIntentionData) {
    console.log('ConvertIntention.fromData', data);
    return new ConvertIntention(data);
  }
}
