import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportBorrowIncentiveRewardCoins, TransactionSubType } from '../types';

export interface MigrateAndClaimIntentionData {
  veScaKey: string;
  obligationKey: string;
  obligationId: string;
  rewardCoinName: SupportBorrowIncentiveRewardCoins;
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
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    await scallopClient.init();
    return scallopClient.migrateAndClaim(
      this.data.veScaKey,
      this.data.obligationKey,
      this.data.obligationId,
      this.data.rewardCoinName,
    );
  }

  static fromData(data: MigrateAndClaimIntentionData): MigrateAndClaimIntention {
    return new MigrateAndClaimIntention(data);
  }
}
