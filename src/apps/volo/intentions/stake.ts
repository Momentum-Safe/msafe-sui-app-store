import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import config from '../config';
import { TransactionSubType } from '../types';

export interface StakeIntentionData {
  amount: number;
}

export class StakeIntention extends BaseIntentionLegacy<StakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Stake;

  constructor(public readonly data: StakeIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    console.log(input);
    const tx = new TransactionBlock();
    const { amount } = this.data;
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    tx.moveCall({
      target: `${config.packageId}::native_pool::stake`,
      arguments: [
        tx.object(config.poolObjectId),
        tx.object(config.metadataObjectId),
        tx.object(config.systemStateObjectId),
        coin,
      ],
    });
    return tx;
  }

  static fromData(data: StakeIntentionData) {
    return new StakeIntention(data);
  }
}
