import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { ClaimRewardsAsIntentionData, TransactionSubType } from '../types';
import { claimRewardsAsTargetCoin } from '../utils/reward';
import { createMmtSdk, createVeMmtSdk } from '../utils/sdk';
import { claimVeMMTRewardsAsTargetCoin } from '../utils/vemmt';

export class ClaimRewardAsIntention extends BaseIntentionGrpc<ClaimRewardsAsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRewardsAs;

  constructor(public override readonly data: ClaimRewardsAsIntentionData) {
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
    const { claimVeMMTParams } = params;
    const { address, veMMTs, targetCoinType, slippage, claimRoutes, pools } = claimVeMMTParams;
    const txb = new Transaction();

    await Promise.all(
      params.claimParams.map((param) =>
        claimRewardsAsTargetCoin({
          ...param,
          sdk,
          txb,
        }),
      ),
    );

    await claimVeMMTRewardsAsTargetCoin(
      sdk,
      veMMTSdk,
      address,
      veMMTs,
      txb,
      targetCoinType,
      slippage,
      claimRoutes,
      pools,
    );

    return txb;
  }

  static fromData(data: ClaimRewardsAsIntentionData) {
    return new ClaimRewardAsIntention(data);
  }
}
