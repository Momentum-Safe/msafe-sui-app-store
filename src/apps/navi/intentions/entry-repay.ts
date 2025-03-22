import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { repayToken } from '../api/incentiveV2';
import { TransactionSubType } from '../types';
import { getTokenObjs } from '../utils/token';
import { getPoolConfigByAssetId } from '../utils/tools';

export interface EntryRepayIntentionData {
  amount: number;
  assetId: number;
}

export class EntryRepayIntention extends BaseIntentionLegacy<EntryRepayIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryRepay;

  constructor(public readonly data: EntryRepayIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const { assetId, amount } = this.data;
    const tx = new TransactionBlock();
    console.log('build', this.data);

    const pool = getPoolConfigByAssetId(assetId);

    if (assetId === 0) {
      const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
      return repayToken(tx, pool, toDeposit, amount);
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
