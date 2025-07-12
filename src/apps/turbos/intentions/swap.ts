import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { SuiNetworks, SwapIntentionData, TransactionSubType } from '../types';

export class SwapIntention extends BaseIntention<SwapIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    console.log(this.data, 'this.data');
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { routes, coinTypeA, coinTypeB, address, amountA, amountB, slippage, amountSpecifiedIsInput, deadline } =
      this.data;
    const tx = await turbosSdk.trade.swap({
      routes,
      coinTypeA,
      coinTypeB,
      address,
      amountA,
      amountB,
      amountSpecifiedIsInput,
      slippage,
      deadline,
    });
    return tx;
  }

  static fromData(data: SwapIntentionData) {
    return new SwapIntention(data);
  }
}
