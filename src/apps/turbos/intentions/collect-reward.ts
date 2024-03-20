import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';

export interface CollectRewardIntentionData extends Pool.CollectRewardOptions {}

export class CollectRewardIntention extends CoreBaseIntention<CollectRewardIntentionData> {
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
    const { pool, address, nft, rewardAmounts, txb } = this.data;

    return turbosSdk.pool.collectReward({
      pool,
      address,
      rewardAmounts,
      nft,
      txb,
    });
  }

  static fromData(data: CollectRewardIntentionData) {
    return new CollectRewardIntention(data);
  }
}
