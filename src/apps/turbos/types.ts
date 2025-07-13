import { NFT, Pool, Trade } from 'turbos-clmm-sdk';

export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export enum TransactionSubType {
  CreatePool = 'CreatePool',
  AddLiquidity = 'AddLiquidity',
  IncreaseLiquidity = 'IncreaseLiquidity',
  DecreaseLiquidity = 'DecreaseLiquidity',
  DecreaseLiquidityWithReturn = 'DecreaseLiquidityWithReturn',
  RemoveLiquidity = 'RemoveLiquidity',
  RemoveLiquidityWithReturn = 'removeLiquidityWithReturn',
  CollectFee = 'CollectFee',
  CollectReward = 'CollectReward',
  Burn = 'Burn',
  Swap = 'Swap',
  ClaimAll = 'ClaimAll',
  PrixJoin = 'PrixJoin',
  PrixClaim = 'PrixClaim',
  SwapExactBaseForQuote = 'SwapExactBaseForQuote',
  SwapExactQuoteForBase = 'SwapExactQuoteForBase',
}

export type TURBOSIntentionData =
  | CreatePoolIntentionData
  | AddLiquidityIntentionData
  | IncreaseLiquidityIntentionData
  | DecreaseLiquidityIntentionData
  | DecreaseLiquidityWithReturnIntentionData
  | CollectFeeIntentionData
  | CollectRewardIntentionData
  | RemoveLiquidityIntentionData
  | RemoveLiquidityWithReturnIntentionData
  | BurnIntentionData
  | SwapIntentionData
  | PrixJoinIntentionData
  | PrixClaimIntentionData
  | SwapExactQuoteForBaseIntentionData
  | SwapExactBaseForQuoteIntentionData;

export type CreatePoolIntentionData = Pool.CreatePoolOptions;
export type AddLiquidityIntentionData = Pool.AddLiquidityOptions;
export type BurnIntentionData = NFT.BurnOptions;

interface ClaimAllParams extends Pool.CollectFeeOptions, Pool.CollectRewardOptions {}

export interface ClaimAllIntentionData {
  positions: ClaimAllParams[];
}

export type CollectFeeIntentionData = Pool.CollectFeeOptions;
export type CollectRewardIntentionData = Pool.CollectRewardOptions;
export type DecreaseLiquidityIntentionData = Pool.DecreaseLiquidityOptions;
export type DecreaseLiquidityWithReturnIntentionData = Pool.DecreaseLiquidityOptions;
export type IncreaseLiquidityIntentionData = Pool.IncreaseLiquidityOptions; // eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PrixClaimIntentionData {} // eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PrixJoinIntentionData {}

export type RemoveLiquidityIntentionData = Pool.RemoveLiquidityOptions;
export type RemoveLiquidityWithReturnIntentionData = Pool.RemoveLiquidityOptions;
export type SwapIntentionData = Trade.SwapOptions;

export interface SwapExactBaseForQuoteIntentionData {
  token1: string;
  token2: string;
  poolId: string;
  amountIn: number;
}

export interface SwapExactQuoteForBaseIntentionData {
  token1: string;
  token2: string;
  poolId: string;
  amountIn: number;
}
