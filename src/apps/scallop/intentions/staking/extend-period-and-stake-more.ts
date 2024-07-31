import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

export interface ExtendPeriodAndStakeMoreIntentionData {
  amount: number;
  veScaKey: string;
  lockPeriodInDays: number;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  isOldBorrowIncentive: boolean;
  isObligationLocked: boolean;
}

export class ExtendPeriodAndStakeMoreIntention extends CoreBaseIntention<ExtendPeriodAndStakeMoreIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ExtendPeriodAndStakeMore;

  constructor(public readonly data: ExtendPeriodAndStakeMoreIntentionData) {
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
    return scallopClient.extendPeriodAndStakeMoreSca(
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
