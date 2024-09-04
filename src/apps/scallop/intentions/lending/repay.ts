import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface RepayIntentionData {
  coinName: SupportPoolCoins;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
}

export class RepayIntention extends ScallopCoreBaseIntention<RepayIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Repay;

  constructor(public readonly data: RepayIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.repay(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      input.account.address,
    );
  }

  static fromData(data: RepayIntentionData): RepayIntention {
    return new RepayIntention(data);
  }
}
