export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export enum TransactionSubType {
  CreatePool = 'CreatePool',
  AddLiquidity = 'AddLiquidity',
  IncreaseLiquidity = 'IncreaseLiquidity',
  DecreaseLiquidity = 'DecreaseLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
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
