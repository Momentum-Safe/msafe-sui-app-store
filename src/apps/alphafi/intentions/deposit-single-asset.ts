import { depositSingleAssetTxb } from '@alphafi/alphafi-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { DepositSingleAssetIntentionData, TransactionSubType } from '../types';

export class DepositSingleAssetIntention extends BaseIntention<DepositSingleAssetIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.DEPOSIT_SINGLE_ASSET;

  constructor(public readonly data: DepositSingleAssetIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { poolName, amount } = this.data;
    const txb = await depositSingleAssetTxb(poolName, account.address, amount);
    return txb;
  }

  static fromData(data: DepositSingleAssetIntentionData) {
    console.log('DepositSingleAssetIntention.fromData', data);
    return new DepositSingleAssetIntention(data);
  }
}
