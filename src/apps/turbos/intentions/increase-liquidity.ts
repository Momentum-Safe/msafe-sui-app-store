import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface IncreaseLiquidityIntentionData extends Pool.IncreaseLiquidityOptions {}

export class IncreaseLiquidityIntention extends CoreBaseIntention<IncreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: IncreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
