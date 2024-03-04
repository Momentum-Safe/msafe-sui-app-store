import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { StreamTransactionType } from './types/decode';

export interface ClaimStreamIntentionData {
  streamId: string;
}

export class ClaimStreamIntention extends CoreBaseIntention<ClaimStreamIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.CLAIM;

  constructor(public readonly data: ClaimStreamIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    return new TransactionBlock();
  }

  static fromData(data: ClaimStreamIntentionData) {
    return new ClaimStreamIntention(data);
  }
}
