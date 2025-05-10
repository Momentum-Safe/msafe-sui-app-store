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
  const tx = new Transaction();
  tx.setSender(account.address);
  await vaultsSdk.Vaults.deposit(txbParams, tx);
  return tx;
};

export const getRemoveVaultsPositionPayload = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const vaultsSdk = getVaultsSdk(network, account);
  const tx = new Transaction();
  await vaultsSdk.Vaults.withdraw(txbParams, tx);
  return tx;
};
