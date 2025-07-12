import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { BurnIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class BurnIntention extends BaseIntention<BurnIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: BurnIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { pool, nft, txb } = this.data;

    return turbosSdk.nft.burn({
      pool,
      nft,
      txb,
    });
  }

  static fromData(data: BurnIntentionData) {
    return new BurnIntention(data);
  }
}
