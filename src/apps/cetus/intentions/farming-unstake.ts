import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingUnstake } from '../api/farming';
import { CetusIntentionData, TransactionSubType, SuiNetworks } from '../types';

export class FarmingUnstakeIntention extends CoreBaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.FarmingUnstake;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getFarmingUnstake(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingUnstakeIntention(data);
  }
}
