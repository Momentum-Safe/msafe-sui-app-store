import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { claimReward } from '../api/incentiveV2';
import config from '../config';
import { CoinType, TransactionSubType, OptionType } from '../types';

export interface ClaimRewardIntentionData {
  coinType: CoinType;
  option: OptionType;
}

export class ClaimRewardIntention extends CoreBaseIntention<ClaimRewardIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimReward;

  constructor(public readonly data: ClaimRewardIntentionData) {
    super(data);
  }

  async build(): Promise<TransactionBlock> {
    const { coinType, option } = this.data;
    const tx = new TransactionBlock();

    const pool = config.pool[coinType];

    if (!pool) {
      throw new Error(`${coinType} not support, please use ${Object.keys(config.pool).join(', ')}.`);
    }

    if (!pool.fondPoolId) {
      throw new Error(`${coinType} not support claim reward.`);
    }

    return claimReward(tx, pool, option);
  }

  static fromData(data: ClaimRewardIntentionData) {
    return new ClaimRewardIntention(data);
  }
}
