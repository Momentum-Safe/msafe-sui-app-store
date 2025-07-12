import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Pool, TurbosSdk, Network } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { SuiNetworks, TransactionSubType } from '../types';

export type DecreaseLiquidityIntentionData = Pool.DecreaseLiquidityOptions;

export class DecreaseLiquidityIntention extends BaseIntention<DecreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: DecreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, amountA, amountB, slippage, nft, decreaseLiquidity, deadline, txb } = this.data;

    return turbosSdk.pool.decreaseLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      decreaseLiquidity,
      deadline,
      txb,
    });
  }

  static fromData(data: DecreaseLiquidityIntentionData) {
    return new DecreaseLiquidityIntention(data);
  }
}
