import { DepositParams, WithdrawParams } from '@nemoprotocol/vaults-sdk';

export type DepositVaultIntentionData = DepositParams;

export type WithdrawVaultIntentionData = WithdrawParams;

export type NemoIntentionData = DepositVaultIntentionData | WithdrawVaultIntentionData;

export enum TransactionSubType {
  VaultDeposit = 'VaultDeposit',
  VaultWithdraw = 'VaultWithdraw',
}

export type SuiNetworks = 'sui:devnet' | 'sui:testnet' | 'sui:localnet' | 'sui:mainnet';
