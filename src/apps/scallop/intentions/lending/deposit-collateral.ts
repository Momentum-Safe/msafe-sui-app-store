import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface DepositCollateralIntentionData {
  collateralCoinName: string;
  amount: number | string;
  obligationId: string;
}

export class DepositCollateralIntention extends ScallopCoreBaseIntention<DepositCollateralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.DepositCollateral;

  constructor(public readonly data: DepositCollateralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return input.scallopClient.depositCollateral(
      this.data.collateralCoinName,
      +this.data.amount,
      false,
      this.data.obligationId,
    );
  }

  static fromData(data: DepositCollateralIntentionData): DepositCollateralIntention {
    return new DepositCollateralIntention(data);
  }
}
