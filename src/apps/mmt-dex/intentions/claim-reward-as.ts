import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { ClaimRewardsAsIntentionData, TransactionSubType } from '../types';
import { claimRewardsAsTargetCoin } from '../utils/reward';
import { claimVeMMTRewardsAsTargetCoin } from '../utils/vemmt';

enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export class ClaimRewardAsIntention extends BaseIntention<ClaimRewardsAsIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimRewardsAs;

  constructor(public override readonly data: ClaimRewardsAsIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient }): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const veMMTSdk = new VeMMT(input.suiClient, Network.Mainnet);
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
