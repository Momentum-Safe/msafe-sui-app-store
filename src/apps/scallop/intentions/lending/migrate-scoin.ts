import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { TransactionSubType } from '../../types';
import { scallopInstance } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MigrateScoinIntentionData {}

export class MigrateScoinIntention extends CoreBaseIntention<MigrateScoinIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateScoin;

  constructor(public readonly data: MigrateScoinIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    return scallopClient.migrateAllMarketCoin();
  }

  static fromData(data: MigrateScoinIntentionData): MigrateScoinIntention {
    return new MigrateScoinIntention(data);
  }
}
