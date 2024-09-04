import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
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

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.withdrawUnlockedSca(this.data.vescaKey, input.account.address);
  }

  static fromData(data: WithdrawStakedScaIntentionData): WithdrawStakedScaIntention {
    return new WithdrawStakedScaIntention(data);
  }
}
