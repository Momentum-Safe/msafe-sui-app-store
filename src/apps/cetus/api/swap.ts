import { TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getClmmSdk } from './config';

export const getSwapRouterTxb = async (
  createTxParams: any,
  slippage: number,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const clmmSdk = getClmmSdk(network, account);
  const allCoinAsset = await clmmSdk.getOwnerCoinAssets(account.address);
  const txb: Transaction = await TransactionUtil.buildAggregatorSwapTransaction(
    clmmSdk,
    createTxParams,
    allCoinAsset,
    '',
    slippage,
  );
  return txb;
};
