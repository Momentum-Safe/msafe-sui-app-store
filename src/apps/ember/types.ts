import { NumStr } from '@firefly-exchange/library-sui';
import { SuiAddress, TransactionType } from '@msafe/sui3-utils';

export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';

export type DepositAssetIntentionData = { vaultID: SuiAddress; amount: NumStr };

export type MintSharesIntentionData = { vaultID: SuiAddress; numShares: NumStr };

export type RedeemSharesIntentionData = { vaultID: SuiAddress; numShares: NumStr };

export type CancelPendingWithdrawalRequestIntentionData = { vaultID: SuiAddress; sequenceNumber: NumStr };

export type EmberIntentionData =
  | DepositAssetIntentionData
  | MintSharesIntentionData
  | RedeemSharesIntentionData
  | CancelPendingWithdrawalRequestIntentionData;

export type DecodeResult = { txType: TransactionType; type: TransactionSubType; intentionData: EmberIntentionData };

export enum TransactionSubType {
  DepositAsset = 'DepositAsset',
  MintShares = 'MintShares',
  RedeemShares = 'RedeemShares',
  CancelPendingWithdrawalRequest = 'CancelPendingWithdrawalRequest',
}
