import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawStakedScaIntentionData {
  vescaKey?: string;
}

export class WithdrawStakedScaIntention extends ScallopCoreBaseIntention<WithdrawStakedScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawStakedSca;

  constructor(public readonly data: WithdrawStakedScaIntentionData) {
    super(data);
  }

  async withdrawUnlockedSca({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const { vescaKey } = this.data;
    const sender = account.address;
    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    await tx.redeemScaQuick({ veScaKey: vescaKey });
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.withdrawUnlockedSca(input);
  }

  static fromData(data: WithdrawStakedScaIntentionData): WithdrawStakedScaIntention {
    return new WithdrawStakedScaIntention(data);
  }
}
