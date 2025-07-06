import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, UnstakeXSuiIntentionData } from '../types';
import { getUnstakeTxPayload } from '../utils/stake';
import { SuiClient } from '@mysten/sui/client';

export class UnstakeXSuiIntention extends BaseIntention<UnstakeXSuiIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnstakeXSui;

  constructor(public override readonly data: UnstakeXSuiIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const { params } = this.data;
    const { address, amount } = params;
    const tx = await getUnstakeTxPayload(input.suiClient, address, amount);
    return tx;
  }

  static fromData(data: UnstakeXSuiIntentionData) {
    return new UnstakeXSuiIntention(data);
  }
}
