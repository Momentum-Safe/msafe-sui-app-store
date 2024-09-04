import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { Scallop } from '../../models';
import { SupportAssetCoins } from '../../types';
import { SuiNetworks, TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawLendingIntentionData {
  amount: string | number;
  coinName: SupportAssetCoins;
}

export class WithdrawLendingIntention extends ScallopCoreBaseIntention<WithdrawLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawLending;

  constructor(public readonly data: WithdrawLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.withdraw(this.data.coinName, Number(this.data.amount), input.account.address);
  }

  static fromData(data: WithdrawLendingIntentionData): WithdrawLendingIntention {
    return new WithdrawLendingIntention(data);
  }
}
