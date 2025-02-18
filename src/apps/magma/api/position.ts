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

export const getAddLiquidityWithProtection = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.createAddLiquidityFixTokenWithProtectionPayload(txbParams?.parameter);
  return txb;
};

export const getRemoveLiquidityTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Position.removeLiquidityTransactionPayload(txbParams);
  return txb;
};
