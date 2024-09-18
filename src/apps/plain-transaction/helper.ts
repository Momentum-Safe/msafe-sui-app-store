import { TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { fromHEX, toHEX } from '@mysten/bcs';
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
    return Transaction.from(fromHEX(this.data.content));
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
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: PlainTransactionData }> {
    const { transaction } = input;

    const content = await transaction.build({ client: input.suiClient });

    return {
      txType: TransactionType.Other,
      txSubType: PlainTransactionType,
      intentionData: { content: toHEX(content) },
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
    const { account } = input;

    const intention = PlainTransactionIntention.fromData(input.intentionData);
    const tx = await intention.build({ suiClient: input.suiClient, network: input.network, account: input.account });
    const client = input.suiClient;
    const inspectResult = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: account.address,
    });
    const success = inspectResult.effects.status.status === 'success';
    if (!success) {
      throw new Error(inspectResult.effects.status.error);
    }

    return tx;
  }
}
