import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ExtendStakePeriodIntentionData {
  isObligationLocked: boolean;
  isOldBorrowIncentive: boolean;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  lockPeriodInDays: number | undefined;
  veScaKey: string | undefined;
}

export class ExtendStakePeriodIntention extends ScallopCoreBaseIntention<ExtendStakePeriodIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ExtendStakePeriod;

  constructor(public readonly data: ExtendStakePeriodIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.extendStakeScaLockPeriod(
      this.data.lockPeriodInDays,
      this.data.veScaKey,
      this.data.obligationId,
      this.data.obligationKey,
      this.data.isObligationLocked,
      this.data.isOldBorrowIncentive,
      input.account.address,
    );
  }

  static fromData(data: ExtendStakePeriodIntentionData): ExtendStakePeriodIntention {
    return new ExtendStakePeriodIntention(data);
  }
}
