import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { PsmIntentionData } from '@/apps/bucket/types/api';
import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { getPsmTx } from '../api/psm';
import { TransactionSubType } from '../types';

export class PsmIntention extends BaseIntention<PsmIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Psm;

  constructor(public readonly data: PsmIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getPsmTx(this.data, account, network);
    return tx;
  }

  static fromData(data: PsmIntentionData) {
    return new PsmIntention(data);
  }
}
