import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../types';
import { getPsmTx, PsmIntentionData } from '../api/psm';

export class PsmOutIntention extends BaseIntention<PsmIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.PsmOut;

  constructor(public readonly data: PsmIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getPsmTx(this.data, account, network, false);
    return tx;
  }

  static fromData(data: PsmIntentionData) {
    return new PsmOutIntention(data);
  }
}
