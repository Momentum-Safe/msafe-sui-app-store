import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { SuiNetworks } from '@/types';

export interface IAppHelperInternalLegacy<T> {
  application: string;
  supportSDK: '@mysten/sui.js';

  deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      suiClient: SuiClient;
      account: WalletAccount;
      appContext?: any;
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
  }): Promise<TransactionBlock>;
}

export interface TransactionIntentionLegacy<D> {
  txType: TransactionType;
  txSubType: string;
  data: D;

  serialize(): string;

  build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<TransactionBlock>;
}

export abstract class BaseIntentionLegacy<D> implements TransactionIntentionLegacy<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }

  abstract build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock>;
}
