import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { AddLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class AddLiquidityIntention extends BaseIntentionGrpc<AddLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const { pool, address, amountA, amountB, slippage, tickLower, tickUpper, deadline, txb } = this.data;

    return turbosSdk.pool.addLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      tickLower,
      tickUpper,
      deadline,
      txb,
    });
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
