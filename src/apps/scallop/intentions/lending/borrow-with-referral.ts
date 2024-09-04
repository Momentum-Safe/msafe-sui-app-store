import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BorrowWithReferralIntentionData {
  coinName: SupportPoolCoins;
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

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.borrowWithReferral(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowWithReferralIntentionData): BorrowWithReferralIntention {
    return new BorrowWithReferralIntention(data);
  }
}
