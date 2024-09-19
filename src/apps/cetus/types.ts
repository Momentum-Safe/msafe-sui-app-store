export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export interface CetusIntentionData {
  txbParams: any;
  action: string;
}

export enum TransactionSubType {
  Swap = 'AggregatorSwap',
  OpenAndAddLiquidity = 'OpenAndAddLiquidity',
  IncreaseLiquidity = 'IncreaseLiquidity',
  DecreaseLiquidity = 'DecreaseLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  ClaimFeeAndMining = 'ClaimFeeAndMining',
  FarmingOpenAndAddLiquidity = 'FarmingOpenAndAddLiquidity',
  FarmingIncreaseLiquidity = 'FarmingIncreaseLiquidity',
  FarmingDecreaseLiquidity = 'FarmingDecreaseLiquidity',
  FarmingRemoveLiquidity = 'FarmingRemoveLiquidity',
  FarmingClaimFeeAndReward = 'FarmingClaimFeeAndReward',
  FarmingHarvest = 'FarmingHarvest',
  FarmingBatchHarvest = 'FarmingBatchHarvest',
  FarmingStake = 'FarmingStake',
  FarmingUnstake = 'FarmingUnstake',
  xCETUSConvert = 'xCETUSConvert',
  xCETUSRedeemLock = 'xCETUSRedeemLock',
  xCETUSClaimStakingRwewards = 'xCETUSClaimStakingRwewards',
  xCETUSCancelRedeem = 'xCETUSCancelRedeem',
  xCETUSRedeem = 'xCETUSRedeem',
  VestingRedeem = 'VestingRedeem',
}
