export interface StakeIntentionData {
  amount: string;
  outCoinType: string;
}

export interface StakeAndDepositIntentionData {
  amount: string;
  outCoinType: string;
}

export interface ConvertIntentionData {
  amount: string;
  inCoinType: string;
  outCoinType: string;
}

export interface ConvertAndDepositIntentionData {
  amount: string;
  inCoinType: string;
  outCoinType: string;
}

export interface UnstakeIntentionData {
  amount: string;
  inCoinType: string;
}

export type SpringSuiIntentionData =
  | StakeIntentionData
  | StakeAndDepositIntentionData
  | ConvertIntentionData
  | ConvertAndDepositIntentionData
  | UnstakeIntentionData;
