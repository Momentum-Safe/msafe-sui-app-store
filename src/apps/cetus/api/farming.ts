import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getPeripherySdk } from './config';

export const getFarmingAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.openPositionAddLiquidityStakePaylod(txbParams);
  return txb;
};

export const getFarmingIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.addLiquidityFixCoinPayload(txbParams);
  return txb;
};

export const getFarmingDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingClaimFeeAndRewardTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.claimFeeAndClmmReward(txbParams);
  return txb;
};

export const getFarmingHarvest = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.harvestPayload(txbParams);
  return txb;
};

export const getFarmingBatchHarvest = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const params: any = Object.values(txbParams);
  const txb: Transaction = await peripherySdk.Farms.batchHarvestPayload(params);
  return txb;
};

export const getFarmingStake = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.depositPayload(txbParams);
  return txb;
};

export const getFarmingUnstake = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.Farms.withdrawPayload(txbParams);
  return txb;
};
