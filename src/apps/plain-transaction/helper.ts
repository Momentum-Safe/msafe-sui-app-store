import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromHEX, toHEX } from '@mysten/sui.js/utils';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { MSafeAppHelper, TransactionIntention } from '@/apps/interface';
import { SuiNetworks } from '@/types';

export type PlainTransactionData = {
  content: string;
};

export const PlainTransactionApplication = 'msafe-plain-tx';
export const PlainTransactionType = 'PlainTransaction';

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
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: PlainTransactionData }> {
    const { transactionBlock, suiClient } = input;

    const content = await transactionBlock.build({ client: suiClient });

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
  }): Promise<TransactionBlock> {
    return TransactionBlock.from(fromHEX(input.intentionData.content));
  }
}
