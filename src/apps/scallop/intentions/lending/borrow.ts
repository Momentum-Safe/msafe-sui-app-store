import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

export interface BorrowIntentionData {
  coinName: SupportPoolCoins;
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
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.borrow(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowIntentionData): BorrowIntention {
    return new BorrowIntention(data);
  }
}
