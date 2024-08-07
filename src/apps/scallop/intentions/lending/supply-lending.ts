/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportAssetCoins, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface SupplyLendingIntentionData {
  amount: number | string;
  coinName: SupportAssetCoins;
}

export class SupplyLendingIntention extends ScallopCoreBaseIntention<SupplyLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyLending;

  constructor(public readonly data: SupplyLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.deposit(this.data.coinName, Number(this.data.amount), input.account.address);
  }

  static fromData(data: SupplyLendingIntentionData): SupplyLendingIntention {
    return new SupplyLendingIntention(data);
  }
}
