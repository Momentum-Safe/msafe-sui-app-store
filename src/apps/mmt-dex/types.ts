import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { Reward } from '@mmt-finance/clmm-sdk/dist/types';
import { Transaction } from '@mysten/sui/dist/cjs/transactions';

export type NormalizedRewarder = {
  coinType: string;
  flowRate: number;
  hasEnded: boolean;
  rewardAmount: number;
  rewardsAllocated: number;
};

export type AprBreakdown = {
  total: string;
  fee: string;
  rewards: {
    coinType: string;
    apr: string;
    amountPerDay: number;
  }[];
};

export type NormalizedPool = {
  poolSource: 'mmt-v3';
  poolId: string;
  tokenXType: string;
  tokenYType: string;
  tickSpacing: number;
  lpFeesPercent: string;
  feeRate: number;
  protocolFeesPercent: string;
  isStable: boolean;
  currentSqrtPrice: string;
  currentTickIndex: string;
  liquidity: string;
  liquidityHM: string;
  tokenXReserve: string;
  tokenYReserve: string;
  tvl: string;
  apy: string;
  volume24h: string;
  fees24h: string;
  timestamp: string;
  rewarders: NormalizedRewarder[];
  tokenX: any; // TokenSchema, but avoid import cycle
  tokenY: any;
  aprBreakdown: AprBreakdown;
};

export type Tokens = {
  coinType: string;
  tokenName: string;
  ticker: string;
  iconUrl: string;
  decimals: number;
  price: string;
  description: string;
  source?: 'hop' | 'af';
  tokenType?: 'lst' | 'meme' | 'bridged' | '';
  isVerified?: boolean;
};

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

export interface ClaimRewardsAsIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.ClaimRewardsAs;
  params: {
    claimParams: Omit<ClaimRewardsAsParams, 'sdk' | 'txb'>[];
  };
}
export interface RemoveLiquidityIntentionData extends MMTDEXIntentionData {
  action: TransactionSubType.RemoveLiquidity;
  params: {
    position: V3PositionType;
    pool: NormalizedPool;
    address: string;
    withdrawPercentage: number;
    zapOutOn: boolean;
    targetCoinType: string;
    slippage: number;
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
  ClaimRewardsAs = 'ClaimRewardsAs',
  RemoveLiquidity = 'RemoveLiquidity',
  Swap = 'Swap',
  ManageLiquidity = 'ManageLiquidity',
  ManageLiquiditySingleSide = 'ManageLiquiditySingleSide',
  StakeXSui = 'StakeXSui',
  UnstakeXSui = 'UnstakeXSui',
}

export const Rpc = 'https://fullnode.mainnet.sui.io/';

export type V3PositionType = {
  objectId: string;
  poolId: string;
  upperPrice: number;
  lowerPrice: number;
  upperTick: number;
  lowerTick: number;
  liquidity: string;
  amount: number;
  status: string;
  claimableRewards: number;
  rewarders: Reward[];
  feeAmountXUsd: number;
  feeAmountX: number;
  feeAmountYUsd: number;
  feeAmountY: number;
  claimableMaya: number;
};

export type ClaimRewardsAsParams = {
  sdk: MmtSDK;
  address: string;
  positionId: string;
  pool: NormalizedPool;
  txb: Transaction;
  targetCoinType: string;
  slippage: number;
};
