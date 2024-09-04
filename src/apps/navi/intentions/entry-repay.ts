import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { repayToken } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType } from '../types';
import { getTokenObjs } from '../utils/token';

export interface EntryRepayIntentionData {
  amount: number;
  coinType: CoinType;
}

export class EntryRepayIntention extends CoreBaseIntention<EntryRepayIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryRepay;

  constructor(public readonly data: EntryRepayIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    const { coinType, amount } = this.data;
    const tx = new Transaction();
    console.log('build', this.data);

    if (coinType === 'sui') {
      const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
      return repayToken(tx, config.pool.sui, toDeposit, amount);
    }

    const pool = config.pool[coinType];

    if (!pool) {
      throw new Error(`${coinType} not support, please use ${Object.keys(config.pool).join(', ')}.`);
    }

    const tokenInfo = await getTokenObjs(suiClient, account.address, pool.type);
    if (!tokenInfo.data[0]) {
      throw new Error(`Insufficient balance for ${pool.name} Token`);
    }

    const coinObj = tokenInfo.data[0].coinObjectId;

    if (tokenInfo.data.length >= 2) {
      let i = 1;
      while (i < tokenInfo.data.length) {
        tx.mergeCoins(coinObj, [tokenInfo.data[i].coinObjectId]);
        i++;
      }
    }

    return repayToken(tx, pool, tx.object(coinObj), amount);
  }

  static fromData(data: EntryRepayIntentionData) {
    return new EntryRepayIntention(data);
  }
}
