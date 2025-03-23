import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

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

  async redeemSca({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const { veScaKey } = this.data;
    const sender = account.address;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    await tx.redeemScaQuick(veScaKey);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.redeemSca(input);
  }

  static fromData(data: RedeemScaIntentionData): RedeemScaIntention {
    return new RedeemScaIntention(data);
  }
}
