import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { Scallop } from '../../models';
import { SupportAssetCoins, SupportPoolCoins } from '../../types';
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
  }): Promise<TransactionBlock> {
    return input.scallop.client.withdraw(
      this.data.coinName as SupportPoolCoins,
      Number(this.data.amount),
      input.account.address,
    );
  }

  static fromData(data: WithdrawLendingIntentionData): WithdrawLendingIntention {
    return new WithdrawLendingIntention(data);
  }
}
