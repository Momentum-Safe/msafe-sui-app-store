import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { fromScallopTransaction } from '../../utils/transaction';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawCollateralIntentionData {
  collateralCoinName: string;
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
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return fromScallopTransaction(
      await input.scallopClient.withdrawCollateral(
        this.data.collateralCoinName,
        Number(this.data.amount),
        false,
        this.data.obligationId,
        this.data.obligationKey,
        input.account.address,
      ),
    );
  }

  static fromData(data: WithdrawCollateralIntentionData): WithdrawCollateralIntention {
    return new WithdrawCollateralIntention(data);
  }
}
