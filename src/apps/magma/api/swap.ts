import { restituteMsafeFastRouterSwapParams } from '@magmaprotocol/aggregator-sdk';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { getAggregatorSdk } from './config';

export const getSwapRouterTxb = async (txbParams: any, account: WalletAccount): Promise<Transaction> => {
  const aggregatorSdk = getAggregatorSdk(account);
  const txb = new Transaction();
  await aggregatorSdk.fastRouterSwap({
    ...txbParams,
    routers: restituteMsafeFastRouterSwapParams(txbParams.routers),
    txb,
  });
  return txb;
};
