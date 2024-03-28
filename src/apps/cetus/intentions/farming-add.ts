import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/dist/cjs/builder';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingAddLiquidityTxb } from '../api/farming';
import { CetusIntentionData, TransactionSubType } from '../types';

export class FarmingAddLiquidityIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.FarmingOpenAndAddLiquidity;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    const txb = await getFarmingAddLiquidityTxb(txbParams, account, suiClient);
    console.log('FarmingAddLiquidityIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingAddLiquidityIntention(data);
  }
}
