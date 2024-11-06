import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SpringSuiBaseIntention } from './springSuiBaseIntention';
import { NORMALIZED_LST_COINTYPE } from '../constants';
import { IntentionInput } from '../helper';

export interface RedeemIntentionData {
  amount: string;
}

export class RedeemIntention extends SpringSuiBaseIntention<RedeemIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REDEEM;

  constructor(public readonly data: RedeemIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, lstClient } = input;
    console.log('RedeemIntention.build', suiClient, account, lstClient);

    const transaction = new Transaction();

    //

    const coins = (
      await suiClient.getCoins({
        owner: account.address,
        coinType: NORMALIZED_LST_COINTYPE,
      })
    ).data;

    if (coins.length > 1) {
      transaction.mergeCoins(
        transaction.object(coins[0].coinObjectId),
        coins.map((c) => transaction.object(c.coinObjectId)).slice(1),
      );
    }

    const [lst] = transaction.splitCoins(transaction.object(coins[0].coinObjectId), [BigInt(this.data.amount)]);
    const sui = lstClient.redeemLst(transaction as any, lst);
    transaction.transferObjects([sui], account.address);

    //

    return transaction;
  }

  static fromData(data: RedeemIntentionData) {
    console.log('RedeemIntention.fromData', data);
    return new RedeemIntention(data);
  }
}
