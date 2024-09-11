import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface RepayWithBoostIntentionData {
  coinName: SupportPoolCoins;
  amount: number | string;
  obligationId: string;
  veScaKey: string;
}

export class RepayWithBoostIntention extends ScallopCoreBaseIntention<RepayWithBoostIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RepayWithBoost;

  constructor(public readonly data: RepayWithBoostIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.repayWithBoost(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: RepayWithBoostIntentionData): RepayWithBoostIntention {
    return new RepayWithBoostIntention(data);
  }
}
