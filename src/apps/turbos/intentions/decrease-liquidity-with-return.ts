import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { DecreaseLiquidityWithReturnIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class DecreaseLiquidityWithReturnIntention extends BaseIntentionGrpc<DecreaseLiquidityWithReturnIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.DecreaseLiquidityWithReturn;

  constructor(public override readonly data: DecreaseLiquidityWithReturnIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const { pool, address, amountA, amountB, slippage, nft, decreaseLiquidity, deadline } = this.data;

    const {
      txb: tx,
      coinA: objectCoinA,
      coinB: objectCoinB,
    } = await turbosSdk.pool.decreaseLiquidityWithReturn({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      decreaseLiquidity,
      deadline,
    });
    tx.transferObjects([objectCoinA!, objectCoinB!], this.data.address);
    return tx;
  }

  static fromData(data: DecreaseLiquidityWithReturnIntentionData) {
    return new DecreaseLiquidityWithReturnIntention(data);
  }
}
