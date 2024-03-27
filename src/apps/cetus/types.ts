export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export interface CetusIntentionData {
  payloadParams: any;
  action: string;
}

export enum TransactionSubType {
  CetusSwap = 'CetusSwap',
}
