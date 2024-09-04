import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiNetworks, TransactionSubType } from '../types';
import { Pool, Trade } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';

export interface SwapIntentionData extends Trade.SwapOptions {}

export class SwapIntention extends CoreBaseIntention<SwapIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
