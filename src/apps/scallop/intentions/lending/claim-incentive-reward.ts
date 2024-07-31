import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { BorrowIncentiveParams, SpoolIncentiveParams } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

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
  }): Promise<TransactionBlock> {
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
