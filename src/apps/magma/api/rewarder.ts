import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getClmmSdk } from './config';

export const getCollectRewarderTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Rewarder.collectRewarderTransactionPayload(txbParams?.parameter);
  return txb;
};

export const getBatchCollectRewarderTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(account);
  const txb: Transaction = await clmmSdk.Rewarder.batchCollectRewardePayload(txbParams?.parameter);
  return txb;
};
