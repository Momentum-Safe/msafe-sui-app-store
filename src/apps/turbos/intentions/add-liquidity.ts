import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { AddLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class AddLiquidityIntention extends BaseIntentionLegacy<AddLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, amountA, amountB, slippage, tickLower, tickUpper, deadline, txb } = this.data;

    return turbosSdk.pool.addLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      tickLower,
      tickUpper,
      deadline,
      txb,
    });
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
