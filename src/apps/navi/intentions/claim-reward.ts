import { TransactionType } from '@msafe/sui3-utils';
import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { claimReward } from '../api/incentiveV2';
import { TransactionSubType } from '../types';

export interface ClaimRewardIntentionData {
  type: string;
}

export class ClaimRewardIntention extends BaseIntentionLegacy<ClaimRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimReward;

  constructor(public readonly data: ClaimRewardIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { type } = this.data;
    console.log('claim reward', type);
    const txb = await claimReward(input.suiClient, input.account.address);
    return txb;
  }

  static fromData(data: ClaimRewardIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
