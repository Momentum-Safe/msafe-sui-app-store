import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { getCreatePoolTxb } from '../api/position';
import { CetusIntentionData, TransactionSubType } from '../types';

export class CreatePoolIntention extends BaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.CreatePool;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getCreatePoolTxb(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new CreatePoolIntention(data);
  }
}
