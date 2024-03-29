import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, Pool, TurbosSdk } from 'turbos-clmm-sdk';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { SuiNetworks, TransactionSubType } from '../types';

export type CollectFeeIntentionData = Pool.CollectFeeOptions;

export class CollectFeeIntention extends CoreBaseIntention<CollectFeeIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CollectFeeIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, nft, collectAmountA, collectAmountB, txb } = this.data;

    return turbosSdk.pool.collectFee({
      pool,
      address,
      collectAmountA,
      collectAmountB,
      nft,
      txb,
    });
  }

  static fromData(data: CollectFeeIntentionData) {
    return new CollectFeeIntention(data);
  }
}
