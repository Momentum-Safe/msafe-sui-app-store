import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { ClaimRewardsIntentionData, TransactionSubType } from '../types';
import { claimV3Rewards } from '../utils/reward';
import { createMmtSdk } from '../utils/sdk';

export class ClaimRewardsIntention extends BaseIntentionGrpc<ClaimRewardsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRewards;

  constructor(public override readonly data: ClaimRewardsIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { address, position, pool } = params;
    const tx = new Transaction();

    claimV3Rewards(sdk, address, position, pool, tx);

    return tx;
  }

  static fromData(data: ClaimRewardsIntentionData) {
    return new ClaimRewardsIntention(data);
  }
}
