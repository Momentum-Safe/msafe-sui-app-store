import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { RemoveLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class RemoveLiquidityIntention extends BaseIntentionGrpc<RemoveLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.RemoveLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    let txb = new Transaction();
    txb = await turbosSdk.pool.collectFee({ txb, ...this.data });
    txb = await turbosSdk.pool.collectReward({ txb, ...this.data });
    txb = await turbosSdk.pool.decreaseLiquidity({ txb, ...this.data });
    txb = await turbosSdk.position.burn({ txb, nft: this.data.nft, pool: this.data.pool });
    return txb;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
