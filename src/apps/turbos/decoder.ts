import { TransactionType } from '@msafe/sui3-utils';
import { fromBase64 } from '@mysten/bcs';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { BN, Contract, TurbosSdk } from 'turbos-clmm-sdk';

import { deepbookConfig, prixConfig } from './config';
import { TransactionSubType, TURBOSIntentionData } from './types';

type GetDataReturnType = ReturnType<Transaction['getData']>;
export type TransactionInputs = GetDataReturnType['inputs'];
export type TransactionCommands = GetDataReturnType['commands'];
export type TransactionCommand = TransactionCommands[number];

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
    public readonly txb: Transaction,
    public readonly turbosSdk: TurbosSdk,
    public readonly config: Contract.Config,
  ) {}

  private get transactions() {
    return this.txb.getData().commands;
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

    if (this.isRemoveLiquidityWithReturnTransaction()) {
      return this.decodeRemoveLiquidityWithReturn(address);
    }

    if (this.isDecreaseLiquidityWithReturnTransaction()) {
      return this.decodeDecreaseLiquidityWithReturn(address);
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
    return this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === target;
      }
      return false;
    });
  }

  private getMoveCallsTransaction(targets: string[]) {
    return targets.every((target) =>
      this.transactions.find((trans) => {
        if (trans.$kind === 'MoveCall') {
          const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
          return moveCallTarget === target;
        }
        return false;
      }),
    );
  }

  private getSwapMoveCallTransaction(targets: string[]) {
    return this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return !!targets.includes(moveCallTarget);
      }
      return false;
    });
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

  private isDecreaseLiquidityWithReturnTransaction() {
    return !!this.getMoveCallTransaction(`${this.config.PackageId}::position_manager::decrease_liquidity_with_return_`);
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

  private isRemoveLiquidityWithReturnTransaction() {
    return !!this.getMoveCallsTransaction([
      `${this.config.PackageId}::position_manager::decrease_liquidity_with_return_`,
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
    const moveCall = this.transactions.find((trans) => trans.$kind === 'MoveCall');
    let layer: 0 | 1 = 0;
    const moveCallTarget = `${moveCall.MoveCall.package}::${moveCall.MoveCall.module}::${moveCall.MoveCall.function}`;
    if (this.swap2Layer.includes(moveCallTarget)) {
      layer = 1;
    }

    const atob = getAtoB(layer, moveCallTarget, this.swap1Layer, this.swap2Layer);

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

    // eslint-disable-next-line no-nested-ternary
    const coinTypeA = atob[0]
      ? moveCall.MoveCall.typeArguments[0]
      : layer === 1
        ? moveCall.MoveCall.typeArguments[0]
        : moveCall.MoveCall.typeArguments[1];
    const coinTypeB =
      // eslint-disable-next-line no-nested-ternary
      layer === 1
        ? moveCall.MoveCall.typeArguments[4]
        : atob[0]
          ? moveCall.MoveCall.typeArguments[1]
          : moveCall.MoveCall.typeArguments[0];

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
    console.log(this.helper, 'decodeAddLiquidity this.helper');
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
    console.log(this.helper, 'decodeIncreaseLiquidity this.helper');

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
    console.log(this.helper, 'decodeDecreaseLiquidity this.helper');
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

  private decodeDecreaseLiquidityWithReturn(address: string): DecodeResult {
    console.log(this.helper, 'decodeDecreaseLiquidityWithReturn this.helper');
    const pool = this.helper.decodeSharedObjectId(0);
    const nft = this.helper.decodeSharedObjectId(2);
    const decreaseLiquidity = this.helper.decodeInputU64(3);
    const amountA = this.helper.decodeInputU64(4);
    const amountB = this.helper.decodeInputU64(5);

    const deadline = this.helper.decodeInputU64(6);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DecreaseLiquidityWithReturn,
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
    console.log(this.helper, 'decodeCollectFee this.helper');
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
    console.log(this.helper, 'decodeCollectReward this.helper');
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
    console.log(this.helper, 'decodeBurn this.helper');
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
    console.log(this.helper, 'decodeRemoveLiquidity this.helper');
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

  private decodeRemoveLiquidityWithReturn(address: string): DecodeResult {
    console.log(this.helper, 'decodeRemoveLiquidityWithReturn this.helper');
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
      type: TransactionSubType.RemoveLiquidityWithReturn,
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
    const moveCall = this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return (
          moveCallTarget !== '0x2::coin::zero' &&
          moveCallTarget !== '0x0000000000000000000000000000000000000000000000000000000000000002::coin::zero'
        );
      }
      return false;
    });
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get collectRewardHelper() {
    const moveCalls = this.transactions.filter((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === `${this.config.PackageId}::position_manager::collect_reward`;
      }
      return false;
    });
    return moveCalls.map((moveCall) => new MoveCallHelper(moveCall, this.txb));
  }

  private get collectFeeHelper() {
    const moveCall = this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === `${this.config.PackageId}::position_manager::collect`;
      }
      return false;
    });
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get decreaseLiquidityHelper() {
    const moveCall = this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === `${this.config.PackageId}::position_manager::decrease_liquidity`;
      }
      return false;
    });
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get swapExactBaseForQuoteHelper() {
    const moveCall = this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === `${deepbookConfig.PackageId}::clob_v2::swap_exact_base_for_quote`;
      }
      return false;
    });
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get swapExactQuoteForBaseHelper() {
    const moveCall = this.transactions.find((trans) => {
      if (trans.$kind === 'MoveCall') {
        const moveCallTarget = `${trans.MoveCall.package}::${trans.MoveCall.module}::${trans.MoveCall.function}`;
        return moveCallTarget === `${deepbookConfig.PackageId}::clob_v2::swap_exact_quote_for_base`;
      }
      return false;
    });
    return new MoveCallHelper(moveCall, this.txb);
  }
}

export class MoveCallHelper {
  constructor(
    public readonly moveCall: TransactionCommand,
    public readonly txb: Transaction,
  ) {}

  private get inputs() {
    return this.txb.getData().inputs;
  }

  decodeSharedObjectId(argIndex: number) {
    return this.inputs[argIndex].Object.SharedObject.objectId;
  }

  decodeOwnedObjectId(argIndex: number) {
    return this.inputs[argIndex].Object.ImmOrOwnedObject.objectId;
  }

  decodeInputU128(argIndex: number) {
    return Number(bcs.u128().parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes))));
  }

  decodeInputU64(argIndex: number) {
    return Number(bcs.u64().parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes))));
  }

  decodeInputU32(argIndex: number) {
    return Number(bcs.u32().parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes))));
  }

  decodeInputU8(argIndex: number) {
    return Number(bcs.u8().parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes))));
  }

  decodeInputAddress(argIndex: number) {
    return bcs.Address.parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes)));
  }

  decodeInputBool(argIndex: number) {
    return bcs.bool().parse(Uint8Array.from(fromBase64(this.inputs[argIndex].Pure.bytes)));
  }

  shortTypeArg(index: number) {
    return this.moveCall.MoveCall.typeArguments[index];
  }

  txArg(index: number) {
    return this.moveCall.MoveCall.arguments[index];
  }
}
