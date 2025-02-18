export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export interface MagmaIntentionData {
  txbParams: any;
  action: string;
}

export enum TransactionSubType {
  BatchCollectRewarder = 'BatchCollectRewarder',
  ClosePosition = 'ClosePosition',
  CollectRewarder = 'CollectRewarder',
  CreatePool = 'CreatePool',
  FastRouterSwap = 'FastRouterSwap',
  OpenAndAddLiquidity = 'OpenAndAddLiquidity',
  AddLiquidityWithProtection = 'AddLiquidityWithProtection',
  RemoveLiquidity = 'RemoveLiquidity',
}
