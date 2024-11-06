import { TransactionType } from '@msafe/sui3-utils';
import { Transaction, TransactionInput } from '@mysten/sui/transactions';

import { TransactionSubType } from './types';
import { CORE_PACKAGE_ID } from 'bucket-protocol-sdk';
import { BucketIntentionData } from './helper';
import { PsmIntentionData } from './api/psm';
import { MoveCallHelper } from '../mpay/decoder/moveCall';
import { bcs } from "@mysten/sui/bcs";

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
      .commands;
  }

  private get inputs() {
    return this.transaction
      .getData()
      .inputs;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private getTransferCommands() {
    return this.commands.filter((command) => command.$kind === 'TransferObjects');
  }

  private isPsmInTransaction() {
    return !!this.getMoveCallCommand('charge_reservoir');
  }
  private isPsmOutTransaction() {
    return !!this.getMoveCallCommand('discharge_reservoir');
  }

  private decodePsmIn(): DecodeResult {
    let amount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      amount = this.getPureInputU64(inputCoinObject.Input);
    }

    const psmCommand = this.getMoveCallCommand('charge_reservoir').MoveCall;
    const coinType = psmCommand.typeArguments[0];
    console.log('Decoder.decodePsmIn', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmIn,
      intentionData: {
        coinType,
        amount,
      } as PsmIntentionData,
    };
  }

  private decodePsmOut(): DecodeResult {
    let amount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      amount = this.getPureInputU64(inputCoinObject.Input);
    }

    const psmCommand = this.getMoveCallCommand('discharge_reservoir').MoveCall;
    const coinType = psmCommand.typeArguments[0];
    console.log('Decoder.decodePsmOut', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmOut,
      intentionData: {
        coinType,
        amount,
      } as PsmIntentionData,
    };
  }


  // Helpers
  private getPureInputU64(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.U64.fromBase64(input.Pure.bytes);
  }
}