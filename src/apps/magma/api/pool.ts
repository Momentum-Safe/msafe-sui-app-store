import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getClmmSdk } from './config';

export const createPoolTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Pool.createPoolTransactionPayload(txbParams?.parameter);
  return txb;
};
