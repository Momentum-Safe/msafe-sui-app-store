import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { IncreaseLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class IncreaseLiquidityIntention extends BaseIntentionGrpc<IncreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: IncreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const { pool, address, amountA, amountB, slippage, nft, deadline, txb } = this.data;

    return turbosSdk.pool.increaseLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      deadline,
      txb,
    });
  }

  static fromData(data: IncreaseLiquidityIntentionData) {
    return new IncreaseLiquidityIntention(data);
  }
}
