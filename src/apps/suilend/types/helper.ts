export type SuilendIntentionData =
  | DepositIntentionData
  | WithdrawIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | ClaimIntentionData
  | ClaimAndDepositIntentionData;

export interface WithdrawIntentionData {
  coinType: string;
  value: string;
}

export interface BorrowIntentionData {
  coinType: string;
  value: string;
}

export interface ClaimIntentionData {
  value: Record<string, string>;
}

export interface ClaimAndDepositIntentionData {
  value: Record<string, string>;
}

export interface DepositIntentionData {
  coinType: string;
  value: string;
}

export interface RepayIntentionData {
  coinType: string;
  value: string;
}
