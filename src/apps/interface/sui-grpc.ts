// interface for @mysten/sui/grpc package (v2 gRPC client)
import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { SuiNetworks } from '@/types';

export interface IAppHelperInternalGrpc<T> {
  application: string;
  supportSDK: '@mysten/sui-v2';

  deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    appContext?: any;
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
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction>;
}

export interface TransactionIntentionGrpc<D> {
  txType: TransactionType;
  txSubType: string;
  data: D;

  serialize(): string;

  build(input: { suiGrpcClient: SuiGrpcClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction>;
}

export abstract class BaseIntentionGrpc<D> implements TransactionIntentionGrpc<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
