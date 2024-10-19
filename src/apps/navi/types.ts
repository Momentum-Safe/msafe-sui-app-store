export enum CoinType {
  sui = 'sui',
  wusdc = 'wusdc',
  nusdc = 'nusdc',
  usdt = 'usdt',
  weth = 'weth',
  cetus = 'cetus',
  voloSui = 'voloSui',
  haSui = 'haSui',
  navx = 'navx',
  ausd = 'ausd',
  wbtc = 'wbtc',
  eth = 'eth',
  usdy = 'usdy',
}

export type Pool = { [key in CoinType]: PoolConfig };

export interface PoolConfig {
  name: string;
  coinType: CoinType;
  assetId: number;
  poolId: string; // Type must be ${PriceOraclePackage}::pool::Pool<${CoinType}>
  fondPoolId?: string;
  type: string; // CoinType
  reserveObjectId: string; // Get it from dynamic object, type must be ${ProtocolPackage}::storage::ReserveData
  borrowBalanceParentId: string; // Get it from dynamic object, type must be ${ProtocolPackage}::storage::TokenBalance
  supplyBalanceParentId: string; // Get it from dynamic object, type must be ${ProtocolPackage}::storage::TokenBalance
}

export enum TransactionSubType {
  EntryDeposit = 'EntryDeposit',
  EntryBorrow = 'EntryBorrow',
  EntryRepay = 'EntryRepay',
  EntryWithdraw = 'EntryWithdraw',
  ClaimReward = 'ClaimReward',
}

export enum OptionType {
  Supply = 1,
  Withdraw = 2,
  Borrow = 3,
  Repay = 4,
}
