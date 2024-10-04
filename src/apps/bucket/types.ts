export interface BucketIntentionData {
  txbParams: any;
  action: string;
}

export enum TransactionSubType {
  PsmIn = 'PsmIn',
  PsmOut = 'PsmOut',
}
