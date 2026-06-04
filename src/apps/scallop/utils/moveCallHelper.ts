import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

import { BcsType, TransactionCommand, TransactionCommandKind, TransactionInput } from '../types/sui.js';

class MoveCallHelper {
  private cmdIdx: number;

  constructor(
    public readonly moveCall: TransactionCommand | undefined,
    public readonly transaction: Transaction,
    index = 0,
  ) {
    const indexes: number[] = [];
    if (moveCall?.MoveCall) {
      this.transaction.getData().commands.filter((t, idx) => {
        if (t.$kind === 'MoveCall') {
          const target = `${t.MoveCall.package}::${t.MoveCall.module}::${t.MoveCall.function}`;
          const moveCallTarget = `${moveCall.MoveCall.package}::${moveCall.MoveCall.module}::${moveCall.MoveCall.function}`;
          const match = target === moveCallTarget;
          if (match) {
            indexes.push(idx);
            return true;
          }
          return false;
        }
        return false;
      });
    }
    this.cmdIdx = indexes[index];
  }

  getTransaction<Kind extends TransactionCommandKind>(idx: number): Extract<TransactionCommand, { $kind: Kind }> {
    return this.transaction.getData().commands[idx] as Extract<TransactionCommand, { $kind: Kind }>;
  }

  // MoveCall payload at the matched command index ({ package, module, function, typeArguments, arguments }).
  get txBlockTransactions() {
    return this.getTransaction<'MoveCall'>(this.cmdIdx).MoveCall;
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

  // Resolve the argument at argIndex to its underlying input (CallArg) in getData().inputs.
  getInputParam(argIndex: number): TransactionInput {
    const arg = this.txBlockTransactions.arguments[argIndex];
    if (arg.$kind !== 'Input') {
      throw new Error('not input type');
    }
    return this.transaction.getData().inputs[arg.Input];
  }

  // Resolve a Result/NestedResult argument to the command that produced it.
  getNestedInputParam<T>(argIndex: number): T {
    const arg = this.txBlockTransactions.arguments[argIndex];
    if (arg.$kind !== 'NestedResult' && arg.$kind !== 'Result') {
      throw new Error('not nested or result type');
    }
    const commandIdx = arg.$kind === 'Result' ? arg.Result : arg.NestedResult[0];
    return this.getTransaction(commandIdx) as unknown as T;
  }

  static getPureInputValue<T>(input: TransactionInput, type: BcsType) {
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }
    return bcs[type].parse(fromBase64(input.Pure.bytes)) as T;
  }

  static getOwnedObjectId(input: TransactionInput) {
    // A client-built (unresolved) tx carries object refs as UnresolvedObject with just the id.
    if (input.$kind === 'UnresolvedObject') {
      return normalizeSuiAddress(input.UnresolvedObject.objectId);
    }
    if (input.$kind !== 'Object') {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    if (input.Object.$kind !== 'ImmOrOwnedObject') {
      throw new Error('not ImmOrOwned');
    }
    return normalizeSuiAddress(input.Object.ImmOrOwnedObject.objectId);
  }

  static getSharedObjectId(input: TransactionInput) {
    if (input.$kind === 'UnresolvedObject') {
      return normalizeSuiAddress(input.UnresolvedObject.objectId);
    }
    if (input.$kind !== 'Object') {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    if (input.Object.$kind !== 'SharedObject') {
      throw new Error('not Shared');
    }
    return normalizeSuiAddress(input.Object.SharedObject.objectId);
  }

  static getPureInput<T>(input: TransactionInput, type: BcsType = 'U64') {
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }
    return bcs[type].parse(fromBase64(input.Pure.bytes)) as T;
  }

  typeArg(index: number) {
    return normalizeStructTag(this.txBlockTransactions.typeArguments[index]);
  }

  txArg(index: number) {
    return this.transaction.getData().inputs[index];
  }
}

export default MoveCallHelper;
