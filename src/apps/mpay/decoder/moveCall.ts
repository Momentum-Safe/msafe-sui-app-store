import { bcs, pureBcsSchemaFromTypeName, type PureTypeName } from '@mysten/sui/bcs';
import { fromBase64 } from '@mysten/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

type TxData = ReturnType<Transaction['getData']>;
type TransactionCommand = TxData['commands'][number];
type TransactionInput = TxData['inputs'][number];
type MoveCallCommand = Extract<TransactionCommand, { $kind: 'MoveCall' }>;

function parsePureBytes(input: TransactionInput): Uint8Array {
  if (!input.Pure) {
    throw new Error('not pure argument');
  }
  return fromBase64(input.Pure.bytes);
}

export class MoveCallHelper {
  constructor(
    public readonly moveCall: TransactionCommand,
    public readonly txb: Transaction,
  ) {}

  private get moveCallData(): MoveCallCommand['MoveCall'] {
    if (this.moveCall.$kind !== 'MoveCall') {
      throw new Error('not move call command');
    }
    return this.moveCall.MoveCall;
  }

  private get inputs() {
    return this.txb.getData().inputs;
  }

  private getInputIndex(argIndex: number): number {
    const arg = this.moveCallData.arguments[argIndex];
    if (arg.$kind !== 'Input') {
      throw new Error('not input type');
    }
    return arg.Input;
  }

  private getInputParam(argIndex: number): TransactionInput {
    return this.inputs[this.getInputIndex(argIndex)];
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
    const input = this.getInputParam(argIndex);
    return BigInt(bcs.U64.parse(parsePureBytes(input)));
  }

  decodeInputAddress(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return normalizeSuiAddress(bcs.Address.parse(parsePureBytes(input)));
  }

  decodeInputString(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return bcs.String.parse(parsePureBytes(input));
  }

  decodeInputBool(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return bcs.Bool.parse(parsePureBytes(input));
  }

  decodePureArg<T>(argIndex: number, bcsType: string) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getPureInputValue<T>(input, bcsType);
  }

  static getPureInputValue<T>(input: TransactionInput, bcsType: string) {
    return MoveCallHelper.getPureInput<T>(input, bcsType);
  }

  static getOwnedObjectId(input: TransactionInput) {
    const objectId =
      input.Object?.ImmOrOwnedObject?.objectId ?? input.Object?.Receiving?.objectId ?? input.UnresolvedObject?.objectId;
    if (!objectId) {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    return normalizeSuiAddress(objectId);
  }

  static getSharedObjectId(input: TransactionInput) {
    const objectId = input.Object?.SharedObject?.objectId ?? input.UnresolvedObject?.objectId;
    if (!objectId) {
      throw new Error(`not shared object argument: ${JSON.stringify(input)}`);
    }
    return normalizeSuiAddress(objectId);
  }

  static getPureInput<T>(input: TransactionInput, bcsType: string) {
    const schema = pureBcsSchemaFromTypeName(bcsType as PureTypeName);
    return schema.parse(parsePureBytes(input)) as T;
  }

  typeArg(index: number) {
    return normalizeStructTag(this.moveCallData.typeArguments[index]);
  }

  txArg(index: number) {
    return this.moveCallData.arguments[index];
  }
}
