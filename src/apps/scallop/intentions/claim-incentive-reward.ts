import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportBorrowIncentiveRewardCoins, SupportStakeMarketCoins } from '../types';
import { TransactionSubType } from '../types/utils';

export interface ClaimIncentiveRewardIntentionData {
  lendingIncentive: {
    stakeMarketCoinName: SupportStakeMarketCoins;
    stakeAccountId: string;
  }[];
  borrowIncentiveV2: {
    obligationId: string;
    obligationKey: string;
    rewardCoinName: SupportBorrowIncentiveRewardCoins;
  }[];
  borrowIncentive: {
    obligationId: string;
    obligationKey: string;
    rewardCoinName: SupportBorrowIncentiveRewardCoins;
  }[];
}

export class ClaimIncentiveRewardIntention extends CoreBaseIntention<ClaimIncentiveRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimIncentiveReward;

  constructor(public readonly data: ClaimIncentiveRewardIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    scallopClient.init();
    return scallopClient.claim(
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
