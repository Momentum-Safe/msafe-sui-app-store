import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { BucketIntentionData, TransactionSubType } from '../types';
import { getPsmTx } from '../api/psm';

export class PsmIntention extends BaseIntention<BucketIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Psm;

  constructor(public readonly data: BucketIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;

    const tx = await getPsmTx(txbParams, account, network);
    return tx;
  }

  static fromData(data: BucketIntentionData) {
    return new PsmIntention(data);
  }
}
