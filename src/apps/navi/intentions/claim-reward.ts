import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { claimReward } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType, OptionType } from '../types';

export interface ClaimRewardIntentionData {
  claims: {
    coinType: CoinType;
    option: OptionType;
    poolId: string;
    assetId: number;
    typeArguments: string[];
  }[];
}

export class ClaimRewardIntention extends CoreBaseIntention<ClaimRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimReward;

  constructor(public readonly data: ClaimRewardIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const { claims } = this.data;
    const tx = new Transaction();

    claims.forEach((claim) => {
      const { assetId, poolId, option, typeArguments } = claim;

      claimReward(tx, assetId, poolId, option, typeArguments);
    });

    return tx;
  }

  static fromData(data: ClaimRewardIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
