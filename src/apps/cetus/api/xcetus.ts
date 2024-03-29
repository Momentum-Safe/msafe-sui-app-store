// eslint-disable-next-line import/no-extraneous-dependencies
import { CetusPeripherySDK } from '@cetusprotocol/cetus-periphery-sdk';
import { CetusClmmSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { clmmConfig, peripheryConfig } from './config';

const clmmSdk = new CetusClmmSDK(clmmConfig);

export const getXcetusConvertTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getXcetusConvertTxb account: ', account);
  console.log('getXcetusConvertTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.convertPayload(txbParams);
  return txb;
};

export const getXcetusRedeemLockTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getXcetusRedeemLockTxb account: ', account);
  console.log('getXcetusRedeemLockTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.redeemLockPayload(txbParams);
  return txb;
};

export const getXcetusClaimingStakeRewardsTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getXcetusClaimingStakeRewardsTxb account: ', account);
  console.log('getXcetusClaimingStakeRewardsTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.redeemDividendV2Payload(
    txbParams.venft_id,
    txbParams.bonus_types,
    txbParams.xTokenType,
  );
  return txb;
};

export const getXcetusCancelRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getXcetusCancelRedeemTxb account: ', account);
  console.log('getXcetusCancelRedeemTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.cancelRedeemPayload(txbParams);
  return txb;
};

export const getXcetusRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  suiClient?: any,
): Promise<TransactionBlock> => {
  console.log('getXcetusRedeemTxb account: ', account);
  console.log('getXcetusRedeemTxb suiClient: ', suiClient);
  clmmSdk.senderAddress = account.address;
  const peripherySdk = new CetusPeripherySDK(peripheryConfig, clmmSdk);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.redeemPayload(txbParams);
  return txb;
};
