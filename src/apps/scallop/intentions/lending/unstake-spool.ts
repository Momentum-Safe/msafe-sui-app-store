import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface UnstakeSpoolIntentionData {
  amount: number | string;
  marketCoinName: string;
  stakeAccountId: string | null;
}

export class UnstakeSpoolIntention extends ScallopCoreBaseIntention<UnstakeSpoolIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnstakeSpool;

  constructor(public readonly data: UnstakeSpoolIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return input.scallopClient.unstake(this.data.marketCoinName, +this.data.amount, false);
  }

  static fromData(data: UnstakeSpoolIntentionData): UnstakeSpoolIntention {
    return new UnstakeSpoolIntention(data);
  }
}
