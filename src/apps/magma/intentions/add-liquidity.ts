import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getAddLiquidityTxb, getAddLiquidityWithProtection } from '../api/position';
import { MagmaIntentionData, TransactionSubType } from '../types';

export class AddLiquidityIntention extends BaseIntention<MagmaIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.OpenAndAddLiquidity;

  constructor(public readonly data: MagmaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { txbParams } = this.data;
    const txb = await getAddLiquidityTxb(txbParams, account);
    return txb;
  }

  static fromData(data: MagmaIntentionData) {
    return new AddLiquidityIntention(data);
  }
}

export class AddLiquidityWithProtectionIntention extends BaseIntention<MagmaIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.AddLiquidityWithProtection;

  constructor(public readonly data: MagmaIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { txbParams } = this.data;
    const txb = await getAddLiquidityWithProtection(txbParams, account);
    return txb;
  }

  static fromData(data: MagmaIntentionData) {
    return new AddLiquidityWithProtectionIntention(data);
  }
}
