import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { claimReward } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType, OptionType } from '../types';

export interface ClaimRewardIntentionData {
  claims: {
    coinType: CoinType;
    option: OptionType;
    typeArguments: string[];
  }[];
}

export class ClaimRewardIntention extends CoreBaseIntention<ClaimRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimReward;

  constructor(public readonly data: ClaimRewardIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    const { claims } = this.data;
    const tx = new TransactionBlock();

    claims.forEach((claim) => {
      const { coinType, option, typeArguments } = claim;
      const pool = config.pool[coinType];
      console.log('build', this.data);

      if (!pool) {
        throw new Error(`${coinType} not support, please use ${Object.keys(config.pool).join(', ')}.`);
      }

      if (!pool.fondPoolId) {
        throw new Error(`${coinType} not support claim reward.`);
      }

      claimReward(tx, pool, option, typeArguments);
    });

    return tx;
  }

  static fromData(data: ClaimRewardIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
