import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import VolatileVaultsSDK, { vaults_mainnet } from 'haedal-vault-sdk';

import { SuiNetworks } from '@/types';

import { getClmmSdk, getFarmsSdk, getVaultsSdk } from './config';

export const getVaultReedeem = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const vaultsSdk = await getVaultsSdk(network, account);
  const tx = new Transaction();
  tx.setSender(account.address);
  vaultsSdk.Vest.buildRedeemPayload(txbParams.params, tx);
  return tx;
};

export const getVolatileVaultReedeem = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const volatileVaultsSdk = new VolatileVaultsSDK(vaults_mainnet);
  volatileVaultsSdk.senderAddress = account.address;
  const tx = new Transaction();
  tx.setSender(account.address);
  await volatileVaultsSdk?.Vest.buildRedeemPayload(txbParams.params, tx);
  return tx;
};

export const getClmmPosReedeem = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = await getClmmSdk(network, account);
  const tx = new Transaction();
  clmmSdk?.Vest.buildRedeemPayload(txbParams.params, tx);
  return tx;
};

export const getFarmsPosReedeem = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = await getClmmSdk(network, account);
  const farmsSdk = await getFarmsSdk(network, account);
  const tx = new Transaction();
  const pos = await farmsSdk!.Farms.withdrawReturnPayload(txbParams.withdrawParams, tx);
  clmmSdk!.Vest.buildRedeemPayload(
    txbParams.redeemParms.map((item: any) => ({
      ...item,
      clmm_position_id: pos,
    })),
    tx,
  );
  farmsSdk!.Farms.depositPayload(
    {
      ...txbParams.depositParams,
      clmm_position_id: pos,
    },
    tx,
  );
  return tx;
};

export const getPosReedeem = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  if (txbParams.type === 'clmm') {
    return getClmmPosReedeem(txbParams, account, network);
  }
  if (txbParams.type === 'farms') {
    return getFarmsPosReedeem(txbParams, account, network);
  }
  if (txbParams.type === 'vaults') {
    return getVaultReedeem(txbParams, account, network);
  }
  if (txbParams.type === 'haedalVaults') {
    return getVolatileVaultReedeem(txbParams, account, network);
  }
  return getClmmPosReedeem(txbParams, account, network);
};
