import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { ScallopClient } from '../models/scallopClient';
import { NetworkType, SupportAssetCoins } from '../types';
import { SuiNetworks, TransactionSubType } from '../types/utils';

export interface WithdrawLendingIntentionData {
  amount: string | number;
  coinName: SupportAssetCoins;
}

export class WithdrawLendingIntention extends CoreBaseIntention<WithdrawLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawLending;

  constructor(public readonly data: WithdrawLendingIntentionData) {
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
    return scallopClient.withdraw(this.data.coinName, Number(this.data.amount), input.account.address);
  }

  static fromData(data: WithdrawLendingIntentionData): WithdrawLendingIntention {
    return new WithdrawLendingIntention(data);
  }
}
