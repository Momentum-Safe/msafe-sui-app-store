import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/transactions';
import { TransactionBlock, TransactionBlockInput } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { BN, Contract, TurbosSdk } from 'turbos-clmm-sdk';

import { deepbookConfig, prixConfig } from './config';
// eslint-disable-next-line import/no-cycle
import { TURBOSIntentionData } from './helper';
import { TransactionSubType } from './types';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: TURBOSIntentionData;
};

const getAtoB = (layer: 0 | 1, target: string, swap1Layer: string[], swap2Layer: string[]): boolean[] => {
  if (layer === 1) {
    const index = swap2Layer.findIndex((item) => item === target);
    switch (index) {
      case 0:
        return [true, true];
      case 1:
        return [true, false];
      case 2:
        return [false, true];
      case 3:
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
    public readonly turbosSdk: TurbosSdk,
    public readonly config: Contract.Config,
  ) {}

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  private get swap1Layer() {
    return [`${this.config.PackageId}::swap_router::swap_a_b`, `${this.config.PackageId}::swap_router::swap_b_a`];
  }

  private get swap2Layer() {
    return [
      `${this.config.PackageId}::swap_router::swap_a_b_b_c`,
      `${this.config.PackageId}::swap_router::swap_a_b_c_b`,
      `${this.config.PackageId}::swap_router::swap_b_a_b_c`,
      `${this.config.PackageId}::swap_router::swap_b_a_c_b`,
    ];
  }

  async decode(address: string) {
    if (this.isSwapTransaction()) {
      return await this.decodeSwap();
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

    if (this.isPrixClaimTransaction()) {
      return this.decodePrixClaim();
    }

    if (this.isPrixJoinTransaction()) {
      return this.decodePrixJoin();
    }

    if (this.isSwapExactBaseForQuoteTransaction()) {
      return this.decodeSwapExactBaseForQuote();
    }

    if (this.isSwapExactQuoteForBaseTransaction()) {
      return this.decodeSwapExactQuoteForBase();
    }

    throw new Error(`Unknown transaction type`);
  }

  private getMoveCallTransaction(target: string) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
  }

  private getMoveCallsTransaction(targets: string[]) {
    return targets.every((target) =>
      this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target),
    );
  }

  private getSwapMoveCallTransaction(targets: string[]) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && targets.includes(trans.target));
  }

  private isSwapTransaction() {
    return !!this.getSwapMoveCallTransaction([...this.swap1Layer, ...this.swap2Layer]);
  }

  private isAddLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::mint`);
  }

  private isIncreaseLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::increase_liquidity`);
  }

  private isDecreaseLiquidityTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::decrease_liquidity`);
  }

  private isCollectFeeTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::collect`);
  }

  private isCollectRewardTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::collect_reward`);
  }

  private isBurnTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::burn`);
  }

  private isPrixJoinTransaction() {
    return !!this.getMoveCallTransaction(`${prixConfig.PackageId}::claim::join`);
  }

  private isPrixClaimTransaction() {
    return !!this.getMoveCallTransaction(`${prixConfig.PackageId}::claim::claim`);
  }

  private isRemoveLiquidityTransaction() {
    return !!this.getMoveCallsTransaction([
      `${this.config.PackageId}::position_manager::decrease_liquidity`,
      `${this.config.PackageId}::position_manager::burn`,
    ]);
  }

  private isSwapExactBaseForQuoteTransaction() {
    return !!this.getMoveCallTransaction(`${deepbookConfig.PackageId}::clob_v2::swap_exact_base_for_quote`);
  }

  private isSwapExactQuoteForBaseTransaction() {
    return !!this.getMoveCallTransaction(`${deepbookConfig.PackageId}::clob_v2::swap_exact_quote_for_base`);
  }

  private async decodeSwap(): Promise<DecodeResult> {
    const moveCall = this.transactions.find((trans) => trans.kind === 'MoveCall') as MoveCallTransaction;
    let layer: 0 | 1 = 0;
    if (this.swap2Layer.includes(moveCall.target)) {
      layer = 1;
    }

    const atob = getAtoB(layer, moveCall.target, this.swap1Layer, this.swap2Layer);

    const routes = atob.map((item, index) => {
      const pool = this.helper.decodeSharedObjectId(index);
      const sqrtPrice = this.helper.decodeInputU128(4 + index + layer);
      const nextTickIndex = this.turbosSdk.math.sqrtPriceX64ToTickIndex(new BN(sqrtPrice.toString()));

      return {
        pool,
        a2b: item,
        nextTickIndex,
      };
    });

    const coinTypeA = atob[0]
      ? moveCall.typeArguments[0]
      : layer === 1
        ? moveCall.typeArguments[0]
        : moveCall.typeArguments[1];
    const coinTypeB =
      layer === 1 ? moveCall.typeArguments[4] : atob[0] ? moveCall.typeArguments[1] : moveCall.typeArguments[0];

    const address = this.helper.decodeInputAddress(6 + 2 * layer);
    const deadline = this.helper.decodeInputU64(7 + 2 * layer);
    const amountSpecifiedIsInput = this.helper.decodeInputBool(5 + 2 * layer);
    const amountA = this.helper.decodeInputU64(2 + layer);
    const amountB = this.helper.decodeInputU64(3 + layer);

    const result = await this.turbosSdk.trade.computeSwapResultV2({
      pools: [{ pool: routes[0].pool, a2b: routes[0].a2b, amountSpecified: amountA }],
      address,
      amountSpecifiedIsInput,
    });

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Swap,
      intentionData: {
        routes,
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
    console.log(this.helper, 'this.helper.decodeAddLiquidity')
    const pool = this.helper.decodeSharedObjectId(0);
    const address = this.helper.decodeInputAddress(12);

    const amountA = this.helper.decodeInputU64(8);
    const amountB = this.helper.decodeInputU64(9);
    const tickLower = this.helper.decodeInputU32(4);
    const tickLowerIsNeg = this.helper.decodeInputBool(5);
    const tickUpper = this.helper.decodeInputU32(6);
    const tickUpperIsNeg = this.helper.decodeInputBool(7);

    const deadline = this.helper.decodeInputU64(13);
    console.log({
      pool, 
      address,
      amountA,
      amountB,
      tickLower,
      tickLowerIsNeg,
      tickUpper,
      tickUpperIsNeg
    });
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.AddLiquidity,
      intentionData: {
        pool,
        slippage: 10,
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
        slippage: 10,
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
        slippage: 10, // DO NOT use slippage by user setting for now.
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
        slippage: 10,
        address,
        collectAmountA,
        collectAmountB,
        rewardAmounts,
        deadline,
      },
    };
  }

  private decodePrixClaim(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PrixClaim,
      intentionData: {},
    };
  }

  private decodePrixJoin(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PrixJoin,
      intentionData: {},
    };
  }

  private decodeSwapExactBaseForQuote(): DecodeResult {
    const poolId = this.swapExactBaseForQuoteHelper.decodeSharedObjectId(0);
    const amountIn = this.swapExactBaseForQuoteHelper.decodeInputU64(3);
    const token1 = this.swapExactBaseForQuoteHelper.shortTypeArg(0);
    const token2 = this.swapExactBaseForQuoteHelper.shortTypeArg(1);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SwapExactBaseForQuote,
      intentionData: {
        poolId,
        amountIn,
        token1,
        token2,
      },
    };
  }

  private decodeSwapExactQuoteForBase(): DecodeResult {
    const poolId = this.swapExactQuoteForBaseHelper.decodeSharedObjectId(0);
    const amountIn = this.swapExactQuoteForBaseHelper.decodeInputU64(3);
    const token1 = this.swapExactQuoteForBaseHelper.shortTypeArg(0);
    const token2 = this.swapExactQuoteForBaseHelper.shortTypeArg(1);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SwapExactQuoteForBase,
      intentionData: {
        poolId,
        amountIn,
        token1,
        token2,
      },
    };
  }

  private get helper() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target !== '0x2::coin::zero',
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get collectRewardHelper() {
    const moveCalls = this.transactions.filter(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target === `${this.config.PackageId}::position_manager::collect_reward`,
    ) as MoveCallTransaction[];
    return moveCalls.map((moveCall) => new MoveCallHelper(moveCall, this.txb));
  }

  private get collectFeeHelper() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target === `${this.config.PackageId}::position_manager::collect`,
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get decreaseLiquidityHelper() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target === `${this.config.PackageId}::position_manager::decrease_liquidity`,
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get swapExactBaseForQuoteHelper() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target === `${deepbookConfig.PackageId}::clob_v2::swap_exact_base_for_quote`,
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get swapExactQuoteForBaseHelper() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target === `${deepbookConfig.PackageId}::clob_v2::swap_exact_quote_for_base`,
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

  shortTypeArg(index: number) {
    return this.moveCall.typeArguments[index];
  }

  txArg(index: number) {
    return this.moveCall.arguments[index];
  }
}
