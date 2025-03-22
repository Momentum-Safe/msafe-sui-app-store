import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

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

  async createReferralLink({
    account,
    scallopClient: client,
  }: {
    account: WalletAccount;
    scallopClient: ScallopClient;
  }) {
    const sender = account.address;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    const referralTicket = tx.mintEmptyVeSca();
    tx.transferObjects([referralTicket], sender);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.createReferralLink(input);
  }

  static fromData(data: CreateReferralLinkIntentionData): CreateReferralLinkIntention {
    return new CreateReferralLinkIntention(data);
  }
}
