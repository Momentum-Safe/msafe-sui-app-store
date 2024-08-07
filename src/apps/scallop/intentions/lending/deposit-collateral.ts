import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { Scallop } from '../../models';
import { SupportCollateralCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface DepositCollateralIntentionData {
  collateralCoinName: SupportCollateralCoins;
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
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.depositCollateral(
      this.data.collateralCoinName,
      Number(this.data.amount),
      this.data.obligationId,
      input.account.address,
    );
  }

  static fromData(data: DepositCollateralIntentionData): DepositCollateralIntention {
    return new DepositCollateralIntention(data);
  }
}
