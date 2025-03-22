import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { SCA_COIN_TYPE, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

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

  async renewExpiredStakeSca({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const sender = account.address;
    const {
      amount,
      lockPeriodInDays,
      vescaKey,
      isHaveRedeem,
      obligation,
      obligationKey,
      isObligationLocked,
      isOldBorrowIncentive,
    } = this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    if (isHaveRedeem) {
      const redeem = tx.redeemSca(vescaKey);
      tx.transferObjects([redeem], sender);
    }

    // Get all SCA and merge them into one.
    const coins = await client.builder.utils.selectCoins(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = tx.takeAmountFromCoins(coins, amount);
    tx.transferObjects([leftCoin], sender);

    // renew veSCA
    tx.renewExpiredVeSca(vescaKey, takeCoin, lockPeriodInDays);
    if (!obligation || !obligationKey) {
      return tx.txBlock;
    }
    if (isObligationLocked) {
      if (isOldBorrowIncentive) {
        OldBorrowIncentiveTxBuilder.unstakeObligation(tx, obligationKey, obligation);
      } else {
        tx.unstakeObligation(obligation, obligationKey);
      }
    }
    tx.stakeObligationWithVesca(obligation, obligationKey, vescaKey);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.renewExpiredStakeSca(input);
  }

  static fromData(data: RenewExpStakePeriodIntentionData): RenewExpStakePeriodIntention {
    return new RenewExpStakePeriodIntention(data);
  }
}
