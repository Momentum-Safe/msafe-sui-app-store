import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { RemoveLiquidityWithReturnIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class RemoveLiquidityWithReturnIntention extends BaseIntentionGrpc<RemoveLiquidityWithReturnIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.RemoveLiquidityWithReturn;

  constructor(public override readonly data: RemoveLiquidityWithReturnIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const {
      txb,
      coinA: objectCoinA,
      coinB: objectCoinB,
    } = await turbosSdk.pool.removeLiquidityWithReturn({ ...this.data });
    txb.transferObjects([objectCoinA!, objectCoinB!], this.data.address);
    return txb;
  }

  static fromData(data: RemoveLiquidityWithReturnIntentionData) {
    return new RemoveLiquidityWithReturnIntention(data);
  }
}
