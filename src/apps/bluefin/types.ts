import { TransactionType } from '@msafe/sui3-utils';

export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: any;
};

export interface BluefinIntentionData {
  txbParams: any;
  action: string;
}

export enum TransactionSubType {
  OpenAndAddLiquidity = 'OpenAndAddLiquidity',
  ProvideLiquidity = 'ProvideLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  ClosePosition = 'ClosePosition',
  CollectFee = 'CollectFee',
  CollectRewards = 'CollectRewards',
  CollectFeeAndRewards = 'CollectFeeAndRewards',
}
