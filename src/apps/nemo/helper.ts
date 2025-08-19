import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';

import { DepositVaultIntention, WithdrawVaultIntention } from './intentions';
import {
  TransactionSubType,
  NemoIntentionData,
  SuiNetworks,
  DepositVaultIntentionData,
  WithdrawVaultIntentionData,
} from './types';

export type NemoIntention = DepositVaultIntention | WithdrawVaultIntention;

export class NemoHelper implements IAppHelperInternal<NemoIntentionData> {
  application = 'nemo';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: any;
  }> {
    const isDeposit = input.transaction.blockData.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.toString().toLowerCase().includes('deposit::deposit_non_entry'),
    );
    const isWithdraw = input.transaction.blockData.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.toString().toLowerCase().includes('withdraw::withdraw'),
    );
    if (isDeposit) {
      return {
        txType: TransactionType.Other,
        txSubType: TransactionSubType.VaultDeposit,
        intentionData: input.appContext,
      };
    }
    if (isWithdraw) {
      return {
        txType: TransactionType.Other,
        txSubType: TransactionSubType.VaultWithdraw,
        intentionData: input.appContext,
      };
    }
  }

  async build(input: {
    intentionData: NemoIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account } = input;

    console.log(input.txSubType);
    let intention: NemoIntention;
    switch (input.txSubType) {
      case TransactionSubType.VaultDeposit:
        intention = DepositVaultIntention.fromData(input.intentionData as DepositVaultIntentionData);
        break;

      case TransactionSubType.VaultWithdraw:
        intention = WithdrawVaultIntention.fromData(input.intentionData as WithdrawVaultIntentionData);
        break;

      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
