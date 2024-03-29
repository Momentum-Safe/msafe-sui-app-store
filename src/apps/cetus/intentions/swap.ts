import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getSwapRouterTxb } from '../api/swap';
import { CetusIntentionData, TransactionSubType } from '../types';

export class SwapIntention extends CoreBaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Swap;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    const txb = await getSwapRouterTxb(
      txbParams?.createTxParams,
      txbParams?.slippage,
      txbParams?.account,
      account,
      suiClient,
    );
    console.log('Swap intention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new SwapIntention(data);
  }
}
