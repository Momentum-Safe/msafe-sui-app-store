export enum TransactionSubType {
  MINT = 'mint',
  REDEEM = 'redeem',
}

export interface MintIntentionData {
  amount: string;
}

export interface RedeemIntentionData {
  amount: string;
}

export type StSuiIntentionData = MintIntentionData | RedeemIntentionData;
