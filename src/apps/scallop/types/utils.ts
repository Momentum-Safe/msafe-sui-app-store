import type { SerializedBcs } from '@mysten/bcs';
import { ObjectArg, SharedObjectRef } from '@mysten/sui.js/bcs';
import type { SuiObjectRef } from '@mysten/sui.js/client';
import type { TransactionArgument, TransactionObjectArgument } from '@mysten/sui.js/transactions';

import type { SupportAssetCoins } from './constant';

export type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};

export type CoinPrices = OptionalKeys<Record<SupportAssetCoins, number>>;

export type PriceMap = Map<
  SupportAssetCoins,
  {
    price: number;
    publishTime: number;
  }
>;

export type PureCallArg = {
  Pure: number[];
};

export type ObjectCallArg = {
  Object: ObjectArg;
};

export type SuiAddressArg = TransactionArgument | SerializedBcs<any> | string | PureCallArg;
export type SuiObjectArg = TransactionObjectArgument | string | SharedObjectRef | SuiObjectRef | ObjectCallArg;
export type SuiTxArg = SuiAddressArg | number | bigint | boolean;
export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';
export enum TransactionSubType {
  SupplyLending = 'SupplyLending',
  WithdrawLending = 'WithdrawLending',
  StakeSpool = 'StakeSpool',
  UnstakeSpool = 'UnstakeSpool',
  DepositCollateral = 'DepositCollateral',
  WithdrawCollateral = 'WithdrawCollateral',
  Borrow = 'Borrow',
  Repay = 'Repay',
  ClaimIncentiveReward = 'ClaimIncentiveReward',
  ClaimBorrowReward = 'ClaimBorrowReward',
  OpenObligation = 'OpenObligation',
  BorrowWithBoost = 'BorrowWithBoost',
  StakeSca = 'StakeSca',
  StakeMoreSca = 'StakeMoreSca',
  ExtendPeriodAndStakeMore = 'ExtendPeriodAndStakeMore',
  RenewExpStakePeriod = 'RenewExpStakePeriod',
  WithdrawStakedSca = 'WithdrawStakedSca',
  SupplyAndStakeLending = 'SupplyAndStakeLending',
  WithdrawAndUnstakeLending = 'WithdrawAndUnstakeLending',
  ExtendStakePeriod = 'ExtendStakePeriod',
  RedeemSca = 'RedeemSca',
  MigrateAndClaim = 'MigrateAndClaim',
}
