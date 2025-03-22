import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BorrowIntentionData {
  coinName: string;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
}

export class BorrowIntention extends ScallopCoreBaseIntention<BorrowIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Borrow;

  constructor(public readonly data: BorrowIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    const { coinName, amount, obligationId, obligationKey } = this.data;
    return input.scallopClient.borrow(
      coinName,
      Number(amount),
      false,
      obligationId,
      obligationKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowIntentionData): BorrowIntention {
    return new BorrowIntention(data);
  }
}
