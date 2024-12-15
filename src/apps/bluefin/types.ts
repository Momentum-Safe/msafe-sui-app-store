import { SuiAddress, TransactionType } from '@msafe/sui3-utils';

export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export type OpenAndAddLiquidityIntentionData = {
  pool: SuiAddress;
  lowerTick: number;
  upperTick: number;
  tokenAmount: string;
  maxAmountTokenA: string;
  maxAmountTokenB: string;
  isTokenAFixed: boolean;
};

export type ProvideLiquidityIntentionData = {
  pool: SuiAddress;
  position: SuiAddress;
  lowerTick: number;
  upperTick: number;
  tokenAmount: string;
  slippage: number;
  isTokenAFixed: boolean;
};

export type RemoveLiquidityIntentionData = ProvideLiquidityIntentionData;

export type ClosePositionIntentionData = {
  pool: SuiAddress;
  position: SuiAddress;
};

export type CollectRewardsIntentionData = ClosePositionIntentionData & { rewardCoinsType?: Array<string> };
export type CollectFeeIntentionData = ClosePositionIntentionData;
export type CollectFeeAndRewardsIntentionData = ClosePositionIntentionData;

export type BluefinIntentionData =
  | OpenAndAddLiquidityIntentionData
  | ClosePositionIntentionData
  | ProvideLiquidityIntentionData
  | RemoveLiquidityIntentionData
  | CollectRewardsIntentionData
  | CollectFeeIntentionData
  | CollectFeeAndRewardsIntentionData;

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: BluefinIntentionData;
};

export enum TransactionSubType {
  OpenAndAddLiquidity = 'OpenAndAddLiquidity',
  ProvideLiquidity = 'ProvideLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  ClosePosition = 'ClosePosition',
  CollectFee = 'CollectFee',
  CollectRewards = 'CollectRewards',
  CollectFeeAndRewards = 'CollectFeeAndRewards',
}
