import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { TransactionSubType } from '../../types/utils';

export interface RenewExpStakePeriodIntentionData {
  amount: number;
  lockPeriodInDays: number;
  vescaKey: string;
  isHaveRedeem: boolean;
  obligation?: string;
  obligationKey?: string;
  isObligationLocked: boolean;
  isOldBorrowIncentive: boolean;
}

export class RenewExpStakePeriodIntention extends CoreBaseIntention<RenewExpStakePeriodIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RenewExpStakePeriod;

  constructor(public readonly data: RenewExpStakePeriodIntentionData) {
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
    return scallopClient.renewExpiredStakeSca(
      this.data.amount,
      this.data.lockPeriodInDays,
      this.data.vescaKey,
      this.data.isHaveRedeem,
      this.data.obligation,
      this.data.obligationKey,
      this.data.isObligationLocked,
      this.data.isOldBorrowIncentive,
      input.account.address,
    );
  }

  static fromData(data: RenewExpStakePeriodIntentionData): RenewExpStakePeriodIntention {
    return new RenewExpStakePeriodIntention(data);
  }
}
