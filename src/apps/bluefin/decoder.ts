import { asIntN } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { fromB64 } from '@mysten/bcs';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';

import {
  ClosePositionIntentionData,
  CollectFeeIntentionData,
  CollectRewardsAndFeeIntentionData,
  CollectRewardsIntentionData,
  CollectTokens,
  DecodeResult,
  FeeTokens,
  OpenPositionIntentionData,
  ProvideLiquidityIntentionData,
  RemoveLiquidityIntentionData,
  RewardCollection,
  RewardTokens,
  TransactionSubType,
} from './types';

export class Decoder {
  constructor(public readonly transaction: Transaction) {}

  decode() {
    if (this.isOpenPositionTx()) {
      return this.decodeOpenPositionTx();
    }
    if (this.isClosePositionTx()) {
      return this.decodeClosePositionTx();
    }
    if (this.isProvideLiquidityTx()) {
      return this.decodeProvideLiquidityTx();
    }
    if (this.isRemoveLiquidityTx()) {
      return this.decodeRemoveLiquidityTx();
    }
    if (this.isCollectRewardsAndFeeTx()) {
      return this.decodeCollectRewardsAndFeeTx();
    }
    if (this.isCollectRewardsTx()) {
      return this.decodeCollectRewardsTx();
    }
    if (this.isCollectFeeTx()) {
      return this.decodeCollectFeeTx();
    }
    throw new Error(`Unknown transaction type`);
  }

