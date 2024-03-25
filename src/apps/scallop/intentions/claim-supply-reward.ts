import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportStakeMarketCoins } from '../types';
import { TransactionSubType } from '../types/utils';

export interface ClaimSupplyRewardIntentionData {
  coinName: SupportStakeMarketCoins;
}

export class ClaimSupplyRewardIntention extends CoreBaseIntention<ClaimSupplyRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimSupplyReward;

  constructor(public readonly data: ClaimSupplyRewardIntentionData) {
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
    return scallopClient.claim(this.data.coinName);
  }

  static fromData(data: ClaimSupplyRewardIntentionData): ClaimSupplyRewardIntention {
    return new ClaimSupplyRewardIntention(data);
  }
}
