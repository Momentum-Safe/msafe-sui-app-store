import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import { getFarmingIncreaseLiquidityTxb } from '../api/farming';
import { CetusIntentionData, TransactionSubType, SuiNetworks } from '../types';

export class FarmingIncreaseLiquidityIntention extends CoreBaseIntention<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.FarmingIncreaseLiquidity;

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
    const txb = await getFarmingIncreaseLiquidityTxb(txbParams, account, network);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingIncreaseLiquidityIntention(data);
  }
}
