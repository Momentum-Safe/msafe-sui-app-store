import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

export interface ClaimRevenueReferralIntentionData {
  veScaKey: string;
  coins: string[];
}

export class ClaimRevenueReferralIntention extends CoreBaseIntention<ClaimRevenueReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRevenueReferral;

  constructor(public readonly data: ClaimRevenueReferralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    return scallopClient.claimRevenuReferral(this.data.veScaKey, this.data.coins);
  }

  static fromData(data: ClaimRevenueReferralIntentionData): ClaimRevenueReferralIntention {
    return new ClaimRevenueReferralIntention(data);
  }
}
