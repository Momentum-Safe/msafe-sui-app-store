import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getClmmSdk } from './config';

export const getAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: TransactionBlock = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: TransactionBlock = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: TransactionBlock = await clmmSdk.Position.closePositionTransactionPayload(txbParams);
  return txb;
};

export const getDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: TransactionBlock = await clmmSdk.Position.removeLiquidityTransactionPayload(txbParams);
  return txb;
};

export const getClaimFeeAndMiningTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const txb: TransactionBlock = await clmmSdk.Rewarder.collectRewarderTransactionPayload(txbParams);
  return txb;
};
