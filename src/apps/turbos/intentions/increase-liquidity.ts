import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui.js/client';
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

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, address, amountA, amountB, slippage, nft, txb } = this.data;

    return turbosSdk.pool.increaseLiquidity({
      pool,
      slippage,
      address,
      amountA,
      amountB,
      nft,
      txb,
    });
  }

  static fromData(data: IncreaseLiquidityIntentionData) {
    return new IncreaseLiquidityIntention(data);
  }
}
