import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { prixConfig } from '../config';
import { PrixJoinIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class PrixJoinIntention extends BaseIntention<PrixJoinIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixJoin;

  constructor(public override readonly data: PrixJoinIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const txb = new Transaction();
    txb.moveCall({
      target: `${prixConfig.PackageId}::claim::join`,
      typeArguments: [prixConfig.turbosCoinType],
      arguments: [txb.object(prixConfig.Claim)],
    });
    return txb;
  }

  static fromData(data: PrixJoinIntentionData) {
    return new PrixJoinIntention(data);
  }
}
