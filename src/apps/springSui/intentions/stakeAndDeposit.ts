import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { createObligationIfNoneExists, sendObligationToUser } from '@suilend/sdk';
import { LstClient } from '@suilend/springsui-sdk';

import { IntentionInput } from '../helper';
import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';

export interface StakeAndDepositIntentionData {
  amount: string;
  outCoinType: string;
}

export class StakeAndDepositIntention extends SpringSuiBaseIntention<StakeAndDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.STAKE_AND_DEPOSIT;

  constructor(public readonly data: StakeAndDepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, LIQUID_STAKING_INFO_MAP, obligationOwnerCap, obligation } = input;
    console.log(
      'StakeAndDepositIntention.build',
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

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      suilendClient,
      transaction,
      obligationOwnerCap,
    );

    const lstCoin = outLstClient.mintAmountAndRebalance(transaction, account.address, this.data.amount);
    suilendClient.deposit(lstCoin, this.data.outCoinType, obligationOwnerCapId, transaction);

    if (didCreate) {
      sendObligationToUser(obligationOwnerCapId, account.address, transaction);
    }

    return transaction;
  }

  static fromData(data: StakeAndDepositIntentionData) {
    console.log('StakeAndDepositIntention.fromData', data);
    return new StakeAndDepositIntention(data);
  }
}
