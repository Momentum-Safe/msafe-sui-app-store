import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { CollectRewardIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CollectRewardIntention extends BaseIntentionLegacy<CollectRewardIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectRewardIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
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
