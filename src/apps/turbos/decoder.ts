import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/builder';
import { TransactionBlockInput, TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { config } from './config';
import { TURBOSIntentionData } from './helper';
import { TransactionSubType } from './types';
import { SuiClient } from '@mysten/sui.js/client';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: TURBOSIntentionData;
};

const swap1Layer = [`${config.PackageId}::swap_router::swap_a_b`, `${config.PackageId}::swap_router::swap_b_a`];
const swap2Layer = [
  `${config.PackageId}::swap_router::swap_a_b_b_c`,
  `${config.PackageId}::swap_router::swap_a_b_c_b`,
  `${config.PackageId}::swap_router::swap_b_a_b_c`,
  `${config.PackageId}::swap_router::swap_b_a_c_b`,
];

const getAtoB = (layer: 0 | 1, target: string): boolean[] => {
  if (layer === 1) {
    const index = swap2Layer.findIndex((item) => item === target);
    switch (index) {
      case 0:
        return [true, true];
      case 1:
        return [true, false];
      case 2:
        return [false, true];
      case 4:
        return [false, false];
      default:
        throw new Error(`not target: ${target}`);
    }
  }
  const index = swap1Layer.findIndex((item) => item === target);
  switch (index) {
    case 0:
      return [true];
    case 1:
      return [false];
    default:
      throw new Error(`not target: ${target}`);
  }
};

export class Decoder {
  constructor(
    public readonly txb: TransactionBlock,
    public readonly client: SuiClient,
  ) {}

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  decode(address: string) {
    if (this.isSwapTransaction()) {
      return this.decodeSwap();
    }

    if (this.isAddLiquidityTransaction()) {
      return this.decodeAddLiquidity();
    }

    if (this.isIncreaseLiquidityTransaction()) {
      return this.decodeIncreaseLiquidity(address);
    }

    if (this.isRemoveLiquidityTransaction()) {
      return this.decodeRemoveLiquidity(address);
    }

    if (this.isDecreaseLiquidityTransaction()) {
      return this.decodeDecreaseLiquidity(address);
    }

    if (this.isCollectFeeTransaction()) {
      return this.decodeCollectFee();
    }

    if (this.isCollectRewardTransaction()) {
      return this.decodeCollectReward();
    }

    if (this.isBurnTransaction()) {
      return this.decodeBurn();
    }

    throw new Error(`Unknown transaction type`);
  }

