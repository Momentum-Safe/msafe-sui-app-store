import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingIncreaseLiquidityTxb } from '../api/farming';
import { CetusIntentionData, TransactionSubType } from '../types';

export class FarmingIncreaseLiquidityIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.FarmingIncreaseLiquidity;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('FarmingIncreaseLiquidityIntention this.data: ', this.data);
    console.log('FarmingIncreaseLiquidityIntention txbParams: ', txbParams);
    const txb = await getFarmingIncreaseLiquidityTxb(txbParams, account, suiClient);
    console.log('FarmingIncreaseLiquidityIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingIncreaseLiquidityIntention(data);
  }
}
