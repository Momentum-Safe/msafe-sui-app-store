import { TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { fromHex } from '@mysten/bcs';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { IAppHelperInternal, TransactionIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

export type PlainTransactionData = {
  content: string;
};

export const PlainTransactionApplication = 'msafe-plain-tx';
export const PlainTransactionType = TransactionSubTypes.others.plain;

export class PlainTransactionIntention implements TransactionIntention<PlainTransactionData> {
  application = PlainTransactionApplication;

  txType = TransactionType.Other;

  txSubType = PlainTransactionType;

  protected constructor(public readonly data: PlainTransactionData) {}

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    return Transaction.from(fromHex(this.data.content));
  }

  static fromData(data: PlainTransactionData) {
    return new PlainTransactionIntention(data);
  }
}

export class PlainTransactionHelper implements IAppHelperInternal<PlainTransactionData> {
  application: string;

  supportSDK = '@mysten/sui' as const;

  constructor() {
    this.application = PlainTransactionApplication;
  }

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext: {
      content: string;
    };
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: PlainTransactionData }> {
    const { content } = input.appContext;

    return {
      txType: TransactionType.Other,
      txSubType: PlainTransactionType,
      intentionData: { content },
    };
  }

  async build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: PlainTransactionData;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { suiClient, network, account } = input;
    const intention = PlainTransactionIntention.fromData(input.intentionData);
    console.log('🚀 ~ helper.ts:79 ~ PlainTransactionHelper ~ account:', account);
    return intention.build({ suiClient, network, account });
  }
}
