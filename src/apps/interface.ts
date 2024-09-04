import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { SuiNetworks } from '@/types';

export interface MSafeAppHelper<T> {
  application: string;
  deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      suiClient: SuiClient;
      account: WalletAccount;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
  }>;
  build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction>;
}

export interface TransactionIntention<D> {
  txType: TransactionType;
  txSubType: string;
  data: D;
  serialize(): string;
}

export abstract class BaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
