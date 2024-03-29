import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getRemoveLiquidityTxb } from '../api/position';
import { CetusIntentionData, TransactionSubType } from '../types';

export class RemoveLiquidityIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RemoveLiquidity;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('RemoveLiquidityIntention this.data: ', this.data);
    console.log('RemoveLiquidityIntention txbParams: ', txbParams);
    const txb = await getRemoveLiquidityTxb(txbParams, account, suiClient);
    console.log('RemoveLiquidityIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
