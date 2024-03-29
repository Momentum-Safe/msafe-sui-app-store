import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { TransactionSubType } from '../types/utils';

export interface StakeMoreScaIntentionData {
  amount: number;
  vescaKey?: string;
}

export class StakeMoreScaIntention extends CoreBaseIntention<StakeMoreScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeMoreSca;

  constructor(public readonly data: StakeMoreScaIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    await scallopClient.init();
    return scallopClient.stakeMoreSca(this.data.amount, this.data.vescaKey, input.account.address);
  }

  static fromData(data: StakeMoreScaIntentionData): StakeMoreScaIntention {
    return new StakeMoreScaIntention(data);
  }
}
