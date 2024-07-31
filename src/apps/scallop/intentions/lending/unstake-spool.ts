import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { SupportStakeMarketCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

export interface UnstakeSpoolIntentionData {
  amount: number | string;
  marketCoinName: SupportStakeMarketCoins;
  stakeAccountId: string | null;
}

export class UnstakeSpoolIntention extends ScallopCoreBaseIntention<UnstakeSpoolIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnstakeSpool;

  constructor(public readonly data: UnstakeSpoolIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.unstake(
      this.data.marketCoinName,
      Number(this.data.amount),
      undefined,
      input.account.address,
    );
  }

  static fromData(data: UnstakeSpoolIntentionData): UnstakeSpoolIntention {
    return new UnstakeSpoolIntention(data);
  }
}
