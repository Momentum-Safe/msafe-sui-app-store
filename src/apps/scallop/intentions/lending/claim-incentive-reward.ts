import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { BorrowIncentiveParams, SpoolIncentiveParams } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

export interface ClaimIncentiveRewardIntentionData {
  lendingIncentive: SpoolIncentiveParams[];
  borrowIncentiveV2: BorrowIncentiveParams[];
  borrowIncentive: BorrowIncentiveParams[];
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
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    // const scallopClient = new ScallopClient({
    //   client: input.suiClient,
    //   walletAddress: input.account.address,
    //   networkType: input.network.split(':')[1] as any,
    // });
    // 
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
