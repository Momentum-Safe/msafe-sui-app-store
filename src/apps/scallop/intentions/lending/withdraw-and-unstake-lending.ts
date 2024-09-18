/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportAssetCoins, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawAndUnstakeLendingIntentionData {
  amount: number | undefined;
  coinName: SupportAssetCoins;
  stakeAccountId: { id: string; coin: number }[];
}

export class WithdrawAndUnstakeLendingIntention extends ScallopCoreBaseIntention<WithdrawAndUnstakeLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawAndUnstakeLending;

  constructor(public readonly data: WithdrawAndUnstakeLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.unstakeAndWithdraw(
      this.data.coinName,
      Number(this.data.amount),
      this.data.stakeAccountId,
    );
  }

  static fromData(data: WithdrawAndUnstakeLendingIntentionData): WithdrawAndUnstakeLendingIntention {
    return new WithdrawAndUnstakeLendingIntention(data);
  }
}
