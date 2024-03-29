import { CetusClmmSDK, TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { clmmConfig } from './config';

const clmmSdk = new CetusClmmSDK(clmmConfig);

export const getSwapRouterTxb = async (
  createTxParams: any,
  slippage: number,
  account: string,
  account2?: any,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getSwapRouterTxb account2: ', account2);
  console.log('getSwapRouterTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account;
  const allCoinAsset = await clmmSdk.getOwnerCoinAssets(account);
  const txb: TransactionBlock = await TransactionUtil.buildAggregatorSwapTransaction(
    clmmSdk,
    createTxParams,
    allCoinAsset,
    '',
    slippage,
  );
  return txb;
};
