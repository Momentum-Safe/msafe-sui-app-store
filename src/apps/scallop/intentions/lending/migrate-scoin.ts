import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MigrateScoinIntentionData {}

export class MigrateScoinIntention extends ScallopCoreBaseIntention<MigrateScoinIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateScoin;

  constructor(public readonly data: MigrateScoinIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return input.scallopClient.migrateAllMarketCoin(false, false);
  }

  static fromData(data: MigrateScoinIntentionData): MigrateScoinIntention {
    return new MigrateScoinIntention(data);
  }
}
