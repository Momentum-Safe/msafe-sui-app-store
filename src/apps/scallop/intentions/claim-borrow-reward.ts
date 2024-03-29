import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportBorrowIncentiveCoins } from '../types';
import { TransactionSubType } from '../types/utils';

export interface ClaimBorrowRewardIntentionData {
  coinName: SupportBorrowIncentiveCoins;
  obligationId: string;
  obligationKeyId: string;
}

export class ClaimBorrowRewardIntention extends CoreBaseIntention<ClaimBorrowRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimBorrowReward;

  constructor(public readonly data: ClaimBorrowRewardIntentionData) {
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
    await scallopClient.init();
    return scallopClient.claimBorrowIncentive(
      this.data.coinName,
      this.data.obligationId,
      this.data.obligationKeyId,
      input.account.address,
    );
  }

  static fromData(data: ClaimBorrowRewardIntentionData): ClaimBorrowRewardIntention {
    return new ClaimBorrowRewardIntention(data);
  }
}
