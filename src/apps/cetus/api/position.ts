import { CetusClmmSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { clmmConfig } from './config';

const clmmSdk = new CetusClmmSDK(clmmConfig);

export const getAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getAddLiquidityTxb suiClient: ', suiClient);
  console.log('getAddLiquidityTxb txbParams: ', txbParams);
  clmmSdk.senderAddress = account.address;
  const txb: TransactionBlock = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getIncreaseLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  console.log('getIncreaseLiquidityTxb txbParams: ', txbParams);
  const txb: TransactionBlock = await clmmSdk.Position.createAddLiquidityFixTokenPayload(
    txbParams?.parameter,
    txbParams?.gasEstimateArg,
  );
  return txb;
};

export const getRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getRemoveLiquidityTxb txbParams: ', txbParams);
  console.log('getRemoveLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const txb: TransactionBlock = await clmmSdk.Position.closePositionTransactionPayload(txbParams);
  return txb;
};

export const getDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getDecreaseLiquidityTxb txbParams: ', txbParams);
  console.log('getDecreaseLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const txb: TransactionBlock = await clmmSdk.Position.removeLiquidityTransactionPayload(txbParams);
  return txb;
};

export const getClaimFeeAndMiningTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getClaimFeeAndMiningTxb txbParams: ', txbParams);
  console.log('getClaimFeeAndMiningTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const txb: TransactionBlock = await clmmSdk.Rewarder.collectRewarderTransactionPayload(txbParams);
  return txb;
};
