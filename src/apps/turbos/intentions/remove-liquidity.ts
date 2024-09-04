import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface RemoveLiquidityIntentionData extends Pool.RemoveLiquidityOptions {}

export class RemoveLiquidityIntention extends CoreBaseIntention<RemoveLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    let txb = new Transaction();
    txb = await turbosSdk.pool.collectFee({ txb, ...this.data });
    txb = await turbosSdk.pool.collectReward({ txb, ...this.data });
    txb = await turbosSdk.pool.decreaseLiquidity({ txb, ...this.data });
    txb = await turbosSdk.nft.burn({ txb, nft: this.data.nft, pool: this.data.pool });
    return txb;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
