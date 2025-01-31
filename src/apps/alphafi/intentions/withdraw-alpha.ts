import { withdrawAlphaTxb } from '@alphafi/alphafi-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, WithdrawAlphaIntentionData } from '../types';

export class WithdrawAlphaIntention extends BaseIntention<WithdrawAlphaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WITHDRAW_ALPHA;

  constructor(public readonly data: WithdrawAlphaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { withdrawFromLocked, xTokensAmount } = this.data;
    const txb = await withdrawAlphaTxb(xTokensAmount, withdrawFromLocked, account.address);
    return txb;
  }

  static fromData(data: WithdrawAlphaIntentionData) {
    console.log('WithdrawAlphaIntention.fromData', data);
    return new WithdrawAlphaIntention(data);
  }
}
