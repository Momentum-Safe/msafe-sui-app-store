import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateReferralLinkIntentionData {}

export class CreateReferralLinkIntention extends ScallopCoreBaseIntention<CreateReferralLinkIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.CreateReferralLink;

  constructor(public readonly data: CreateReferralLinkIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<Transaction> {
    return input.scallop.client.createReferralLink();
  }

  static fromData(data: CreateReferralLinkIntentionData): CreateReferralLinkIntention {
    return new CreateReferralLinkIntention(data);
  }
}
