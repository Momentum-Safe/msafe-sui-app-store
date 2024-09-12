import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient as SuiClientLegacy } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { IdentifierString, SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { SuiNetworks } from '@/types';

// External interface to be use by msafe backend & sdk
//
// TODO: update to @mysten/sui after backend & sdk updated to @mysten/sui
export interface IAppHelper<T> {
  application: string;

  deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
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
    clientUrl: string;
    account: WalletAccount;
  }): Promise<TransactionBlock>;
}

export interface IAppHelperInternalLegacy<T> {
  application: string;
  supportSDK: '@mysten/sui.js';

  deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      suiClient: SuiClientLegacy;
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
    suiClient: SuiClientLegacy;
    account: WalletAccount;
  }): Promise<TransactionBlock>;
}

// interface for @mysten/sui package
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
}

export abstract class BaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClientLegacy;
    account: WalletAccount;
  }): Promise<TransactionBlock>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
