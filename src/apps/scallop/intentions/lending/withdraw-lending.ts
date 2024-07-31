import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { ScallopClient } from '../../models/scallopClient';
import { NetworkType, SupportAssetCoins } from '../../types';
import { SuiNetworks, TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

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
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    
    return scallopClient.withdraw(this.data.coinName, Number(this.data.amount), input.account.address);
  }

  static fromData(data: WithdrawLendingIntentionData): WithdrawLendingIntention {
    return new WithdrawLendingIntention(data);
  }
}
