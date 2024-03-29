import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingBatchHarvest } from '../api/farming';
import { CetusIntentionData, TransactionSubType } from '../types';

export class FarmingHarvestIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.FarmingHarvest;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('FarmingHarvestIntention this.data: ', this.data);
    console.log('FarmingHarvestIntention txbParams: ', txbParams);
    const txb = await getFarmingBatchHarvest(txbParams, account, suiClient);
    console.log('FarmingHarvestIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingHarvestIntention(data);
  }
}
