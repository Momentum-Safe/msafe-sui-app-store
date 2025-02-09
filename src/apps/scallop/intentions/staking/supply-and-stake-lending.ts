/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportAssetCoins, SupportPoolCoins, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface SupplyAndStakeLendingIntentionData {
  amount: number | string;
  coinName: SupportAssetCoins;
  stakeAccountId?: string | null;
}

export class SupplyAndStakeLendingIntention extends ScallopCoreBaseIntention<SupplyAndStakeLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyAndStakeLending;

  constructor(public readonly data: SupplyAndStakeLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.supplyAndStake(
      this.data.coinName as SupportPoolCoins,
      Number(this.data.amount),
      this.data.stakeAccountId,
      input.account.address,
    );
  }

  static fromData(data: SupplyAndStakeLendingIntentionData): SupplyAndStakeLendingIntention {
    return new SupplyAndStakeLendingIntention(data);
  }
}
