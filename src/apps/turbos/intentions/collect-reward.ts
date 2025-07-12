import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { CollectRewardIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CollectRewardIntention extends BaseIntention<CollectRewardIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectRewardIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, nft, rewardAmounts, deadline, txb } = this.data;

    const tx = await turbosSdk.pool.collectReward({
      pool,
      address,
      rewardAmounts,
      nft,
      deadline,
      txb,
    });

    return tx;
  }

  static fromData(data: CollectRewardIntentionData) {
    return new CollectRewardIntention(data);
  }
}
