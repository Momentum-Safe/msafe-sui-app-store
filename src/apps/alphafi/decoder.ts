import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { AlphaFiIntentionData } from './helper';
import { TransactionSubType } from './types';
import { poolIdPoolNameMap, poolInfo, PoolName } from '@alphafi/alphafi-sdk';
import { DevInspectResults } from '@mysten/sui/client';
import BigNumber from 'bignumber.js';
import { fromB64, toHEX } from '@mysten/sui/utils';
import { DepositSingleAssetIntentionData } from './intentions/deposit-single-asset';
import { WithdrawIntentionData } from './intentions/withdraw';
import { WithdrawAlphaIntentionData } from './intentions/withdraw-alpha';
import { DepositDoubleAssetIntentionData } from './intentions/deposit-double-asset';
import { EmptyIntentionData } from './intentions/claim-reward';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: AlphaFiIntentionData;
};

type EventType = {
  pool_id: string;
  event_type: number;
  amount_a: string;
  amount_b: string;
  amount: string;
  amount_withdrawn_from_locked: string;
};

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly simResult: DevInspectResults,
  ) {}

  /**
   * Entry point for decoding the transaction. Determines the type of transaction
   * and calls the appropriate decode method.
   */
  decode(): DecodeResult {
    if (this.isClaimRewardTransaction()) {
      return this.decodeClaimReward();
    }

    const liquidityChangeEvent = this.getLiquidityChangeEvent();
    if (!liquidityChangeEvent) {
      throw new Error('No liquidity change event found. Unable to decode transaction.');
    }

    const eventData = liquidityChangeEvent.parsedJson as EventType;
    const poolId = eventData.pool_id;
    const poolName = poolIdPoolNameMap[poolId];

    if (this.isWithdrawAlphaEvent(liquidityChangeEvent)) {
      return this.decodeWithdrawAlpha(eventData);
    }

    if (this.isWithdrawEvent(eventData)) {
      return this.decodeWithdraw(poolName);
    }

    if (this.isDoubleAssetDepositEvent(eventData, poolName)) {
      return this.decodeDoubleAssetDeposit(poolName, eventData);
    }

    if (this.isSingleAssetDepositEvent(eventData, poolName)) {
      return this.decodeSingleAssetDeposit(poolName, eventData);
    }

    throw new Error(`Unknown transaction type`);
  }

  // ---- Private Helpers ----

  private get commands() {
    return this.transaction.getData().commands;
  }

  private get inputs() {
    return this.transaction.getData().inputs;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getLiquidityChangeEvent() {
    return this.simResult.events.find((event) => this.isLiquidityChangeEventType(event.type));
  }

  //is*
  private isClaimRewardTransaction() {
    return !!this.getMoveCallCommand('get_user_rewards_all');
  }

  private isLiquidityChangeEventType(type: string) {
    return (
      type.includes('LiquidityChangeEvent') ||
      type.includes('LiquidityChangeNewNewEvent') ||
      type.includes('WithdrawEventV2')
    );
  }

  private isWithdrawAlphaEvent(event: { type: string }) {
    return event.type.includes('WithdrawEventV2');
  }

  private isWithdrawEvent(eventData: EventType) {
    return eventData.event_type === 1;
  }

  private isDoubleAssetDepositEvent(eventData: EventType, poolName: PoolName) {
    return eventData.event_type === 0 && poolInfo[poolName].numberOfAssets === 2;
  }

  private isSingleAssetDepositEvent(eventData: EventType, poolName: PoolName) {
    return eventData.event_type === 0 && poolInfo[poolName].numberOfAssets === 1;
  }

  /**
   * Extracts the xTokensAmount from transaction inputs.
   */
  private extractXTokensAmount(): string {
    const inputWithPure = this.inputs.find((input) => input.Pure !== undefined);
    if (!inputWithPure || !inputWithPure.Pure?.bytes) {
      throw new Error('Unable to extract xTokensAmount from inputs');
    }

    const bytes = inputWithPure.Pure.bytes;
    return new BigNumber(toHEX(fromB64(bytes)), 16).toString();
  }

  // ---- Decode Methods ----

  private decodeDoubleAssetDeposit(poolName: PoolName, eventData: EventType): DecodeResult {
    const { amount_a, amount_b } = eventData;
    const isAmountA = Number(amount_a) > 0;
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DEPOSIT_DOUBLE_ASSET,
      intentionData: {
        poolName,
        amount: isAmountA ? amount_a : amount_b,
        isAmountA,
      } as DepositDoubleAssetIntentionData,
    };
  }

  private decodeSingleAssetDeposit(poolName: PoolName, eventData: EventType): DecodeResult {
    const { amount } = eventData;
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DEPOSIT_DOUBLE_ASSET,
      intentionData: {
        poolName,
        amount,
      } as DepositSingleAssetIntentionData,
    };
  }

  private decodeWithdraw(poolName: PoolName): DecodeResult {
    const xTokensAmount = this.extractXTokensAmount();
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DEPOSIT_DOUBLE_ASSET,
      intentionData: {
        poolName,
        xTokensAmount,
      } as WithdrawIntentionData,
    };
  }

  private decodeWithdrawAlpha(eventData: EventType): DecodeResult {
    const xTokensAmount = this.extractXTokensAmount();
    const { amount_withdrawn_from_locked } = eventData;
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DEPOSIT_DOUBLE_ASSET,
      intentionData: {
        withdrawFromLocked: Number(amount_withdrawn_from_locked) > 0,
        xTokensAmount,
      } as WithdrawAlphaIntentionData,
    };
  }

  private decodeClaimReward(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CLAIM_REWARD,
      intentionData: {} as EmptyIntentionData,
    };
  }
}
