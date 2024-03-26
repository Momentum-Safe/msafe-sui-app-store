import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../models/scallopClient';
import { TransactionSubType } from '../types/utils';

export interface WithdrawStakedScaIntentionData {
  vescaKey?: string;
}

export class WithdrawStakedScaIntention extends CoreBaseIntention<WithdrawStakedScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawStakedSca;

  constructor(public readonly data: WithdrawStakedScaIntentionData) {
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
    return scallopClient.withdrawUnlockedSca(this.data.vescaKey, input.account.address);
  }

  static fromData(data: WithdrawStakedScaIntentionData): WithdrawStakedScaIntention {
    return new WithdrawStakedScaIntention(data);
  }
}
