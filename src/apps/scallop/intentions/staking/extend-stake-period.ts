import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ExtendStakePeriodIntentionData {
  isObligationLocked: boolean;
  isOldBorrowIncentive: boolean;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  unlockTime: number | undefined;
  veScaKey: string | undefined;
}

export class ExtendStakePeriodIntention extends ScallopCoreBaseIntention<ExtendStakePeriodIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ExtendStakePeriod;

  constructor(public readonly data: ExtendStakePeriodIntentionData) {
    super(data);
  }

  async extendStakeScaLockPeriod({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const sender = account.address;
    const { veScaKey, unlockTime, obligationId, obligationKey, isObligationLocked, isOldBorrowIncentive } = this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    tx.extendLockPeriod(veScaKey, unlockTime);
    if (obligationId && obligationKey) {
      if (isObligationLocked) {
        if (isOldBorrowIncentive) {
          OldBorrowIncentiveTxBuilder.unstakeObligation(tx, obligationKey, obligationId);
        } else {
          tx.unstakeObligation(obligationId, obligationKey);
        }
      }
      tx.stakeObligationWithVesca(obligationId, obligationKey, veScaKey);
    }
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.extendStakeScaLockPeriod(input);
  }

  static fromData(data: ExtendStakePeriodIntentionData): ExtendStakePeriodIntention {
    return new ExtendStakePeriodIntention(data);
  }
}
