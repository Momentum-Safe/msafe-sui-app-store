import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getClmmSdk } from './config';

export const getAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: Transaction = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: Transaction = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: Transaction = await clmmSdk.Position.closePositionTransactionPayload(txbParams);
  return txb;
};

export const getDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: Transaction = await clmmSdk.Position.removeLiquidityTransactionPayload(txbParams);
  return txb;
};

export const getClaimFeeAndMiningTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: Transaction = await clmmSdk.Rewarder.collectRewarderTransactionPayload(txbParams);
  return txb;
};
