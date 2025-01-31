import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { ClaimIntentionData } from '@/apps/suilend/types/helper';
import { IntentionInput } from '@/apps/suilend/types/intention';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import getRewards from '../utils/getRewards';

export class ClaimIntention extends SuilendBaseIntention<ClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CLAIM;

  constructor(public readonly data: ClaimIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('ClaimIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    suilendClient.claimRewardsAndSendToUser(
      account.address,
      obligationOwnerCap.id,
      getRewards(suilendClient, obligation),
      transaction,
    );

    return transaction;
  }

  static fromData(data: ClaimIntentionData) {
    console.log('ClaimIntention.fromData', data);
    return new ClaimIntention(data);
  }
}
