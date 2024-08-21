import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/sui3-utils';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { IotaClient } from '@iota/iota-sdk/dist/cjs/client';
import { buildObjectTransferTxb } from './utils';

export interface ObjectTransferIntentionData {
  receiver: string;
  objectType: string;
  objectId: string;
}

export class ObjectTransferIntention extends CoreBaseIntention<ObjectTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'SendObject';

  constructor(public readonly data: ObjectTransferIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { client, account } = input;
    return buildObjectTransferTxb(client, this.data, account.address);
  }

  static fromData(data: ObjectTransferIntentionData) {
    return new ObjectTransferIntention(data);
  }
}
