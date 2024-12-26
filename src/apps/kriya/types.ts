export type KRIYAIntentionData = {
  action: TransactionSubType;
  params: any;
};

export enum TransactionSubType {
  Swap = 'Swap',
  AddLiquidity = 'AddLiquidity',
  AddLiquiditySingleSided = 'AddLiquiditySingleSided',
  RemoveLiquidity = 'RemoveLiquidity',
  AddLiquidityV3 = 'AddLiquidityV3',
  AddLiquiditySingleSideV3 = 'AddLiquiditySingleSideV3',
  RemoveLiquidityV3 = 'RemoveLiquidityV3',
  ClaimRewards = 'ClaimRewards',
  ClaimRewardsV3 = 'ClaimRewardsV3',
  ClaimV3MayaRewards = 'ClaimV3MayaRewards',
}

export const Rpc = 'https://fullnode.mainnet.sui.io/';
