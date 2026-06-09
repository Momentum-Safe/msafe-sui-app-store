import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface ClaimRevenueReferralIntentionData {
  veScaKey: string;
  coins: string[];
}

export class ClaimRevenueReferralIntention extends ScallopCoreBaseIntention<ClaimRevenueReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRevenueReferral;

  constructor(public readonly data: ClaimRevenueReferralIntentionData) {
    super(data);
  }

  async claimRevenueReferral({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const { veScaKey, coins } = this.data;
    const sender = account.address;
    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    // `coins` are already coin names (e.g. 'usdc'); claimReferralRevenueQuick expects names.
    await tx.claimReferralRevenueQuick(veScaKey, coins);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.claimRevenueReferral(input);
  }

  static fromData(data: ClaimRevenueReferralIntentionData): ClaimRevenueReferralIntention {
    return new ClaimRevenueReferralIntention(data);
  }
}