  private getMoveCallTransaction(target: string) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
  }

  private getMoveCallsTransaction(targets: string[]) {
    return targets.every((target) => {
      return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
    });
  }

  private getSwapMoveCallTransaction(targets: string[]) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && targets.includes(trans.target));
  }

  private isSwapTransaction() {
    return !!this.getSwapMoveCallTransaction([...swap1Layer, ...swap2Layer]);
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

  private isCollectFeeTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::collect`);
  }

  private isCollectRewardTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::collect_reward`);
  }

  private isBurnTransaction() {
    return !!this.getMoveCallTransaction(`${config.PackageId}::position_manager::burn`);
  }

  private isRemoveLiquidityTransaction() {
    return !!this.getMoveCallsTransaction([
      `${config.PackageId}::position_manager::decrease_liquidity`,
      `${config.PackageId}::position_manager::burn`,
    ]);
  }

  private decodeSwap(): DecodeResult {
    const moveCall = this.transactions.find((trans) => trans.kind === 'MoveCall') as MoveCallTransaction;
    console.log(moveCall, 'decodeSwap');
    let layer: 0 | 1 = 0;
    if (swap2Layer.includes(moveCall.target)) {
      layer = 1;
    }

    const atob = getAtoB(layer, moveCall.target);

    const routes = atob.map((item, index) => {
      const pool = this.helper.decodeSharedObjectId(index);
      const nextTickIndex = this.helper.decodeInputU128(4 + index + layer);
      return {
        pool,
        a2b: item,
        nextTickIndex: nextTickIndex,
      };
    });

    const coinTypeA = atob[0] ? moveCall.typeArguments[0] : moveCall.typeArguments[1];
    const coinTypeB =
      layer === 1 ? moveCall.typeArguments[4] : atob[0] ? moveCall.typeArguments[1] : moveCall.typeArguments[0];

    const address = this.helper.decodeInputAddress(6 + 2 * layer);
    const deadline = this.helper.decodeInputU64(7 + 2 * layer);
    const amountSpecifiedIsInput = this.helper.decodeInputBool(5 + 2 * layer);
    const amountA = this.helper.decodeInputU64(2 + layer);
    const amountB = this.helper.decodeInputU64(3 + layer);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Swap,
      intentionData: {
        routes: routes,
        coinTypeA,
        coinTypeB,
        address,
        amountA: amountSpecifiedIsInput ? amountA : amountB,
        amountB: amountSpecifiedIsInput ? amountB : amountA,
        amountSpecifiedIsInput,
        slippage: '0.1',
        deadline,
      },
    };
  }

  private decodeAddLiquidity(): DecodeResult {
    console.log(this.helper, 'this.helper');
    const pool = this.helper.decodeSharedObjectId(0);
    const address = this.helper.decodeInputAddress(12);

    const amountA = this.helper.decodeInputU64(8);
    const amountB = this.helper.decodeInputU64(9);
    const tickLower = this.helper.decodeInputU32(4);
    const tickLowerIsNeg = this.helper.decodeInputBool(5);
    const tickUpper = this.helper.decodeInputU32(6);
    const tickUpperIsNeg = this.helper.decodeInputBool(7);

    const deadline = this.helper.decodeInputU64(13);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.AddLiquidity,
      intentionData: {
        pool,
        slippage: 5,
        address,
        amountA,
        amountB,
        tickLower: tickLowerIsNeg ? -tickLower : tickLower,
        tickUpper: tickUpperIsNeg ? -tickUpper : tickUpper,
        deadline,
      },
    };
  }

  private decodeIncreaseLiquidity(address: string): DecodeResult {
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(4);
    const amountA = this.helper.decodeInputU64(5);
    const amountB = this.helper.decodeInputU64(6);

    const deadline = this.helper.decodeInputU64(9);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.IncreaseLiquidity,
      intentionData: {
        pool,
        slippage: 5,
        address,
        amountA,
        amountB,
        nft,
        deadline,
      },
    };
  }

  private decodeDecreaseLiquidity(address: string): DecodeResult {
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(2);
    const decreaseLiquidity = this.helper.decodeInputU64(3);
    const amountA = this.helper.decodeInputU64(4);
    const amountB = this.helper.decodeInputU64(5);

    const deadline = this.helper.decodeInputU64(6);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DecreaseLiquidity,
      intentionData: {
        pool,
        decreaseLiquidity,
        nft,
        amountA,
        amountB,
        slippage: 3, // DO NOT use slippage by user setting for now.
        address,
        deadline,
      },
    };
  }

  private decodeCollectFee(): DecodeResult {
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(2);
    const address = this.helper.decodeInputAddress(5);
    const collectAmountA = this.helper.decodeInputU64(3);
    const collectAmountB = this.helper.decodeInputU64(4);

    const deadline = this.helper.decodeInputU64(6);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CollectFee,
      intentionData: {
        pool,
        address,
        collectAmountA,
        collectAmountB,
        nft,
        deadline,
      },
    };
  }

  private decodeCollectReward(): DecodeResult {
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(2);
    const address = this.helper.decodeInputAddress(6);
    const rewardAmounts = this.collectRewardHelper.map((helper) => helper.decodeInputU64(5));

    const deadline = this.helper.decodeInputU64(7);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CollectReward,
      intentionData: {
        pool,
        address,
        rewardAmounts,
        nft,
        deadline,
      },
    };
  }

  private decodeBurn(): DecodeResult {
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(2);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Burn,
      intentionData: {
        pool,
        nft,
      },
    };
  }

  private decodeRemoveLiquidity(address: string): DecodeResult {
    const pool = this.decreaseLiquidityHelper.decodeSharedObjectId(0);
    const nft = this.decreaseLiquidityHelper.decodeSharedObjectId(2);
    const decreaseLiquidity = this.decreaseLiquidityHelper.decodeInputU64(3);
    const amountA = this.decreaseLiquidityHelper.decodeInputU64(4);
    const amountB = this.decreaseLiquidityHelper.decodeInputU64(5);

    const deadline = this.decreaseLiquidityHelper.decodeInputU64(6);
    const rewardAmounts = this.collectRewardHelper.map((helper) => helper.decodeInputU64(5));

    const collectAmountA = this.collectFeeHelper.decodeInputU64(3) || 0;
    const collectAmountB = this.collectFeeHelper.decodeInputU64(4) || 0;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RemoveLiquidity,
      intentionData: {
        pool,
        decreaseLiquidity,
        nft,
        amountA,
        amountB,
        slippage: 3,
        address,
        collectAmountA,
        collectAmountB,
        rewardAmounts,
        deadline,
      },
    };
  }

  private get helper() {
    console.log(this.transactions, 'this.transactions');
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target !== '0x2::coin::zero',
    ) as MoveCallTransaction;
    console.log(moveCall, this.txb, 'this.txb');
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get collectRewardHelper() {
    console.log(this.transactions, 'this.transactions');
    const moveCalls = this.transactions.filter(
      (trans) => trans.kind === 'MoveCall' && trans.target === `${config.PackageId}::position_manager::collect_reward`,
    ) as MoveCallTransaction[];
    console.log(moveCalls, this.txb, 'this.txb');
    return moveCalls.map((moveCall) => new MoveCallHelper(moveCall, this.txb));
  }

  private get collectFeeHelper() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target === `${config.PackageId}::position_manager::collect`,
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get decreaseLiquidityHelper() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target === `${config.PackageId}::position_manager::decrease_liquidity`,
    ) as MoveCallTransaction;
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
