import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';

import { SupportBorrowIncentiveRewardCoins, TransactionSubType } from '../../types';
import { Scallop } from '../../models';

export interface MigrateAndClaimIntentionData {
  obligationKey: string;
  obligationId: string;
  rewardCoinName: SupportBorrowIncentiveRewardCoins;
  veScaKey?: string;
}

export class MigrateAndClaimIntention extends ScallopCoreBaseIntention<MigrateAndClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateAndClaim;

  constructor(public readonly data: MigrateAndClaimIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.migrateAndClaim(
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
