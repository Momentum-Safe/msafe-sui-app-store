import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

export interface StakeScaIntentionData {
  amount: number;
  isObligationLocked: boolean;
  isOldBorrowIncentive: boolean;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  lockPeriodInDays: number | undefined;
  veScaKey: string | undefined;
}

export class StakeScaIntention extends ScallopCoreBaseIntention<StakeScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeSca;

  constructor(public readonly data: StakeScaIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.stakeSca(
      this.data.amount,
      this.data.isObligationLocked,
      this.data.isOldBorrowIncentive,
      this.data.obligationId,
      this.data.obligationKey,
      this.data.lockPeriodInDays,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: StakeScaIntentionData): StakeScaIntention {
    return new StakeScaIntention(data);
  }
}
