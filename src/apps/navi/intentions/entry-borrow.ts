import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { borrowToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryBorrowIntentionData {
  amount: number;
  assetId: number;
}

export class EntryBorrowIntention extends BaseIntentionLegacy<EntryBorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryBorrow;

  constructor(public readonly data: EntryBorrowIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<TransactionBlock> {
    const { assetId, amount } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);

    const pool = getPoolConfigByAssetId(assetId);

    const txb = await borrowToken(tx, pool, amount, input.account.address);
    return txb;
  }

  static fromData(data: EntryBorrowIntentionData) {
    return new EntryBorrowIntention(data);
  }
}
