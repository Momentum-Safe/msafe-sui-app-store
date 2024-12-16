import { BaseIntention } from '@/apps/interface/sui';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { depositDoubleAssetTxb, PoolName } from '@alphafi/alphafi-sdk';
import { TransactionSubType } from '../types';

export interface DepositDoubleAssetIntentionData {
  poolName: PoolName;
  amount: string;
  isAmountA: boolean;
}

export class DepositDoubleAssetIntention extends BaseIntention<DepositDoubleAssetIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.DEPOSIT_DOUBLE_ASSET;

  constructor(public readonly data: DepositDoubleAssetIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { poolName, amount, isAmountA } = this.data;
    const txb = await depositDoubleAssetTxb(poolName, account.address, amount, isAmountA);
    return txb;
  }

  static fromData(data: DepositDoubleAssetIntentionData) {
    console.log('DepositDoubleAssetIntention.fromData', data);
    return new DepositDoubleAssetIntention(data);
  }
}
