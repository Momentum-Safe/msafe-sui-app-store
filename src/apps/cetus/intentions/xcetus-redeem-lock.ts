import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getXcetusRedeemLockTxb } from '../api/xcetus';
import { CetusIntentionData, TransactionSubType } from '../types';

export class XcetusRedeemLockIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.xCETUSRedeemLock;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account, suiClient } = input;
    const { txbParams } = this.data;
    console.log('XcetusRedeemLockIntention this.data: ', this.data);
    console.log('XcetusRedeemLockIntention txbParams: ', txbParams);
    const txb = await getXcetusRedeemLockTxb(txbParams, account, suiClient);
    console.log('XcetusRedeemLockIntention build txb: ', txb);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new XcetusRedeemLockIntention(data);
  }
}
