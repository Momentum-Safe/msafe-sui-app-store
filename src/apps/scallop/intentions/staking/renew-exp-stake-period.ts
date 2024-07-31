import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

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

export class RenewExpStakePeriodIntention extends ScallopCoreBaseIntention<RenewExpStakePeriodIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RenewExpStakePeriod;

  constructor(public readonly data: RenewExpStakePeriodIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.renewExpiredStakeSca(
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
