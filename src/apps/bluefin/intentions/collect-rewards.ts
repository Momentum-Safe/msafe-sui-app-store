import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import TxBuilder from '../tx-builder';
import { SuiNetworks, TransactionSubType, BluefinIntentionData, CollectRewardsIntentionData } from '../types';

export class CollectRewards extends BaseIntention<BluefinIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.CollectRewards;

  constructor(public readonly data: BluefinIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    console.log(this.data);
    const txb = await TxBuilder.collectRewards(this.data as CollectRewardsIntentionData, account, network);
    return txb;
  }

  static fromData(data: BluefinIntentionData) {
    return new CollectRewards(data);
  }
}
