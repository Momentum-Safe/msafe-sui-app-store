import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';
import { TransactionBlockInput } from '@mysten/sui.js/transactions';

import {
  BcsType,
  MoveCallTransactionArgumentType,
  MoveCallTransactionType,
  SplitCoinTransactionType,
  TransactionCommand,
} from '../types/sui';

class MoveCallHelper {
  private cmdIdx: number;

  constructor(
    public readonly moveCall: TransactionCommand,
    public readonly transaction: Transaction,
  ) {
    this.cmdIdx = transaction.getData().commands.findIndex((t) => {
      if (t.$kind === 'MoveCall') {
        const target = `${t.MoveCall.package}::${t.MoveCall.module}::${t.MoveCall.function}`;
        const moveCallTarget = `${moveCall.MoveCall.package}::${moveCall.MoveCall.module}::${moveCall.MoveCall.function}`;
        return target === moveCallTarget;
      }
      return false;
    });
  }

  get txBlockTransactions(): MoveCallTransactionType {
    return this.transaction.blockData.transactions[this.cmdIdx] as MoveCallTransactionType;
  }

  decodeSharedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getSharedObjectId(input);
  }

  decodeOwnedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getOwnedObjectId(input);
  }

  decodeInputU64(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'U64');
    return Number(strVal);
  }

  decodeInputU8(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'U8');
    return Number(strVal);
  }

  decodeInputAddress(argIndex: number) {
    const input = this.decodePureArg<string>(argIndex, 'Address');
    return normalizeSuiAddress(input);
  }

  decodeInputString(argIndex: number) {
    return this.decodePureArg<string>(argIndex, 'String');
  }

  decodeInputBool(argIndex: number) {
    return this.decodePureArg<boolean>(argIndex, 'Bool');
  }

  decodePureArg<T>(argIndex: number, type: BcsType) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getPureInputValue<T>(input, type);
  }

  getInputParam(argIndex: number) {
    const arg = this.transaction.blockData.inputs[argIndex] as MoveCallTransactionArgumentType;
    if (arg.kind !== 'Input') {
      throw new Error('not input type');
    }
    return this.transaction.blockData.inputs[arg.index];
  }

  getNestedInputParam<T = SplitCoinTransactionType>(argIndex: number) {
    const arg = this.transaction.blockData.inputs[argIndex] as MoveCallTransactionArgumentType;
    if (arg.kind !== 'NestedResult') {
      throw new Error('not input type');
    }
    return this.transaction.blockData.transactions[arg.index] as T;
  }

  static getPureInputValue<T>(input: TransactionBlockInput, type: BcsType) {
    if (input.type !== 'pure') {
      throw new Error('not pure argument');
    }
    if (typeof input.value === 'object' && 'Pure' in input.value) {
      const bcsNums = input.value.Pure;
      const a = bcs[type];
      return bcs[type].parse(new Uint8Array(bcsNums)) as T;
    }
    return input.value as T;
  }

  static getOwnedObjectId(input: TransactionBlockInput) {
    if (input.type !== 'object') {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    if (typeof input.value === 'object') {
      if (!('Object' in input.value) || !('ImmOrOwned' in input.value.Object)) {
        throw new Error('not ImmOrOwned');
      }
      return normalizeSuiAddress(input.value.Object.ImmOrOwned.objectId as string);
    }
    return normalizeSuiAddress(input.value as string);
  }

  static getSharedObjectId(input: TransactionBlockInput) {
    if (input.type !== 'object') {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    if (typeof input.value !== 'object') {
      return normalizeSuiAddress(input.value as string);
    }
    if (!('Object' in input.value) || !('Shared' in input.value.Object)) {
      throw new Error('not Shared');
    }
    return normalizeSuiAddress(input.value.Object.Shared.objectId as string);
  }

  static getPureInput<T>(input: TransactionBlockInput) {
    if (input.type !== 'pure') {
      throw new Error('not pure argument');
    }
    if (typeof input.value !== 'object') {
      return input.value as T;
    }
    if (!('Pure' in input.value)) {
      throw new Error('Pure not in value');
    }
    const bcsVal = input.value.Pure;
    return bcs.U64.parse(new Uint8Array(bcsVal)) as T;
  }

  typeArg(index: number) {
    return normalizeStructTag(this.txBlockTransactions.typeArguments[index]);
  }

  txArg(index: number) {
    return this.transaction.blockData.inputs[index];
  }
}

export default MoveCallHelper;
