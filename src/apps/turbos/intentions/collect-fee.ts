import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { CollectFeeIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class CollectFeeIntention extends BaseIntention<CollectFeeIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectFeeIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, nft, collectAmountA, collectAmountB, deadline, txb } = this.data;

    const tx = await turbosSdk.pool.collectFee({
      pool,
      address,
      collectAmountA,
      collectAmountB,
      nft,
      deadline,
      txb,
    });

    return tx;
  }

  static fromData(data: CollectFeeIntentionData) {
    return new CollectFeeIntention(data);
  }
}
