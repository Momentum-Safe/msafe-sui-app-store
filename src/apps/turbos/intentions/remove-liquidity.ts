import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { RemoveLiquidityIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class RemoveLiquidityIntention extends BaseIntention<RemoveLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    let txb = new TransactionBlock();
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
