import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { createObligationIfNoneExists, sendObligationToUser } from '@suilend/frontend-sui';
import { convertLsts } from '@suilend/frontend-sui/lib/springsui';
import { LstClient } from '@suilend/springsui-sdk';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface ConvertAndDepositIntentionData {
  amount: string;
  inCoinType: string;
  outCoinType: string;
}

export class ConvertAndDepositIntention extends SpringSuiBaseIntention<ConvertAndDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CONVERT_AND_DEPOSIT;

  constructor(public readonly data: ConvertAndDepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'ConvertAndDepositIntention.build',
      suiClient,
      account,
      suilendClient,
      LIQUID_STAKING_INFO_MAP,
      obligationOwnerCap,
      obligation,
    );

    const inLstClient = await LstClient.initialize(
      suiClient as any,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.inCoinType),
    );
    const outLstClient = await LstClient.initialize(
      suiClient as any,
      Object.values(LIQUID_STAKING_INFO_MAP).find((info) => info.type === this.data.outCoinType),
    );

    //

    const transaction = new Transaction();

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      suilendClient,
      transaction as any,
      obligationOwnerCap,
    );

    const lstCoin = convertLsts(inLstClient, outLstClient, transaction as any, account.address, this.data.amount);
    suilendClient.deposit(lstCoin, this.data.outCoinType, obligationOwnerCapId, transaction as any);

    if (didCreate) {
      sendObligationToUser(obligationOwnerCapId, account.address, transaction as any);
    }

    return transaction;
  }

  static fromData(data: ConvertAndDepositIntentionData) {
    console.log('ConvertAndDepositIntention.fromData', data);
    return new ConvertAndDepositIntention(data);
  }
}
