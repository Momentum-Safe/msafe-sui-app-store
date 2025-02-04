export interface CloseIntentionData {
  collateralType: string;
  recipient: string;
  strapId?: string;
}

export interface BorrowIntentionData {
  collateralType: string;
  collateralAmount: string;
  borrowAmount: string;
  insertionPlace?: string;
  strapId?: string;
}

export interface WithdrawIntentionData {
  collateralType: string;
  withdrawAmount: string;
  insertionPlace?: string;
  strapId?: string;
}

export interface RepayIntentionData {
  collateralType: string;
  repayAmount: string;
  withdrawAmount: string;
  isSurplus: boolean;
  insertionPlace?: string;
  strapId?: string;
}

export interface PsmIntentionData {
  coinType: string;
  amount: string;
  buckToCoin: boolean;
}

export interface SBUCKDepositIntentionData {
  coinType: string;
  amount: string;
  isStake: boolean;
}

export interface SBUCKUnstakeIntentionData {
  stakeProofs: string[];
  amount: string;
  isStake: boolean;
  toBuck: boolean;
}

export interface SBUCKWithdrawIntentionData {
  amount: string;
}

export interface SBUCKClaimIntentionData {
  stakeProofs: string[];
}

export interface TankDepositIntentionData {
  coinType: string;
  amount: string;
}

export interface TankWithdrawIntentionData {
  coinType: string;
  amount: string;
}

export interface TankClaimIntentionData {
  coinType: string;
}
