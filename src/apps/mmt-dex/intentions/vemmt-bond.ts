import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, BondVeMMTIntentionData } from '../types';
import { performBond } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class BondVeMMTIntention extends BaseIntention<BondVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Bond;

  constructor(public override readonly data: BondVeMMTIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });

    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
    const { params } = this.data;
    const { token, amount, address, enableAutoMaxBond, unbondAt } = params;
    const tx = new Transaction();
    await performBond(sdk, veMMTSdk, token, amount, address, enableAutoMaxBond, unbondAt, tx);
    return tx;
  }

  static fromData(data: BondVeMMTIntentionData) {
    return new BondVeMMTIntention(data);
  }
}
