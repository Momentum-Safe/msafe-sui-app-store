import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, UnbondVeMMTIntentionData } from '../types';
import { performUnbond } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class UnbondVeMMTIntention extends BaseIntention<UnbondVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Unbond;

  constructor(public override readonly data: UnbondVeMMTIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
    const { params } = this.data;
    const { address, veId } = params;
    const tx = new Transaction();
    await performUnbond(veMMTSdk, address, veId, tx);
    return tx;
  }

  static fromData(data: UnbondVeMMTIntentionData) {
    return new UnbondVeMMTIntention(data);
  }
}
