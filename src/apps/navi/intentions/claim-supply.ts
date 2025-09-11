import { TransactionType } from '@msafe/sui3-utils';
import type { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { claimSupply } from '../api/incentiveV2';
import { TransactionSubType } from '../types';

export interface ClaimSupplyIntentionData {
  type: string;
}

export class ClaimSupplyIntention extends BaseIntention<ClaimSupplyIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryClaimAndDeposit;

  constructor(public readonly data: ClaimSupplyIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { type } = this.data;
    console.log('claim reward and supply', type);
    const txb = await claimSupply(input.suiClient, input.account.address);
    return txb;
  }

  static fromData(data: ClaimSupplyIntentionData) {
    return new ClaimSupplyIntention(data);
  }
}
