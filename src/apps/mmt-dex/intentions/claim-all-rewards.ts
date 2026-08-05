import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { ClaimAllRewardsIntentionData, TransactionSubType } from '../types';
import { claimV3Rewards } from '../utils/reward';
import { createMmtSdk, createVeMmtSdk } from '../utils/sdk';
import { claimVeMMTRewards } from '../utils/vemmt';

export class ClaimAllRewardsIntention extends BaseIntentionGrpc<ClaimAllRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimAllRewards;

  constructor(public override readonly data: ClaimAllRewardsIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
    const veMMTSdk = createVeMmtSdk(input.suiGrpcClient);
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
