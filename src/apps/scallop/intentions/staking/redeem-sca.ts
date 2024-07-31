import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface RedeemScaIntentionData {
  veScaKey: string;
}

export class RedeemScaIntention extends ScallopCoreBaseIntention<RedeemScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RedeemSca;

  constructor(public readonly data: RedeemScaIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.redeemSca(this.data.veScaKey);
  }

  static fromData(data: RedeemScaIntentionData): RedeemScaIntention {
    return new RedeemScaIntention(data);
  }
}
