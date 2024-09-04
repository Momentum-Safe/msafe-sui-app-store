import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network, Account } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { swap_exact_base_for_quote } from '../api/deepbook';

export interface SwapExactBaseForQuoteIntentionData {
  token1: string;
  token2: string;
  poolId: string;
  amountIn: number;
}

export class SwapExactBaseForQuoteIntention extends CoreBaseIntention<SwapExactBaseForQuoteIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.SwapExactBaseForQuote;

  constructor(public override readonly data: SwapExactBaseForQuoteIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const txb = await swap_exact_base_for_quote({ ...this.data, turbosSdk, currentAddress: input.account.address });
    return txb;
  }

  static fromData(data: SwapExactBaseForQuoteIntentionData) {
    return new SwapExactBaseForQuoteIntention(data);
  }
}
