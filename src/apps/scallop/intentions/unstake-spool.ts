import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { SupportStakeMarketCoins } from '../types';
import { TransactionSubType } from '../types/utils';

export interface UnstakeSpoolIntentionData {
  amount: number | string;
  marketCoinName: SupportStakeMarketCoins;
  stakeAccountId: string | null;
}

export class UnstakeSpoolIntention extends CoreBaseIntention<UnstakeSpoolIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnstakeSpool;

  constructor(public readonly data: UnstakeSpoolIntentionData) {
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
    scallopClient.init();
    return scallopClient.unstake(this.data.marketCoinName, Number(this.data.amount), undefined, input.account.address);
  }

  static fromData(data: UnstakeSpoolIntentionData): UnstakeSpoolIntention {
    return new UnstakeSpoolIntention(data);
  }
}
