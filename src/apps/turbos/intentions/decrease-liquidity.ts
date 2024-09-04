import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface DecreaseLiquidityIntentionData extends Pool.DecreaseLiquidityOptions {}

export class DecreaseLiquidityIntention extends CoreBaseIntention<DecreaseLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: DecreaseLiquidityIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
