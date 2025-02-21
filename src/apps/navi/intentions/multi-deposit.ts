import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

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

export class EntryMultiDepositIntention extends BaseIntentionLegacy<EntryMultiDepositIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryDeposit;

  constructor(public readonly data: EntryMultiDepositIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const { list } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);

    for (let i = 0; i < list.length; i++) {
      const { assetId, amount } = list[i];
      const pool = getPoolConfigByAssetId(assetId);
      if (assetId === 0) {
        const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
        await depositToken(tx, pool, toDeposit, amount);
        continue;
      }

      const tokenInfo = await getTokenObjs(suiClient, account.address, pool.type);
      if (!tokenInfo.data[0]) {
        throw new Error(`Insufficient balance for ${pool.name} Token`);
      }

      const coinObj = tokenInfo.data[0].coinObjectId;

      if (tokenInfo.data.length >= 2) {
        let j = 1;
        while (j < tokenInfo.data.length) {
          tx.mergeCoins(coinObj, [tokenInfo.data[i].coinObjectId]);
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
