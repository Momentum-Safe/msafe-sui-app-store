import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { BucketIntentionData, TransactionSubType } from '../types';
import { getPsmOutTxb } from '../api/psm';

export class PsmOutIntention extends BaseIntention<BucketIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.PsmIn;

  constructor(public readonly data: BucketIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getPsmOutTxb(txbParams, account, network);
    return txb;
  }

  static fromData(data: BucketIntentionData) {
    return new PsmOutIntention(data);
  }
}
