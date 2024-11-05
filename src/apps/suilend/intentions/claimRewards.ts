import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import { IntentionInput } from '../helper';

export interface ClaimRewardsIntentionData {
  coinType: string;
  value: string;
}

export class ClaimRewardsIntention extends SuilendBaseIntention<ClaimRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CLAIM_REWARDS;

  constructor(public readonly data: ClaimRewardsIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCaps, obligations } = input;
    console.log('ClaimRewardsIntention.build', suiClient, account, suilendClient, obligationOwnerCaps, obligations);

    const transaction = new Transaction();
    // await suilendClient.ClaimRewardsFromObligation(
    //   account.address,
    //   obligationOwnerCaps[0].id,
    //   obligations[0].id,
    //   this.data.coinType,
    //   this.data.value,
    //   transaction as any,
    // );

    return transaction;
  }

  static fromData(data: ClaimRewardsIntentionData) {
    console.log('ClaimRewardsIntention.fromData', data);
    return new ClaimRewardsIntention(data);
  }
}
