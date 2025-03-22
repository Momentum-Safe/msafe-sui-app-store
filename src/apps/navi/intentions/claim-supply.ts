import { TransactionType } from '@msafe/sui3-utils';
import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { claimSupply } from '../api/incentiveV2';
import { TransactionSubType } from '../types';

export interface ClaimSupplyIntentionData {
  type: string;
}

export class ClaimSupplyIntention extends BaseIntentionLegacy<ClaimSupplyIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.EntryClaimAndDeposit;

  constructor(public readonly data: ClaimSupplyIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { type } = this.data;
    console.log('claim reward and supply', type);
    const txb = await claimSupply(input.suiClient, input.account.address);
    return txb;
  }

  static fromData(data: ClaimSupplyIntentionData) {
    return new ClaimSupplyIntention(data);
  }
}
