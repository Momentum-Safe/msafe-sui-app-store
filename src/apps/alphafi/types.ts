import { PoolName } from '@alphafi/alphafi-sdk';
import { TransactionType } from '@msafe/sui3-utils';

export enum TransactionSubType {
  DEPOSIT_SINGLE_ASSET = 'depositSingleAsset',
  DEPOSIT_DOUBLE_ASSET = 'depositDoubleAsset',
  WITHDRAW = 'withdraw',
  WITHDRAW_ALPHA = 'withdrawAlpha',
  CLAIM_REWARD = 'claimReward',
}

export type AlphaFiIntentionData =
  | DepositDoubleAssetIntentionData
  | DepositSingleAssetIntentionData
  | WithdrawAlphaIntentionData
  | WithdrawIntentionData
  | EmptyIntentionData;

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: AlphaFiIntentionData;
};

export type EventType = {
  pool_id: string;
  event_type: number;
  amount_a: string;
  amount_b: string;
  amount: string;
  amount_withdrawn_from_locked: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyIntentionData {}

export interface DepositDoubleAssetIntentionData {
  poolName: PoolName;
  amount: string;
  isAmountA: boolean;
}

export interface DepositSingleAssetIntentionData {
  poolName: PoolName;
  amount: string;
}

export interface WithdrawIntentionData {
  xTokensAmount: string;
  poolName: PoolName;
}

export interface WithdrawAlphaIntentionData {
  xTokensAmount: string;
  withdrawFromLocked: boolean;
}
