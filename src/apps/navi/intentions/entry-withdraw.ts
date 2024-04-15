import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { withdrawToken } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType } from '../types';

export interface EntryWithdrawIntentionData {
  amount: number;
  coinType: CoinType;
}

export class EntryWithdrawIntention extends CoreBaseIntention<EntryWithdrawIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryWithdraw;

  constructor(public readonly data: EntryWithdrawIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    const { coinType, amount } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);
    tx.setGasBudget(config.gasBudget);

    const pool = config.pool[coinType];

    if (!pool) {
      throw new Error(`${coinType} not support, please use ${Object.keys(config.pool).join(', ')}.`);
    }

    return withdrawToken(tx, pool, amount);
  }

  static fromData(data: EntryWithdrawIntentionData) {
    return new EntryWithdrawIntention(data);
  }
}
