import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { StreamTransactionType } from './types/decode';

export interface SetAutoClaimIntentionData {
  streamId: string;
  enabled: boolean;
}

export class SetAutoClaimStreamIntention extends CoreBaseIntention<SetAutoClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.SET_AUTO_CLAIM;

  constructor(public readonly data: SetAutoClaimIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    return new TransactionBlock();
  }

  static fromData(data: SetAutoClaimIntentionData) {
    return new SetAutoClaimStreamIntention(data);
  }
}
