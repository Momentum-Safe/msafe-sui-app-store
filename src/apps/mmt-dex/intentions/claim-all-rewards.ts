import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { ClaimAllRewardsIntentionData, TransactionSubType } from '../types';
import { claimV3Rewards } from '../utils/reward';

export class ClaimAllRewardsIntention extends BaseIntention<ClaimAllRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimAllRewards;

  constructor(public override readonly data: ClaimAllRewardsIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, positions, pools } = params;
    const tx = new Transaction();

    // eslint-disable-next-line no-restricted-syntax
    for (const position of positions) {
      const pool = pools.find((v3Pool) => v3Pool.objectId === position.poolId);
      claimV3Rewards(sdk, address, position, pool, tx);
    }

    return tx;
  }

  static fromData(data: ClaimAllRewardsIntentionData) {
    return new ClaimAllRewardsIntention(data);
  }
}
