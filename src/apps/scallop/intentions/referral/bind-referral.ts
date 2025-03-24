import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

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

  async bindReferral({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const tx = client.builder.createTxBlock();
    tx.setSender(sender);
    tx.bindToReferral(this.data.veScaKey);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.bindReferral(input);
  }

  static fromData(data: BindReferralIntentionData): BindReferralIntention {
    return new BindReferralIntention(data);
  }
}
