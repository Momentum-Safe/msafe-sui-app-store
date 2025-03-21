import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { ClaimAndDepositIntentionData } from '@/apps/suilend/types/helper';
import { IntentionInput } from '@/apps/suilend/types/intention';

import { TransactionSubType } from '../types';
import { SuilendBaseIntention } from './suilendBaseIntention';
import getRewards from '../utils/getRewards';

export class ClaimAndDepositIntention extends SuilendBaseIntention<ClaimAndDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CLAIM_AND_DEPOSIT;

  constructor(public readonly data: ClaimAndDepositIntentionData) {
    super(data);
  }

  async build(input: IntentionInput): Promise<Transaction> {
    const { suiClient, account, suilendClient, obligationOwnerCap, obligation } = input;
    console.log('ClaimAndDepositIntention.build', suiClient, account, suilendClient, obligationOwnerCap, obligation);

    if (!obligationOwnerCap || !obligation) {
      throw new Error('Obligation not found');
    }

    const transaction = new Transaction();
    suilendClient.claimRewardsAndDeposit(
      account.address,
      obligationOwnerCap.id,
      getRewards(suilendClient, obligation),
      transaction,
    );

    return transaction;
  }

  static fromData(data: ClaimAndDepositIntentionData) {
    console.log('ClaimAndDepositIntention.fromData', data);
    return new ClaimAndDepositIntention(data);
  }
}
