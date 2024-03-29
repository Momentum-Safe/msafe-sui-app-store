import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getClaimFeeAndMiningTxb } from '../api/position';
import { CetusIntentionData, TransactionSubType } from '../types';

export class ClaimFeeAndMiningIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimFeeAndMining;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('ClaimFeeAndMiningIntention this.data: ', this.data);
    console.log('ClaimFeeAndMiningIntention txbParams: ', txbParams);
    const txb = await getClaimFeeAndMiningTxb(txbParams, account, suiClient);
    console.log('ClaimFeeAndMiningIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new ClaimFeeAndMiningIntention(data);
  }
}
