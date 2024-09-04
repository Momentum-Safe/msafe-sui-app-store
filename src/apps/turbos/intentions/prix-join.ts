import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { prixConfig } from '../config';

export interface PrixJoinIntentionData {}

export class PrixJoinIntention extends CoreBaseIntention<PrixJoinIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixJoin;

  constructor(public override readonly data: PrixJoinIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
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
