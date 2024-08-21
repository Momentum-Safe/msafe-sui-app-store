import { fromHEX, toHEX } from '@iota/iota-sdk/utils';
import { TransactionSubTypes, TransactionType } from '@msafe/iota-utils';
import sortKeys from 'sort-keys-recursive';

import { MSafeAppHelper, TransactionIntention } from '@/apps/interface';
import { SuiNetworks } from '@/types';
import { IotaClient } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { IotaSignTransactionBlockInput, WalletAccount } from '@iota/wallet-standard';

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
}
export class PlainTransactionHelper implements MSafeAppHelper<PlainTransactionData> {
  application: string;

  constructor() {
    this.application = PlainTransactionApplication;
  }

  async deserialize(
    input: IotaSignTransactionBlockInput & { network: SuiNetworks; client: IotaClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: PlainTransactionData }> {
    const { transactionBlock, client } = input;

    const content = await transactionBlock.build({ client });

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
    client: IotaClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { client, account } = input;
    const txb = TransactionBlock.from(fromHEX(input.intentionData.content));

    const inspectResult = await client.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: account.address,
    });
    const success = inspectResult.effects.status.status === 'success';
    if (!success) {
      throw new Error(inspectResult.effects.status.error);
    }

    return txb;
  }
}
