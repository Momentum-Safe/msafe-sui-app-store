import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BorrowWithBoostIntentionData {
  coinName: SupportPoolCoins;
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

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.borrowWithBoost(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowWithBoostIntentionData): BorrowWithBoostIntention {
    return new BorrowWithBoostIntention(data);
  }
}
