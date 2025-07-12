import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Pool, TurbosSdk, Network } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { SuiNetworks, TransactionSubType } from '../types';

export type IncreaseLiquidityIntentionData = Pool.IncreaseLiquidityOptions;

export class IncreaseLiquidityIntention extends BaseIntention<IncreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: IncreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, amountA, amountB, slippage, nft, deadline, txb } = this.data;

    return turbosSdk.pool.increaseLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      deadline,
      txb,
    });
  }

  static fromData(data: IncreaseLiquidityIntentionData) {
    return new IncreaseLiquidityIntention(data);
  }
}
