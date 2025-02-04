import { withdrawTxb } from '@alphafi/alphafi-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, WithdrawIntentionData } from '../types';

export class WithdrawIntention extends BaseIntention<WithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WITHDRAW;

  constructor(public readonly data: WithdrawIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { poolName, xTokensAmount } = this.data;
    const txb = await withdrawTxb(xTokensAmount, poolName, account.address);
    return txb;
  }

  static fromData(data: WithdrawIntentionData) {
    console.log('WithdrawIntention.fromData', data);
    return new WithdrawIntention(data);
  }
}
