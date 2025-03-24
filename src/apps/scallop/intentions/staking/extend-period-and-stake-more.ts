import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { SCA_COIN_TYPE, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ExtendPeriodAndStakeMoreIntentionData {
  amount: number;
  veScaKey: string;
  unlockTime: number;
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

  async extendPeriodAndStakeMoreSca({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const { amount, veScaKey, unlockTime, obligationId, obligationKey, isOldBorrowIncentive, isObligationLocked } =
      this.data;

    const sender = account.address;
    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    // Get all SCA and merge them into one.
    const coins = await client.utils.selectCoins(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = tx.takeAmountFromCoins(coins, amount);
    tx.extendLockPeriod(veScaKey, unlockTime);
    tx.extendLockAmount(veScaKey, takeCoin);
    tx.transferObjects([leftCoin], sender);
    if (!obligationId || !obligationKey) {
      return tx.txBlock;
    }
    if (isObligationLocked) {
      if (isOldBorrowIncentive) {
        OldBorrowIncentiveTxBuilder.unstakeObligation(tx, obligationId, obligationKey);
      } else {
        tx.unstakeObligation(obligationId, obligationKey);
      }
    }
    tx.stakeObligationWithVesca(obligationId, obligationKey, veScaKey);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.extendPeriodAndStakeMoreSca(input);
  }

  static fromData(data: ExtendPeriodAndStakeMoreIntentionData): ExtendPeriodAndStakeMoreIntention {
    return new ExtendPeriodAndStakeMoreIntention(data);
  }
}
