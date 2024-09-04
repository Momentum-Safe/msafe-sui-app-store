import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { BorrowIncentiveParams, SpoolIncentiveParams } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ClaimIncentiveRewardIntentionData {
  lendingIncentive: SpoolIncentiveParams[];
  borrowIncentiveV2: BorrowIncentiveParams[];
  borrowIncentive: BorrowIncentiveParams[];
}

export class ClaimIncentiveRewardIntention extends ScallopCoreBaseIntention<ClaimIncentiveRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimIncentiveReward;

  constructor(public readonly data: ClaimIncentiveRewardIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.claim(
      this.data.lendingIncentive,
      this.data.borrowIncentiveV2,
      this.data.borrowIncentive,
      input.account.address,
    );
  }

  static fromData(data: ClaimIncentiveRewardIntentionData): ClaimIncentiveRewardIntention {
    return new ClaimIncentiveRewardIntention(data);
  }
}
