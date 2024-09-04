import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportStakeMarketCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface StakeSpoolIntentionData {
  amount: number | string;
  marketCoinName: SupportStakeMarketCoins;
  stakeAccountId?: string | null;
}

export class StakeSpoolIntention extends ScallopCoreBaseIntention<StakeSpoolIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeSpool;

  constructor(public readonly data: StakeSpoolIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.stake(
      this.data.marketCoinName,
      Number(this.data.amount),
      undefined,
      input.account.address,
    );
  }

  static fromData(data: StakeSpoolIntentionData): StakeSpoolIntention {
    return new StakeSpoolIntention(data);
  }
}
