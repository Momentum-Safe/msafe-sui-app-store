import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BorrowWithBoostIntentionData {
  coinName: string;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
  veScaKey: string;
}

export class BorrowWithBoostIntention extends ScallopCoreBaseIntention<BorrowWithBoostIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Borrow;

  constructor(public readonly data: BorrowWithBoostIntentionData) {
    super(data);
  }

  public async borrowWithBoost(client: ScallopClient, walletAddress: string): Promise<Transaction> {
    const { obligationId, obligationKey, veScaKey, amount, coinName: poolCoinName } = this.data;
    const txb = await this.buildTxWithRefreshObligation(
      client,
      {
        walletAddress,
        obligationId,
        obligationKey,
        veScaKey,
      },
      async (_, scallopTxBlock) => {
        const coin = await scallopTxBlock.borrowQuick(+amount, poolCoinName, obligationId, obligationKey);
        scallopTxBlock.transferObjects([coin], walletAddress);
      },
    );
    return txb.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.borrowWithBoost(input.scallopClient, input.account.address);
  }

  static fromData(data: BorrowWithBoostIntentionData): BorrowWithBoostIntention {
    return new BorrowWithBoostIntention(data);
  }
}
