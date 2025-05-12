import { TransactionType } from '@msafe/sui3-utils';
import { SuiObjectRef } from '@mysten/sui/client';
import type { Inputs } from '@mysten/sui/transactions';

export type OptionalKeys<T> = {
  [K in keyof T]?: T[K];
};

export type CoinPrices = OptionalKeys<Record<string, number>>;

export type PriceMap = Map<
  string,
  {
    price: number;
    publishTime: number;
  }
>;

// export type PureCallArg = {
//   Pure: number[];
// };

type SharedObjectRef = {
  /** Hex code as string representing the object id */
  objectId: string;
  /** The version the object was shared at */
  initialSharedVersion: number | string;
  /** Whether reference is mutable */
  mutable: boolean;
};

type ObjectArg =
  | {
      ImmOrOwnedObject: SuiObjectRef;
    }
  | {
      SharedObject: SharedObjectRef;
    }
  | {
      Receiving: SuiObjectRef;
    };
export type ObjectCallArg = {
  Object: ObjectArg;
};

// export type SuiAddressArg = TransactionArgument | SerializedBcs<any> | string | PureCallArg;
export type SuiObjectArg =
  | string
  | Parameters<typeof Inputs.ObjectRef>[0]
  | Parameters<typeof Inputs.SharedObjectRef>[0];

// export type SuiTxArg = SuiAddressArg | number | bigint | boolean;
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
  BorrowWithReferral = 'BorrowWithReferral',
  CreateReferralLink = 'CreateReferralLink',
  ClaimRevenueReferral = 'ClaimRevenueReferral',
  BindReferral = 'BindReferral',
  MigrateScoin = 'MigrateScoin',
  RepayWithBoost = 'RepayWithBoost',
  MigrateWusdcToUsdc = 'MigrateWusdcToUsdc',
  MergeVeSca = 'MergeVeSca',
  SplitVeSca = 'SplitVeSca',
}

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: any;
};
