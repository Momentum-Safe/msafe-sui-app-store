import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { fromScallopTransaction } from '../../utils/transaction';
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
    return fromScallopTransaction(
      await input.scallopClient.depositCollateral(
        this.data.collateralCoinName,
        +this.data.amount,
        false,
        this.data.obligationId,
      ),
    );
  }

  static fromData(data: DepositCollateralIntentionData): DepositCollateralIntention {
    return new DepositCollateralIntention(data);
  }
}
