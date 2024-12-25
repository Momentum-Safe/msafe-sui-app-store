import { BaseIntention } from '@/apps/interface/sui';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { TransactionSubType } from '../types';
import { redeem } from '@alphafi/stsui-sdk';

export interface RedeemIntentionData {
  amount: string;
}

export class RedeemIntention extends BaseIntention<RedeemIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REDEEM;

  constructor(public readonly data: RedeemIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { amount } = this.data;
    const txb = await redeem(amount, { address: account.address });
    return txb;
  }

  static fromData(data: RedeemIntentionData) {
    console.log('RedeemIntention.fromData', data);
    return new RedeemIntention(data);
  }
}
