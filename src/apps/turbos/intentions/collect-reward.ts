import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { CollectRewardIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CollectRewardIntention extends BaseIntentionGrpc<CollectRewardIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectRewardIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
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
