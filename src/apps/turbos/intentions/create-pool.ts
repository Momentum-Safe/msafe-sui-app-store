import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { CreatePoolIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CreatePoolIntention extends BaseIntentionGrpc<CreatePoolIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CreatePoolIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const {
      fee,
      address,
      tickLower,
      tickUpper,
      sqrtPrice,
      slippage,
      coinTypeA,
      coinTypeB,
      amountA,
      amountB,
      deadline,
      txb,
    } = this.data;

    return turbosSdk.pool.createPool({
      fee,
      amountA,
      amountB,
      address,
      tickLower,
      tickUpper,
      sqrtPrice,
      slippage,
      coinTypeA,
      coinTypeB,
      deadline,
      txb,
    });
  }

  static fromData(data: CreatePoolIntentionData) {
    return new CreatePoolIntention(data);
  }
}
