import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getPeripherySdk } from './config';

export const getFarmingAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.openPositionAddLiquidityStakePaylod(txbParams);
  return txb;
};

export const getFarmingIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.addLiquidityFixCoinPayload(txbParams);
  return txb;
};

export const getFarmingDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingClaimFeeAndRewardTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.claimFeeAndClmmReward(txbParams);
  return txb;
};

export const getFarmingHarvest = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  console.log('getFarmingHarvest txbParams: ', txbParams);
  const txb: TransactionBlock = await peripherySdk.Farms.harvestPayload(txbParams);
  return txb;
};

export const getFarmingBatchHarvest = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const params: any = Object.values(txbParams);
  console.log('getFarmingBatchHarvest params: ', params);
  const txb: TransactionBlock = await peripherySdk.Farms.batchHarvestPayload(params);
  return txb;
};

export const getFarmingStake = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.depositPayload(txbParams);
  return txb;
};

export const getFarmingUnstake = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.Farms.withdrawPayload(txbParams);
  return txb;
};
