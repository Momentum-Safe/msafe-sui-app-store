import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import { getVestingRedeemTxb } from '../api/vesting';
import { CetusIntentionData, TransactionSubType, SuiNetworks } from '../types';

export class VestingRedeemIntention extends BaseIntentionLegacy<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.VestingRedeem;

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { account, network } = input;
    const { txbParams } = this.data;
    const txb = await getVestingRedeemTxb(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new VestingRedeemIntention(data);
  }
}
