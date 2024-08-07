import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface BindReferralIntentionData {
  veScaKey: string;
}

export class BindReferralIntention extends ScallopCoreBaseIntention<BindReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.BindReferral;

  constructor(public readonly data: BindReferralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.bindReferral(this.data.veScaKey);
  }

  static fromData(data: BindReferralIntentionData): BindReferralIntention {
    return new BindReferralIntention(data);
  }
}
