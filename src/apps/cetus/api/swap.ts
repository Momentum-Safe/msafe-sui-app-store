import { TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getClmmSdk } from './config';

export const getSwapRouterTxb = async (
  createTxParams: any,
  slippage: number,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const clmmSdk = getClmmSdk(network, account);
  const allCoinAsset = await clmmSdk.getOwnerCoinAssets(account.address);
  const txb: TransactionBlock = await TransactionUtil.buildAggregatorSwapTransaction(
    clmmSdk,
    createTxParams,
    allCoinAsset,
    '',
    slippage,
  );
  return txb;
};
