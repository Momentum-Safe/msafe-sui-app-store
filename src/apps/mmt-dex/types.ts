import { V3PositionType } from './utils/reward';
import { NormalizedPool, Tokens } from './utils/swap';

export type MMTDEXIntentionData = {
  action: TransactionSubType;
  params: any;
};

export interface AddLiquidityIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.AddLiquidity;
  params: {
    address: string;
    amountA: string;
    amountB: string;
    pool: NormalizedPool;
    selectedLowTick: number;
    selectedHighTick: number;
    slippage: number;
  };
}

export interface AddLiquiditySingleSideIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.AddLiquiditySingleSide;
  params: {
    address: string;
    amount: string;
    isTokenX: boolean;
    pool: NormalizedPool;
    selectedLowTick: number;
    selectedHighTick: number;
    swapSlippage: number;
    addLiquiditySlippage: number;
  };
}

export interface ManageLiquidityIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ManageLiquidity;
  params: {
    address: string;
    amountA: string;
    amountB: string;
    pool: NormalizedPool;
    positionObjectId: string;
    slippage: number;
  };
}

export interface ManageLiquiditySingleSideIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ManageLiquiditySingleSide;
  params: {
    address: string;
    amount: string;
    isTokenX: boolean;
    pool: NormalizedPool;
    positionObjectId: string;
    swapSlippage: number;
    addLiquiditySlippage: number;
  };
}

export interface ClaimAllRewardsIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ClaimAllRewards;
  params: {
    address: string;
    positions: V3PositionType[];
    pools: NormalizedPool[];
  };
}

export interface ClaimRewardsIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ClaimRewards;
  params: {
    address: string;
    position: V3PositionType;
    pool: NormalizedPool;
  };
}

export interface RemoveLiquidityIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.RemoveLiquidity;
  params: {
    position: V3PositionType;
    pool: NormalizedPool;
    address: string;
    withdrawPercentage: number;
  };
}

export interface SwapIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.Swap;
  params: {
    route: NormalizedPool[];
    tokenIn: Tokens;
    amountIn: string;
    address: string;
    slippage: number;
  };
}

export interface StakeXSuiIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.StakeXSui;
  params: {
    address: string;
    amount: string;
  };
}

export interface UnstakeXSuiIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.UnstakeXSui;
  params: {
    address: string;
    amount: string;
  };
}

export enum TransactionSubType {
  AddLiquidity = 'AddLiquidity',
  AddLiquiditySingleSide = 'AddLiquiditySingleSide',
  ClaimAllRewards = 'ClaimAllRewards',
  ClaimRewards = 'ClaimRewards',
  RemoveLiquidity = 'RemoveLiquidity',
  Swap = 'Swap',
  ManageLiquidity = 'ManageLiquidity',
  ManageLiquiditySingleSide = 'ManageLiquiditySingleSide',
  StakeXSui = 'StakeXSui',
  UnstakeXSui = 'UnstakeXSui',
}

export const Rpc = 'https://fullnode.mainnet.sui.io/';
