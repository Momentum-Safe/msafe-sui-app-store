import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { StreamTransactionType } from './types/decode';

export interface ClaimByProxyStreamIntentionData {
  streamId: string;
}

export class ClaimByProxyStreamIntention extends CoreBaseIntention<ClaimByProxyStreamIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.CLAIM;

  constructor(public readonly data: ClaimByProxyStreamIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    return new TransactionBlock();
  }

  static fromData(data: ClaimByProxyStreamIntentionData) {
    return new ClaimByProxyStreamIntention(data);
  }
}
