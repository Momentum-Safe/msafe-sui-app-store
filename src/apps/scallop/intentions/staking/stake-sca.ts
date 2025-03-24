import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { SCA_COIN_TYPE, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface StakeScaIntentionData {
  amount: number;
  isObligationLocked: boolean;
  isOldBorrowIncentive: boolean;
  obligationId: string | undefined;
  obligationKey: string | undefined;
  unlockTime: number | undefined;
  veScaKey: string | undefined;
}

export class StakeScaIntention extends ScallopCoreBaseIntention<StakeScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeSca;

  constructor(public readonly data: StakeScaIntentionData) {
    super(data);
  }

  async stakeSca({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const { amount, isObligationLocked, isOldBorrowIncentive, obligationId, obligationKey, unlockTime, veScaKey } =
      this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    // Get all SCA and merge them into one.
    const coins = await client.utils.selectCoins(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = tx.takeAmountFromCoins(coins, amount);

    let newVescaKey;
    if (!veScaKey) {
      newVescaKey = tx.lockSca(takeCoin, unlockTime);
    } else {
      tx.extendLockAmount(veScaKey, takeCoin);
    }

    if (obligationId && obligationKey) {
      if (isObligationLocked) {
        if (isOldBorrowIncentive) {
          OldBorrowIncentiveTxBuilder.unstakeObligation(tx, obligationKey, obligationId);
        } else {
          tx.unstakeObligation(obligationId, obligationKey);
        }
      }
      tx.stakeObligationWithVesca(obligationId, obligationKey, veScaKey || newVescaKey);
    }

    if (!veScaKey) {
      tx.transferObjects([newVescaKey, leftCoin], sender);
    }

    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.stakeSca(input);
  }

  static fromData(data: StakeScaIntentionData): StakeScaIntention {
    return new StakeScaIntention(data);
  }
}
