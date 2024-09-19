import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { getXcetusClaimingStakeRewardsTxb } from '../api/xcetus';
import { CetusIntentionData, TransactionSubType } from '../types';

export class XcetusClaimingStakeRewardsIntention extends BaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.xCETUSClaimStakingRwewards;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getXcetusClaimingStakeRewardsTxb(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new XcetusClaimingStakeRewardsIntention(data);
  }
}
