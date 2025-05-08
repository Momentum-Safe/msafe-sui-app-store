import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, SwapIntentionData } from '../types';
import { performMmtSwap } from '../utils/swap';

export class SwapIntention extends BaseIntention<SwapIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Swap;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { route, tokenIn, amountIn, address } = params;
    const tx = new Transaction();
    await performMmtSwap(sdk, route, tokenIn, amountIn, address, tx);
    return tx;
  }

  static fromData(data: SwapIntentionData) {
    return new SwapIntention(data);
  }
}
