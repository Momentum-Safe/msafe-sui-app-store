import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { claimReward } from '../api/incentiveV2';
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

  async build(): Promise<TransactionBlock> {
    const { claims } = this.data;
    const tx = new TransactionBlock();

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
