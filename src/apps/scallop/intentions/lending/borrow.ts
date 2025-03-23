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

  async borrow({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const { coinName, amount, obligationId, obligationKey } = this.data;
    const sender = account.address;
    const tx = await this.buildTxWithRefreshObligation(
      client,
      {
        walletAddress: sender,
        obligationId,
        obligationKey,
      },
      async (_, innerTx) => {
        const coin = await innerTx.borrowQuick(+amount, coinName, obligationId, obligationKey);
        innerTx.transferObjects([coin], sender);
      },
    );

    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.borrow(input);
  }

  static fromData(data: BorrowIntentionData): BorrowIntention {
    return new BorrowIntention(data);
  }
}
