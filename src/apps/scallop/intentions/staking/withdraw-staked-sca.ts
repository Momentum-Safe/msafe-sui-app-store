import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

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
  }): Promise<TransactionBlock> {
    return input.scallop.client.withdrawUnlockedSca(this.data.vescaKey, input.account.address);
  }

  static fromData(data: WithdrawStakedScaIntentionData): WithdrawStakedScaIntention {
    return new WithdrawStakedScaIntention(data);
  }
}
