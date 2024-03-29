import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getXcetusClaimingStakeRewardsTxb } from '../api/xcetus';
import { CetusIntentionData, TransactionSubType } from '../types';

export class XcetusClaimingStakeRewardsIntention extends CoreBaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.xCETUSClaimStakingRwewards;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('XcetusClaimingStakeRewardsIntention this.data: ', this.data);
    console.log('XcetusClaimingStakeRewardsIntention txbParams: ', txbParams);
    const txb = await getXcetusClaimingStakeRewardsTxb(txbParams, account, suiClient);
    console.log('XcetusClaimingStakeRewardsIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new XcetusClaimingStakeRewardsIntention(data);
  }
}
