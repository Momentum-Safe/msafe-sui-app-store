import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { TransactionSubType } from '../types/utils';

export interface ExtendStakeScaPeriodIntentionData {
  lockPeriodInDays: number; // max 1459 days
  vescaKey?: string;
}

export class ExtendStakeScaPeriodIntention extends CoreBaseIntention<ExtendStakeScaPeriodIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ExtendStakeScaPeriod;

  constructor(public readonly data: ExtendStakeScaPeriodIntentionData) {
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
    return scallopClient.extendStakeScaLockPeriod(
      this.data.lockPeriodInDays,
      this.data.vescaKey,
      input.account.address,
    );
  }

  static fromData(data: ExtendStakeScaPeriodIntentionData): ExtendStakeScaPeriodIntention {
    return new ExtendStakeScaPeriodIntention(data);
  }
}
