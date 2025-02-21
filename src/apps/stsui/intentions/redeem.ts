import { LST, LstParams } from '@alphafi/stsui-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { RedeemIntentionData, TransactionSubType } from '../types';

export class RedeemIntention extends BaseIntention<RedeemIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.REDEEM;

  constructor(public readonly data: RedeemIntentionData) {
    super(data);
  }

  async build(input: { account: WalletAccount }): Promise<Transaction> {
    const { account } = input;
    const { amount } = this.data;
    const lstParams: LstParams = {
      lstInfo: '0x1adb343ab351458e151bc392fbf1558b3332467f23bda45ae67cd355a57fd5f5',
      lstCointype: '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
    };
    const lst = new LST(lstParams);
    const txb = await lst.redeem(amount, account.address);
    txb.setGasBudget(100_000_000);
    return txb;
  }

  static fromData(data: RedeemIntentionData) {
    console.log('RedeemIntention.fromData', data);
    return new RedeemIntention(data);
  }
}
