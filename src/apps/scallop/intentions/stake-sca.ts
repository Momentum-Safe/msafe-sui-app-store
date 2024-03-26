import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { TransactionSubType } from '../types/utils';

export interface StakeScaIntentionData {
  amount: number;
  lockPeriodInDays: number; // max 1459 days
}

export class StakeScaIntention extends CoreBaseIntention<StakeScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeSca;

  constructor(public readonly data: StakeScaIntentionData) {
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
    return scallopClient.stakeSca(this.data.amount, this.data.lockPeriodInDays, input.account.address);
  }

  static fromData(data: StakeScaIntentionData): StakeScaIntention {
    return new StakeScaIntention(data);
  }
}
