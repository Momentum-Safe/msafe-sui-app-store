import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { SuiNetworks, SwapIntentionData, TransactionSubType } from '../types';

export class SwapIntention extends BaseIntentionGrpc<SwapIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    console.log(this.data, 'this.data');
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiGrpcClient);
    const { routes, coinTypeA, coinTypeB, address, amountA, amountB, slippage, amountSpecifiedIsInput, deadline, txb } =
      this.data;
    return turbosSdk.trade.swap({
      routes,
      coinTypeA,
      coinTypeB,
      address,
      amountA,
      amountB,
      amountSpecifiedIsInput,
      slippage,
      deadline,
      txb,
    });
  }

  static fromData(data: SwapIntentionData) {
    return new SwapIntention(data);
  }
}
