import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { NFT } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface BurnIntentionData extends NFT.BurnOptions {}

export class BurnIntention extends CoreBaseIntention<BurnIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: BurnIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
