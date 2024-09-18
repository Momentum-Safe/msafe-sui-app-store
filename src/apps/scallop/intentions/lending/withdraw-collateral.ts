import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportCollateralCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawCollateralIntentionData {
  collateralCoinName: SupportCollateralCoins;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
}

export class WithdrawCollateralIntention extends ScallopCoreBaseIntention<WithdrawCollateralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawCollateral;

  constructor(public readonly data: WithdrawCollateralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.withdrawCollateral(
      this.data.collateralCoinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      input.account.address,
    );
  }

  static fromData(data: WithdrawCollateralIntentionData): WithdrawCollateralIntention {
    return new WithdrawCollateralIntention(data);
  }
}