  private decodeOpenPositionTx(): DecodeResult {
    const openPosCommand = this.getMoveCallCommand('open_position');
    const addLiqCommand = this.getMoveCallCommand('provide_liquidity_with_fixed_amount');

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.OpenPosition,
      intentionData: {
        pool: this.getSharedObjectID(this.getInputIndex(openPosCommand, 1)),
        lowerTick: Number(asIntN(BigInt(this.getU32(this.getInputIndex(openPosCommand, 2)))).toString()),
        upperTick: Number(asIntN(BigInt(this.getU32(this.getInputIndex(openPosCommand, 3)))).toString()),
        tokenAmount: this.getU64(this.getInputIndex(addLiqCommand, 6)),
        maxAmountTokenA: this.getU64(this.getInputIndex(addLiqCommand, 7)),
        maxAmountTokenB: this.getU64(this.getInputIndex(addLiqCommand, 8)),
        isTokenAFixed: this.getBoolean(this.getInputIndex(addLiqCommand, 9)),
      } as OpenPositionIntentionData,
    };
  }

  private decodeClosePositionTx(): DecodeResult {
    const closePosCommand = this.getMoveCallCommand('close_position');

    const rewardsCallData = this.getCollectRewardCallData();

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ClosePosition,
      intentionData: {
        pool: this.getSharedObjectID(this.getInputIndex(closePosCommand, 2)),
        position: this.getOwnedObjectID(this.getInputIndex(closePosCommand, 3)),
        transferTokensTo: this.getAddress(this.getInputIndex(closePosCommand, 4)),
        collectRewardTokens: rewardsCallData.map((r) => r.rewardCoinType) as RewardTokens,
        collectFeeTokens: this.getTypeArguments(closePosCommand) as FeeTokens,
      } as ClosePositionIntentionData,
    };
  }

  private decodeProvideLiquidityTx(): DecodeResult {
    const addLiqCommand = this.getMoveCallCommand('provide_liquidity_with_fixed_amount');

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ProvideLiquidity,
      intentionData: {
        pool: this.getSharedObjectID(this.getInputIndex(addLiqCommand, 2)),
        position: this.getOwnedObjectID(this.getInputIndex(addLiqCommand, 3)),
        tokenAmount: this.getU64(this.getInputIndex(addLiqCommand, 6)),
        maxAmountTokenA: this.getU64(this.getInputIndex(addLiqCommand, 7)),
        maxAmountTokenB: this.getU64(this.getInputIndex(addLiqCommand, 8)),
        isTokenAFixed: this.getBoolean(this.getInputIndex(addLiqCommand, 9)),
      } as ProvideLiquidityIntentionData,
    };
  }

  private decodeRemoveLiquidityTx(): DecodeResult {
    const removeLiqCommand = this.getMoveCallCommand('remove_liquidity');
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RemoveLiquidity,
      intentionData: {
        pool: this.getSharedObjectID(this.getInputIndex(removeLiqCommand, 2)),
        position: this.getOwnedObjectID(this.getInputIndex(removeLiqCommand, 3)),
        liquidity: this.getU128(this.getInputIndex(removeLiqCommand, 4)),
        maxAmountTokenA: this.getU64(this.getInputIndex(removeLiqCommand, 5)),
        maxAmountTokenB: this.getU64(this.getInputIndex(removeLiqCommand, 6)),
        transferTokensTo: this.getAddress(this.getInputIndex(removeLiqCommand, 7)),
        ...this.collectTokens(),
      } as RemoveLiquidityIntentionData,
    };
  }

  private decodeCollectRewardsTx(): DecodeResult {
    const rewardsCallData = this.getCollectRewardCallData();
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CollectRewards,
      intentionData: {
        pool: rewardsCallData[0].pool,
        position: rewardsCallData[0].position,
        collectRewardTokens: rewardsCallData.map((r) => r.rewardCoinType),
      } as CollectRewardsIntentionData,
    };
  }

  private decodeCollectFeeTx(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CollectFee,
      intentionData: this.getFeeCallData() as CollectFeeIntentionData,
    };
  }

  private decodeCollectRewardsAndFeeTx(): DecodeResult {
    const callData = this.getFeeCallData();
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CollectRewardsAndFee,
      intentionData: {
        pool: callData.pool,
        position: callData.position,
        ...this.collectTokens(),
      } as CollectRewardsAndFeeIntentionData,
    };
  }

  private getFeeCallData(): CollectFeeIntentionData {
    const collectFeeCommand = this.getMoveCallCommand('collect_fee');
    return {
      pool: this.getSharedObjectID(this.getInputIndex(collectFeeCommand, 2)),
      position: this.getOwnedObjectID(this.getInputIndex(collectFeeCommand, 3)),
      collectFeeTokens: this.getTypeArguments(collectFeeCommand) as FeeTokens,
    };
  }

  private getCollectRewardCallData(): Array<RewardCollection> {
    const collectRewards: RewardCollection[] = [];
    this.commands.forEach((command) => {
      if (command.$kind === 'MoveCall' && command.MoveCall.function === 'collect_reward') {
        collectRewards.push({
          pool: this.getSharedObjectID(this.getInputIndex(command, 2)),
          position: this.getOwnedObjectID(this.getInputIndex(command, 3)),
          rewardCoinType: this.getTypeArguments(command)[2],
        });
      }
    });
    return collectRewards;
  }

  private collectTokens(): CollectTokens {
    const fee = this.getFeeCallData();
    const rewards = this.getCollectRewardCallData();

    return {
      collectFeeTokens: fee.collectFeeTokens,
      collectRewardTokens: rewards.map((r) => r.rewardCoinType) as RewardTokens,
    };
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private get inputs() {
    return this.transaction.getData().inputs;
  }

  private isOpenPositionTx() {
    return !!this.getMoveCallCommand('open_position');
  }

  private isProvideLiquidityTx() {
    return !!this.getMoveCallCommand('provide_liquidity_with_fixed_amount');
  }

  private isRemoveLiquidityTx() {
    return !!this.getMoveCallCommand('remove_liquidity');
  }

  private isCollectRewardsTx() {
    return !!this.getMoveCallCommand('collect_reward');
  }

  private isCollectFeeTx() {
    return !!this.getMoveCallCommand('collect_fee');
  }

  private isCollectRewardsAndFeeTx() {
    return this.isCollectRewardsTx() && this.isCollectFeeTx();
  }

  private isClosePositionTx() {
    return !!this.getMoveCallCommand('close_position');
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSharedObjectID(index: number): string {
    return this.inputs[index].Object.SharedObject.objectId as string;
  }

  private getOwnedObjectID(index: number): string {
    return this.inputs[index].Object.ImmOrOwnedObject.objectId as string;
  }

  private getU32(index: number): string {
    return String(bcs.u32().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes))));
  }

  private getU64(index: number): string {
    return bcs.u64().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getU128(index: number): string {
    return bcs.u128().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getBoolean(index: number): boolean {
    return bcs.bool().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getAddress(index: number): string {
    return bcs.Address.parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getTypeArguments(command: any): Array<string> {
    return command.MoveCall.typeArguments || [];
  }

  private getInputIndex(command: any, index: number): number {
    return command.MoveCall.arguments[index].Input;
  }
}
