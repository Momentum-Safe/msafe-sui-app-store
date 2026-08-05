import { TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { fromHex } from '@mysten/bcs';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc, IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

export type PlainTransactionData = {
  content: string;
};

export const PlainTransactionApplication = 'msafe-plain-tx';
export const PlainTransactionType = TransactionSubTypes.others.plain;

export class PlainTransactionIntention extends BaseIntentionGrpc<PlainTransactionData> {
  txType = TransactionType.Other;

  txSubType = PlainTransactionType;

  constructor(public readonly data: PlainTransactionData) {
    super(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(_input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    return Transaction.from(fromHex(this.data.content));
  }

  static fromData(data: PlainTransactionData) {
    return new PlainTransactionIntention(data);
  }
}

export class PlainTransactionHelper implements IAppHelperInternalGrpc<PlainTransactionData> {
  application: string;

  supportSDK = '@mysten/sui-v2' as const;

  constructor() {
    this.application = PlainTransactionApplication;
  }

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
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
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { suiGrpcClient, network, account } = input;
    const intention = PlainTransactionIntention.fromData(input.intentionData);
    return intention.build({ suiGrpcClient, network, account });
  }
}
