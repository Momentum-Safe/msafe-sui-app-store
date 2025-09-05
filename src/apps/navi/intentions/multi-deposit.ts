import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { depositToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getTokenObjs } from '../utils/token';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryMultiDepositIntentionData {
  list: {
    amount: number;
    assetId: number;
  }[];
}

export class EntryMultiDepositIntention extends BaseIntention<EntryMultiDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryDeposit;

  constructor(public readonly data: EntryMultiDepositIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    const { list } = this.data;
    const tx = new Transaction();
    console.log('build', this.data);

    for (let i = 0; i < list.length; i++) {
      const { assetId, amount } = list[i];
      const pool = await getPoolConfigByAssetId(assetId);
      if (assetId === 0) {
        const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
        await depositToken(tx, pool, toDeposit, amount);
        continue;
      }

      const tokenInfo = await getTokenObjs(suiClient, account.address, pool.suiCoinType);
      if (!tokenInfo.data[0]) {
        throw new Error(`Insufficient balance for ${pool.suiCoinType} Token`);
      }

      const coinObj = tokenInfo.data[0].coinObjectId;

      if (tokenInfo.data.length >= 2) {
        let j = 1;
        while (j < tokenInfo.data.length) {
          tx.mergeCoins(coinObj, [tokenInfo.data[j].coinObjectId]);
          j++;
        }
      }

      await depositToken(tx, pool, tx.object(coinObj), amount);
    }

    return tx;
  }

  static fromData(data: EntryMultiDepositIntentionData) {
    return new EntryMultiDepositIntention(data);
  }
}
