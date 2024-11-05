import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from './types';
import { CORE_PACKAGE_ID } from 'bucket-protocol-sdk';
import { BucketIntentionData } from './helper';
import { PsmIntentionData } from './api/psm';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: BucketIntentionData;
};

export class Decoder {
  constructor(public readonly transaction: Transaction) { }

  decode() {
    if (this.isPsmInTransaction()) {
      return this.decodePsmIn();
    }
    else if (this.isPsmOutTransaction()) {
      return this.decodePsmOut();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction
      .getData()
      .commands.filter((command) => command.MoveCall.package === CORE_PACKAGE_ID && command.MoveCall.module === "buck");
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private isPsmInTransaction() {
    return !!this.getMoveCallCommand('charge_reservoir');
  }
  private isPsmOutTransaction() {
    return !!this.getMoveCallCommand('discharge_reservoir');
  }

  private decodePsmIn(): DecodeResult {
    const splitCoinsCommand = this.getSplitCoinsCommands()[0];
    const psmInCommand = this.getMoveCallCommand('charge_reservoir');

    const coinType = psmInCommand.MoveCall.typeArguments[1];
    const { value } = splitCoinsCommand.SplitCoins.amounts[0] as any;
    console.log('Decoder.decodePsmIn', coinType, value);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmIn,
      intentionData: {
        coinType,
        amount: value,
      } as PsmIntentionData,
    };
  }

  private decodePsmOut(): DecodeResult {
    const splitCoinsCommand = this.getSplitCoinsCommands()[0];
    const psmOutCommand = this.getMoveCallCommand('discharge_reservoir');

    const coinType = psmOutCommand.MoveCall.typeArguments[1];
    const { value } = splitCoinsCommand.SplitCoins.amounts[0] as any;
    console.log('Decoder.decodePsmOut', coinType, value);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmIn,
      intentionData: {
        coinType,
        amount: value,
      } as PsmIntentionData,
    };
  }
}