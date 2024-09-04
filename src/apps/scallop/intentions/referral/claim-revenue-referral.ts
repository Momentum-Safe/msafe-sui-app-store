import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ClaimRevenueReferralIntentionData {
  veScaKey: string;
  coins: string[];
}

export class ClaimRevenueReferralIntention extends ScallopCoreBaseIntention<ClaimRevenueReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRevenueReferral;

  constructor(public readonly data: ClaimRevenueReferralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.claimRevenuReferral(this.data.veScaKey, this.data.coins);
  }

  static fromData(data: ClaimRevenueReferralIntentionData): ClaimRevenueReferralIntention {
    return new ClaimRevenueReferralIntention(data);
  }
}
