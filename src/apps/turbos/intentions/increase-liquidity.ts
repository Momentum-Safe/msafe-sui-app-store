import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { IncreaseLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class IncreaseLiquidityIntention extends BaseIntention<IncreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: IncreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, amountA, amountB, slippage, nft, deadline } = this.data;

    const tx = await turbosSdk.pool.increaseLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      deadline,
    });
    return tx;
  }

  static fromData(data: IncreaseLiquidityIntentionData) {
    return new IncreaseLiquidityIntention(data);
  }
}
