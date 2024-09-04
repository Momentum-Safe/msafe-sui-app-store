import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, Pool, TurbosSdk } from 'turbos-clmm-sdk';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { SuiNetworks, TransactionSubType } from '../types';

export type CollectRewardIntentionData = Pool.CollectRewardOptions;

export class CollectRewardIntention extends CoreBaseIntention<CollectRewardIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectRewardIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, nft, rewardAmounts, deadline, txb } = this.data;

    return turbosSdk.pool.collectReward({
      pool,
      address,
      rewardAmounts,
      nft,
      deadline,
      txb,
    });
  }

  static fromData(data: CollectRewardIntentionData) {
    return new CollectRewardIntention(data);
  }
}
