// eslint-disable-next-line import/no-extraneous-dependencies
import { CetusPeripherySDK } from '@cetusprotocol/cetus-periphery-sdk';
import { CetusClmmSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { clmmConfig, peripheryConfig } from './config';

const clmmSdk = new CetusClmmSDK(clmmConfig);

export const getFarmingAddLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingAddLiquidityTxb account: ', account);
  console.log('getFarmingAddLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.openPositionAddLiquidityStakePaylod(txbParams);
  return txb;
};

export const getFarmingIncreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingIncreaseLiquidityTxb account: ', account);
  console.log('getFarmingIncreaseLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.addLiquidityFixCoinPayload(txbParams);
  return txb;
};

export const getFarmingDecreaseLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingDecreaseLiquidityTxb account: ', account);
  console.log('getFarmingDecreaseLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingRemoveLiquidityTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingRemoveLiquidityTxb account: ', account);
  console.log('getFarmingRemoveLiquidityTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.removeLiquidityPayload(txbParams);
  return txb;
};

export const getFarmingClaimFeeAndRewardTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingClaimFeeAndRewardTxb account: ', account);
  console.log('getFarmingClaimFeeAndRewardTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.claimFeeAndClmmReward(txbParams);
  return txb;
};

export const getFarmingBatchHarvest = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingBatchHarvest account: ', account);
  console.log('getFarmingBatchHarvest suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.batchHarvestPayload(txbParams);
  return txb;
};

export const getFarmingStake = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingStake account: ', account);
  console.log('getFarmingStake suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.depositPayload(txbParams);
  return txb;
};

export const getFarmingUnstake = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getFarmingUnstake account: ', account);
  console.log('getFarmingUnstake suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.Farms.withdrawPayload(txbParams);
  return txb;
};
