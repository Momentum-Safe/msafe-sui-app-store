import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface RepayWithBoostIntentionData {
  coinName: string;
  amount: number | string;
  obligationId: string;
  veScaKey: string;
}

export class RepayWithBoostIntention extends ScallopCoreBaseIntention<RepayWithBoostIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RepayWithBoost;

  constructor(public readonly data: RepayWithBoostIntentionData) {
    super(data);
  }

  async repayWithBoost({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const { coinName, amount, obligationId, veScaKey } = this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    const availableStake = client.constants.whitelist.borrowing.has(coinName);
    if (availableStake) {
      await tx.unstakeObligationQuick(obligationId, undefined);
    }
    await tx.repayQuick(+amount, coinName, obligationId);
    if (availableStake) {
      await tx.stakeObligationWithVeScaQuick(obligationId, undefined, veScaKey);
    }
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.repayWithBoost(input);
  }

  static fromData(data: RepayWithBoostIntentionData): RepayWithBoostIntention {
    return new RepayWithBoostIntention(data);
  }
}
