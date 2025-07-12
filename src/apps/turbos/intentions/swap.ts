import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Trade, TurbosSdk, Network } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { SuiNetworks, TransactionSubType } from '../types';

export type SwapIntentionData = Trade.SwapOptions;

export class SwapIntention extends BaseIntention<SwapIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    console.log(this.data, 'this.data');
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
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
