/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { NetworkType, SupportAssetCoins, TransactionSubType } from '../../types';
import { scallopInstance } from '../../models';

export interface SupplyAndStakeLendingIntentionData {
  amount: number | string;
  coinName: SupportAssetCoins;
  stakeAccountId?: string | null;
}

export class SupplyAndStakeLendingIntention extends CoreBaseIntention<SupplyAndStakeLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyAndStakeLending;

  constructor(public readonly data: SupplyAndStakeLendingIntentionData) {
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
    
    return scallopClient.supplyAndStake(
      this.data.coinName,
      Number(this.data.amount),
      this.data.stakeAccountId,
      input.account.address,
    );
  }

  static fromData(data: SupplyAndStakeLendingIntentionData): SupplyAndStakeLendingIntention {
    return new SupplyAndStakeLendingIntention(data);
  }
}
