/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportAssetCoins, SupportPoolCoins, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface MigrateWusdcToUsdcIntentionData {
  amount: number | undefined;
  coinName: SupportAssetCoins;
  slippage: number;
  validSwapAmount: string;
  stakeAccountId: { id: string; coin: number }[];
}

export class MigrateWusdcToUsdcIntention extends ScallopCoreBaseIntention<MigrateWusdcToUsdcIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MigrateWusdcToUsdc;

  constructor(public readonly data: MigrateWusdcToUsdcIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.migrateLendingWusdcToUsdcNative(
      this.data.coinName as SupportPoolCoins,
      Number(this.data.amount),
      this.data.slippage,
      this.data.validSwapAmount,
      this.data.stakeAccountId,
    );
  }

  static fromData(data: MigrateWusdcToUsdcIntentionData): MigrateWusdcToUsdcIntention {
    return new MigrateWusdcToUsdcIntention(data);
  }
}
