import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import config from '../config';
import { TransactionSubType } from '../types';

export interface StakeIntentionData {
  amount: number;
}

export class StakeIntention extends CoreBaseIntention<StakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Stake;

  constructor(public readonly data: StakeIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    console.log(input);
    const tx = new Transaction();
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
