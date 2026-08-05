import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { CollectFeeIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CollectFeeIntention extends BaseIntentionGrpc<CollectFeeIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectFeeIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const { pool, address, nft, collectAmountA, collectAmountB, deadline, txb } = this.data;

    return turbosSdk.pool.collectFee({
      pool,
      address,
      collectAmountA,
      collectAmountB,
      nft,
      deadline,
      txb,
    });
  }

  static fromData(data: CollectFeeIntentionData) {
    return new CollectFeeIntention(data);
  }
}
