import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { depositToken } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType } from '../types';
import { getTokenObjs } from '../utils/token';

export interface EntryDepositIntentionData {
  amount: number;
  coinType: CoinType;
}

export class EntryDepositIntention extends CoreBaseIntention<EntryDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryDeposit;

  constructor(public readonly data: EntryDepositIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    const { coinType, amount } = this.data;
    const tx = new Transaction();
    console.log('build', this.data);

    if (coinType === 'sui') {
      const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
      return depositToken(tx, config.pool.sui, toDeposit, amount);
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

    return depositToken(tx, pool, tx.object(coinObj), amount);
  }

  static fromData(data: EntryDepositIntentionData) {
    return new EntryDepositIntention(data);
  }
}
