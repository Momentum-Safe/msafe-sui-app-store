import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';

import { prixConfig } from '../config';
import { PrixClaimIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class PrixClaimIntention extends BaseIntentionGrpc<PrixClaimIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixClaim;

  constructor(public override readonly data: PrixClaimIntentionData) {
    super(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const txb = new Transaction();
    txb.moveCall({
      target: `${prixConfig.PackageId}::claim::claim`,
      typeArguments: [prixConfig.turbosCoinType],
      arguments: [txb.object(prixConfig.Claim), txb.object(SUI_CLOCK_OBJECT_ID)],
    });
    return txb;
  }

  static fromData(data: PrixClaimIntentionData) {
    return new PrixClaimIntention(data);
  }
}
