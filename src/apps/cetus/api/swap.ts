import { restituteMsafeFastRouterSwapParams } from '@cetusprotocol/aggregator-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getAggregatorSdk } from './config';

export const getSwapRouterTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const aggregatorSdk = getAggregatorSdk(network, account);
  const txb = new Transaction();
  await aggregatorSdk.fastRouterSwap({
    ...txbParams,
    routers: restituteMsafeFastRouterSwapParams(txbParams.routers),
    txb,
  });
  return txb;
};
