import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';

import { SuiNetworks, TransactionSubType } from '../../types/utils';
import { fromScallopTransaction } from '../../utils/transaction';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawLendingIntentionData {
  amount: string | number;
  coinName: string;
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
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return fromScallopTransaction(
      await input.scallopClient.withdraw(this.data.coinName, Number(this.data.amount), false, input.account.address),
    );
  }

  static fromData(data: WithdrawLendingIntentionData): WithdrawLendingIntention {
    return new WithdrawLendingIntention(data);
  }
}
