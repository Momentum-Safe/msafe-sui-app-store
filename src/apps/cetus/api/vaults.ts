import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getVaultsSdk } from './config';

export const getAddVaultsPositionPayload = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const vaultsSdk = getVaultsSdk(network, account);
  const txb: Transaction = await vaultsSdk.Vaults.deposit(txbParams);
  return txb;
};

export const getRemoveVaultsPositionPayload = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const vaultsSdk = getVaultsSdk(network, account);
  const txb: Transaction = await vaultsSdk.Vaults.withdraw(txbParams);
  return txb;
};
