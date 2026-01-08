import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { ClaimAllRewardsIntentionData, TransactionSubType } from '../types';
import { claimV3Rewards } from '../utils/reward';
import { claimVeMMTRewards } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class ClaimAllRewardsIntention extends BaseIntention<ClaimAllRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimAllRewards;

  constructor(public override readonly data: ClaimAllRewardsIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
    const { params } = this.data;
    const { address, positions, pools, veMMTs } = params;
    const tx = new Transaction();

    // eslint-disable-next-line no-restricted-syntax
    for (const position of positions) {
      const pool = pools.find((v3Pool) => v3Pool.poolId === position.poolId);
      if (pool) {
        claimV3Rewards(sdk, address, position, pool, tx);
      }
    }

    await claimVeMMTRewards(veMMTSdk, address, veMMTs, tx);

    return tx;
  }

  static fromData(data: ClaimAllRewardsIntentionData) {
    return new ClaimAllRewardsIntention(data);
  }
}
