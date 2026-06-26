import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { fromScallopTransaction } from '../../utils/transaction';
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
    return fromScallopTransaction(
      await input.scallopClient.unstake(this.data.marketCoinName, +this.data.amount, false),
    );
  }

  static fromData(data: UnstakeSpoolIntentionData): UnstakeSpoolIntention {
    return new UnstakeSpoolIntention(data);
  }
}
