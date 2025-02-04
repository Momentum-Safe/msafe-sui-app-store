import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { prixConfig } from '../config';
import { PrixClaimIntentionData, SuiNetworks, TransactionSubType } from '../types';

export class PrixClaimIntention extends BaseIntentionLegacy<PrixClaimIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.PrixClaim;

  constructor(public override readonly data: PrixClaimIntentionData) {
    super(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
