import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BorrowWithReferralIntentionData {
  coinName: string;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
  veScaKey: string | undefined;
}

export class BorrowWithReferralIntention extends ScallopCoreBaseIntention<BorrowWithReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.BorrowWithReferral;

  constructor(public readonly data: BorrowWithReferralIntentionData) {
    super(data);
  }

  async borrowWithReferral(client: ScallopClient, data: BorrowWithReferralIntentionData, walletAddress?: string) {
    const { obligationId, obligationKey, veScaKey, coinName: poolCoinName, amount } = this.data;
    const txb = await this.buildTxWithRefreshObligation(
      client,
      {
        walletAddress,
        obligationId,
        obligationKey,
        veScaKey,
      },
      async (_, scallopTxBlock) => {
        const borrowReferral = scallopTxBlock.claimReferralTicket(poolCoinName);
        const coin = await scallopTxBlock.borrowWithReferralQuick(
          +amount,
          poolCoinName,
          borrowReferral,
          obligationId,
          obligationKey,
        );
        scallopTxBlock.burnReferralTicket(borrowReferral, poolCoinName);
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
    return this.borrowWithReferral(input.scallopClient, this.data, input.account.address);
  }

  static fromData(data: BorrowWithReferralIntentionData): BorrowWithReferralIntention {
    return new BorrowWithReferralIntention(data);
  }
}
