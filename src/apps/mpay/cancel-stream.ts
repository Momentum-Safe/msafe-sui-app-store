import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { StreamTransactionType } from './types/decode';

export interface CancelStreamIntentionData {
  streamId: string;
}

export class CancelStreamIntention extends CoreBaseIntention<CancelStreamIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.CANCEL;

  constructor(public readonly data: CancelStreamIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    return new TransactionBlock();
  }

  static fromData(data: CancelStreamIntentionData) {
    return new CancelStreamIntention(data);
  }
}
