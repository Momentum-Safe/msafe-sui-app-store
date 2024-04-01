/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { NetworkType, SupportAssetCoins, TransactionSubType } from '../types';

export interface SupplyLendingIntentionData {
  amount: number | string;
  coinName: SupportAssetCoins;
}

export class SupplyLendingIntention extends CoreBaseIntention<SupplyLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyLending;

  constructor(public readonly data: SupplyLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const network = input.network.split(':')[1] as NetworkType;
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: network,
    });
    scallopClient.init();
    return scallopClient.deposit(this.data.coinName, Number(this.data.amount), input.account.address);
  }

  static fromData(data: SupplyLendingIntentionData): SupplyLendingIntention {
    return new SupplyLendingIntention(data);
  }
}
