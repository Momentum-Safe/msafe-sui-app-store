import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ExtendPeriodAndStakeMoreIntentionData {
  amount: number;
  veScaKey: string;
  lockPeriodInDays: number;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  isOldBorrowIncentive: boolean;
  isObligationLocked: boolean;
}

export class ExtendPeriodAndStakeMoreIntention extends ScallopCoreBaseIntention<ExtendPeriodAndStakeMoreIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ExtendPeriodAndStakeMore;

  constructor(public readonly data: ExtendPeriodAndStakeMoreIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.extendPeriodAndStakeMoreSca(
      this.data.amount,
      this.data.veScaKey,
      this.data.lockPeriodInDays,
      this.data.obligationId,
      this.data.obligationKey,
      this.data.isObligationLocked,
      this.data.isOldBorrowIncentive,
      input.account.address,
    );
  }

  static fromData(data: ExtendPeriodAndStakeMoreIntentionData): ExtendPeriodAndStakeMoreIntention {
    return new ExtendPeriodAndStakeMoreIntention(data);
  }
}
