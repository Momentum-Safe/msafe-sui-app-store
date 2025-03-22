/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface SupplyLendingIntentionData {
  amount: number | string;
  coinName: string;
}

export class SupplyLendingIntention extends ScallopCoreBaseIntention<SupplyLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyLending;

  constructor(public readonly data: SupplyLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return input.scallopClient.deposit(this.data.coinName, +this.data.amount, false);
  }

  static fromData(data: SupplyLendingIntentionData): SupplyLendingIntention {
    return new SupplyLendingIntention(data);
  }
}
