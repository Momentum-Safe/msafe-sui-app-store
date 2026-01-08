import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, MergeVeMMTIntentionData } from '../types';
import { performMerge } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class MergeVeMMTIntention extends BaseIntention<MergeVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Merge;

  constructor(public override readonly data: MergeVeMMTIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
    const { params } = this.data;
    const { address, veId, selectedVeMMTIds } = params;
    const tx = new Transaction();
    await performMerge(veMMTSdk, address, veId, selectedVeMMTIds, tx);
    return tx;
  }

  static fromData(data: MergeVeMMTIntentionData) {
    return new MergeVeMMTIntention(data);
  }
}
