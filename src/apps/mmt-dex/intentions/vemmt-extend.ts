import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, ExtendVeMMTIntentionData } from '../types';
import { performExtend } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class ExtendVeMMTIntention extends BaseIntention<ExtendVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Extend;

  constructor(public override readonly data: ExtendVeMMTIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
    const { params } = this.data;
    const { address, veId, currentUnbondAt, isCurrentlyMaxBond, enableAutoMaxBond, unbondAt } = params;
    const tx = new Transaction();
    await performExtend(veMMTSdk, address, veId, currentUnbondAt, isCurrentlyMaxBond, enableAutoMaxBond, unbondAt, tx);
    return tx;
  }

  static fromData(data: ExtendVeMMTIntentionData) {
    return new ExtendVeMMTIntention(data);
  }
}
