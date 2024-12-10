import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { getRemoveVaultsPositionPayload } from '../api/vaults';
import { CetusIntentionData, TransactionSubType } from '../types';

export class RemoveVaultsPositionIntention extends BaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.RemoveVaultsPosition;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getRemoveVaultsPositionPayload(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new RemoveVaultsPositionIntention(data);
  }
}
