import { BaseIntention } from '@/apps/interface/sui';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { PoolName, withdrawTxb } from '@alphafi/alphafi-sdk';
import { TransactionSubType } from '../types';

export interface WithdrawIntentionData {
  xTokensAmount: string;
  poolName: PoolName;
}

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
    return new WithdrawIntention(data);
  }
}
