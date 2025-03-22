import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface RepayIntentionData {
  coinName: string;
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

  async repay({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const { coinName, amount, obligationId, obligationKey } = this.data;

    const tx = await this.buildTxWithRefreshObligation(
      client,
      {
        walletAddress: sender,
        obligationId,
        obligationKey,
      },
      async (_, innerTx) => {
        await innerTx.repayQuick(+amount, coinName, obligationId);
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
    return input.scallopClient.repay(
      this.data.coinName,
      +this.data.amount,
      false,
      this.data.obligationId,
      this.data.obligationKey,
    );
  }

  static fromData(data: RepayIntentionData): RepayIntention {
    return new RepayIntention(data);
  }
}
