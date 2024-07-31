import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { SupportBorrowIncentiveRewardCoins, TransactionSubType } from '../../types';
import { scallopInstance } from '../../models';

export interface MigrateAndClaimIntentionData {
  obligationKey: string;
  obligationId: string;
  rewardCoinName: SupportBorrowIncentiveRewardCoins;
  veScaKey?: string;
}

export class MigrateAndClaimIntention extends CoreBaseIntention<MigrateAndClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateAndClaim;

  constructor(public readonly data: MigrateAndClaimIntentionData) {
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
    return scallopClient.migrateAndClaim(
      this.data.obligationKey,
      this.data.obligationId,
      this.data.rewardCoinName,
      this.data.veScaKey,
    );
  }

  static fromData(data: MigrateAndClaimIntentionData): MigrateAndClaimIntention {
    return new MigrateAndClaimIntention(data);
  }
}
