import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/builder';
import { TransactionBlockInput, TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { config } from './config';
import { TURBOSIntentionData } from './helper';
import { TransactionSubType } from './types';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: TURBOSIntentionData;
};

export class Decoder {
  constructor(public readonly txb: TransactionBlock) {}

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  decode() {
    if (this.isAddLiquidityTransaction()) {
      return this.decodeAddLiquidity();
    }
    // if (this.isIncreaseLiquidityTransaction()) {
    //   return this.decodeIncreaseLiquidity();
    // }
    // if (this.isDecreaseLiquidityTransaction()) {
    //   return this.decodeDecreaseLiquidity();
    // }
    throw new Error(`Unknown transaction type`);
  }

  private getMoveCallTransaction(target: string) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
  }

  private isAddLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::mint`);
  }
  private isIncreaseLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::increase_liquidity`);
  }
  private isDecreaseLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::decrease_liquidity`);
  }

  private decodeAddLiquidity(): DecodeResult {
    console.log(this.helper, 'this.helper');
    const pool = this.helper.decodeSharedObjectId(0);
    const address = this.helper.decodeInputAddress(12);

    const amountA = this.helper.decodeInputU64(8);
    const amountB = this.helper.decodeInputU64(9);
    const tickLower = this.helper.decodeInputU32(5);
    const tickUpper = this.helper.decodeInputU32(7);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.AddLiquidity,
      intentionData: {
        pool,
        slippage: 5,
        address,
        amountA,
        amountB,
        tickLower,
        tickUpper,
      },
    };
  }

  // private decodeIncreaseLiquidity(): DecodeResult {
  //   const assetId = this.helper.decodeInputU8(4);
  //   const optionId = this.helper.decodeInputU8(5);
  //   const pool = this.findPoolByAssetId(assetId);
  //   return {
  //     txType: TransactionType.Other,
  //     type: TransactionSubType.AddLiquidity,
  //     intentionData: {
  //       coinType: pool.coinType,
  //       option: optionId,
  //     },
  //   };
  // }

  // private decodeDecreaseLiquidity(): DecodeResult {
  //   const assetId = this.helper.decodeInputU8(4);
  //   const optionId = this.helper.decodeInputU8(5);
  //   const pool = this.findPoolByAssetId(assetId);
  //   return {
  //     txType: TransactionType.Other,
  //     type: TransactionSubType.AddLiquidity,
  //     intentionData: {
  //       coinType: pool.coinType,
  //       option: optionId,
  //     },
  //   };
  // }

  private get helper() {
    console.log(this.transactions, 'this.transactions');
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith('') && trans.target !== '0x2::coin::zero',
    ) as MoveCallTransaction;
    console.log(moveCall, this.txb, 'this.txb');
    return new MoveCallHelper(moveCall, this.txb);
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

  decodeOwnedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getOwnedObjectId(input);
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

  getInputParam(argIndex: number) {
    const arg = this.moveCall.arguments[argIndex];
    if (arg.kind !== 'Input') {
      throw new Error('not input type');
    }
    return this.txb.blockData.inputs[arg.index];
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

  txArg(index: number) {
    return this.moveCall.arguments[index];
  }
}
