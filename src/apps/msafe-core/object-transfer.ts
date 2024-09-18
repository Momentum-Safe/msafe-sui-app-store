import { TransactionType, buildObjectTransferTxb } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

export interface ObjectTransferIntentionData {
  receiver: string;
  objectType: string;
  objectId: string;
}

export class ObjectTransferIntention extends BaseIntentionLegacy<ObjectTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'SendObject';

  constructor(public readonly data: ObjectTransferIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    return buildObjectTransferTxb(suiClient, this.data, account.address);
  }

  static fromData(data: ObjectTransferIntentionData) {
    return new ObjectTransferIntention(data);
  }
}
