import { asIntN } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/transactions';
import { TransactionBlock, TransactionBlockInput } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';

import { DecodeResult, TransactionSubType } from './types';

export class Decoder {
  constructor(public readonly txb: TransactionBlock) {}

  decode() {
    if (this.isOpenPositionTx()) {
      return this.decodeOpenPositionAndAddLiquidityTx();
    }
    throw new Error(`Unknown transaction type`);
  }

  private decodeOpenPositionAndAddLiquidityTx(): DecodeResult {
    const openPosTx = this.getMoveCallTransaction('open_position') as MoveCallHelper;
    const addLiqTx = this.getMoveCallTransaction('provide_liquidity') as MoveCallHelper;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.OpenAndAddLiquidity,
      intentionData: {
        pool: openPosTx.decodeSharedObjectId(0),
        lowerTick: Number(asIntN(BigInt(openPosTx.decodeInputU32(2))).toString()),
        upperTick: Number(asIntN(BigInt(openPosTx.decodeInputU32(3))).toString()),
        tokenAmount: addLiqTx.decodeInputU64(6),
        maxAmountTokenA: addLiqTx.decodeInputU64(7),
        maxAmountTokenB: addLiqTx.decodeInputU64(8),
        isTokenAFixed: addLiqTx.decodeInputBool(9),
      },
    };
  }

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  private isOpenPositionTx() {
    return !!this.getMoveCallTransaction(`open_position`);
  }

  private getMoveCallTransaction(target: string) {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.indexOf(target) !== -1,
    ) as MoveCallTransaction;
    if (moveCall) {
      return new MoveCallHelper(moveCall, this.txb);
    }
    return false;
  }
}

export class MoveCallHelper {
  constructor(
    public readonly moveCall: MoveCallTransaction,
    public readonly txb: TransactionBlock,
  ) {}

  decodeSharedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getSharedObjectId(input);
  }

  getInputParam(argIndex: number) {
    const arg = this.moveCall.arguments[argIndex];
    if (arg.kind !== 'Input') {
      throw new Error('not input type');
    }
    return this.txb.blockData.inputs[arg.index];
  }

  decodeOwnedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getOwnedObjectId(input);
  }

  decodeInputU128(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'u128');
    return Number(strVal);
  }

  decodeInputU64(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'u64');
    return Number(strVal);
  }

  decodeInputU32(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'u32');
    return Number(strVal);
  }

  decodeInputU8(argIndex: number) {
    const strVal = this.decodePureArg<string>(argIndex, 'u8');
    return Number(strVal);
  }

  decodeInputAddress(argIndex: number) {
    const input = this.decodePureArg<string>(argIndex, 'address');
    return normalizeSuiAddress(input);
  }

  decodeInputString(argIndex: number) {
    return this.decodePureArg<string>(argIndex, 'string');
  }

  decodeInputBool(argIndex: number) {
    return this.decodePureArg<boolean>(argIndex, 'bool');
  }

  decodePureArg<T>(argIndex: number, bcsType: string) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getPureInputValue<T>(input, bcsType);
  }

  static getPureInputValue<T>(input: TransactionBlockInput, bcsType: string) {
    if (input.type !== 'pure') {
      throw new Error('not pure argument');
    }
    if (typeof input.value === 'object' && 'Pure' in input.value) {
      const bcsNums = input.value.Pure;
      return bcs.de(bcsType, new Uint8Array(bcsNums)) as T;
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

  static getPureInput<T>(input: TransactionBlockInput, bcsType: string) {
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
    return bcs.de(bcsType, new Uint8Array(bcsVal)) as T;
  }

  typeArg(index: number) {
    return normalizeStructTag(this.moveCall.typeArguments[index]);
  }

  shortTypeArg(index: number) {
    return this.moveCall.typeArguments[index];
  }

  txArg(index: number) {
    return this.moveCall.arguments[index];
  }
}
