import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getXcetusRedeemTxb } from '../api/xcetus';
import { CetusIntentionData, TransactionSubType } from '../types';

export class XcetusRedeemIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.xCETUSRedeem;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    const txb = await getXcetusRedeemTxb(txbParams, account, suiClient);
    console.log('XcetusRedeemIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new XcetusRedeemIntention(data);
  }
}
