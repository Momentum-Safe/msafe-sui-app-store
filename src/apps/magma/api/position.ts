import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getClmmSdk } from './config';

export const getClosePositionTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.closePositionTransactionPayload(txbParams);
  return txb;
};

export const getAddLiquidityTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getOpenAddLiquidityWithProtectionTxb = async (
  txbParams: any,
  account: WalletAccount,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.openPositionWithLiquidityByFixCoinWithProtection(
    txbParams?.parameter,
  );
  return txb;
};

export const getAddLiquidityWithProtection = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.addLiquidityByFixCoinWithProtection(txbParams?.parameter);
  return txb;
};

export const getRemoveLiquidityTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.removeLiquidityTransactionPayload(txbParams);
  return txb;
};
