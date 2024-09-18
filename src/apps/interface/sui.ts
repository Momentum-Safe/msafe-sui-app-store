// interface for @mysten/sui package
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { SuiNetworks } from '@/types';

export interface IAppHelperInternal<T> {
  application: string;
  supportSDK: '@mysten/sui';

  deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<{
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

  build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction>;
}

export abstract class BaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
