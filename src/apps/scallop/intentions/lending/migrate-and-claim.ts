import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types';
import { OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface MigrateAndClaimIntentionData {
  obligationKey: string;
  obligationId: string;
  rewardCoinName: string;
  veScaKey?: string;
}

export class MigrateAndClaimIntention extends ScallopCoreBaseIntention<MigrateAndClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateAndClaim;

  constructor(public readonly data: MigrateAndClaimIntentionData) {
    super(data);
  }

  async migrateAndClaim({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const { obligationKey, obligationId, rewardCoinName, veScaKey } = this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    const rewardCoin = OldBorrowIncentiveTxBuilder.redeem_rewards(
      tx,
      obligationKey,
      obligationId,
      client.utils.parseCoinType(rewardCoinName),
    );
    tx.transferObjects([rewardCoin], sender);
    await tx.unstakeObligationQuick(obligationId, obligationKey);
    if (veScaKey) {
      await tx.stakeObligationWithVeScaQuick(obligationId, obligationKey, veScaKey);
    } else {
      await tx.stakeObligationQuick(obligationId, obligationKey);
    }
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.migrateAndClaim(input);
  }

  static fromData(data: MigrateAndClaimIntentionData): MigrateAndClaimIntention {
    return new MigrateAndClaimIntention(data);
  }
}
