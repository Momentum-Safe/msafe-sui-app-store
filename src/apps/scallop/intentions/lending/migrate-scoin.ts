import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
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
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.migrateAllMarketCoin();
  }

  static fromData(data: MigrateScoinIntentionData): MigrateScoinIntention {
    return new MigrateScoinIntention(data);
  }
}
