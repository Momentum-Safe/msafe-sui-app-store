import { TransactionType, buildObjectTransferTxb } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface ObjectTransferIntentionData {
  receiver: string;
  objectType: string;
  objectId: string;
}

export class ObjectTransferIntention extends CoreBaseIntention<ObjectTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'object-transfer';

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
