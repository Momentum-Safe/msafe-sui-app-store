import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiNetworks, TransactionSubType } from '../types';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';

export interface AddLiquidityIntentionData extends Pool.AddLiquidityOptions {}

export class AddLiquidityIntention extends CoreBaseIntention<AddLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
