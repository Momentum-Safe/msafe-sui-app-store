import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { swap_exact_base_for_quote } from '../api/deepbook';
import { SuiNetworks, SwapExactBaseForQuoteIntentionData, TransactionSubType } from '../types';

export class SwapExactBaseForQuoteIntention extends BaseIntention<SwapExactBaseForQuoteIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.SwapExactBaseForQuote;

  constructor(public override readonly data: SwapExactBaseForQuoteIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const txb = await swap_exact_base_for_quote({ ...this.data, turbosSdk, currentAddress: input.account.address });
    return txb;
  }

  static fromData(data: SwapExactBaseForQuoteIntentionData) {
    return new SwapExactBaseForQuoteIntention(data);
  }
}
