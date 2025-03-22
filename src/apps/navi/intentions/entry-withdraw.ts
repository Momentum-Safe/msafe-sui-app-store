import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { withdrawToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryWithdrawIntentionData {
  amount: number;
  assetId: number;
}

export class EntryWithdrawIntention extends BaseIntentionLegacy<EntryWithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryWithdraw;

  constructor(public readonly data: EntryWithdrawIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<TransactionBlock> {
    const { assetId, amount } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);

    const pool = getPoolConfigByAssetId(assetId);

    const txb = await withdrawToken(tx, pool, amount, input.account.address);
    return txb;
  }

  static fromData(data: EntryWithdrawIntentionData) {
    return new EntryWithdrawIntention(data);
  }
}
