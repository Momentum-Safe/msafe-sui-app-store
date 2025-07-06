import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { StakeXSuiIntentionData, TransactionSubType } from '../types';
import { getStakeTxPayload } from '../utils/stake';
import { SuiClient } from '@mysten/sui/client';

export class StakeXSuiIntention extends BaseIntention<StakeXSuiIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeXSui;

  constructor(public override readonly data: StakeXSuiIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const { params } = this.data;
    const { address, amount } = params;
    const tx = await getStakeTxPayload(input.suiClient, address, amount);

    return tx;
  }

  static fromData(data: StakeXSuiIntentionData) {
    return new StakeXSuiIntention(data);
  }
}
