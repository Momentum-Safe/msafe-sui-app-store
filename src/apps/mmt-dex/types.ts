import { V3PositionType } from './utils/reward';
import { Pools, Tokens } from './utils/swap';

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
    pool: Pools;
    selectedLowTick: number;
    selectedHighTick: number;
  };
}

export interface AddLiquiditySingleSideIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.AddLiquiditySingleSide;
  params: {
    address: string;
    amount: string;
    isTokenX: boolean;
    pool: Pools;
    selectedLowTick: number;
    selectedHighTick: number;
  };
}

export interface ClaimAllRewardsIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ClaimAllRewards;
  params: {
    address: string;
    positions: V3PositionType[];
    pools: Pools[];
  };
}

export interface ClaimRewardsIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ClaimRewards;
  params: {
    address: string;
    position: V3PositionType;
    pool: Pools;
  };
}

export interface RemoveLiquidityIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.RemoveLiquidity;
  params: {
    position: V3PositionType;
    pool: Pools;
    address: string;
    withdrawPercentage: number;
  };
}

export interface SwapIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.Swap;
  params: {
    route: Pools[];
    tokenIn: Tokens;
    amountIn: string;
    address: string;
  };
}

export enum TransactionSubType {
  AddLiquidity = 'AddLiquidity',
  AddLiquiditySingleSide = 'AddLiquiditySingleSide',
  ClaimAllRewards = 'ClaimAllRewards',
  ClaimRewards = 'ClaimRewards',
  RemoveLiquidity = 'RemoveLiquidity',
  Swap = 'Swap',
}

export const Rpc = 'https://fullnode.mainnet.sui.io/';
