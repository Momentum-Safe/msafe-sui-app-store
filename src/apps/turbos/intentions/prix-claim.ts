import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { prixConfig } from '../config';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

export interface PrixClaimIntentionData {}

export class PrixClaimIntention extends CoreBaseIntention<PrixClaimIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixClaim;

  constructor(public override readonly data: PrixClaimIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const txb = new TransactionBlock();
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
