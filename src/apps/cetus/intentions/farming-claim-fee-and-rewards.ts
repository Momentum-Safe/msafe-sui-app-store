import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingClaimFeeAndRewardTxb } from '../api/farming';
import { CetusIntentionData, TransactionSubType } from '../types';

export class FarmingClaimFeeAndRewardIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.FarmingClaimFeeAndReward;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('FarmingClaimFeeAndRewardIntention this.data: ', this.data);
    console.log('FarmingClaimFeeAndRewardIntention txbParams: ', txbParams);
    const txb = await getFarmingClaimFeeAndRewardTxb(txbParams, account, suiClient);
    console.log('FarmingClaimFeeAndRewardIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingClaimFeeAndRewardIntention(data);
  }
}
