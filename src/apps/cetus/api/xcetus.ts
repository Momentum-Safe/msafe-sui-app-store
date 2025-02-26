// eslint-disable-next-line import/no-extraneous-dependencies
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getXcetusSdk } from './config';

export const getXcetusConvertTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const xcetusSdk = getXcetusSdk(network, account);
  const txb: Transaction = await xcetusSdk.XCetusModule.convertPayload(txbParams);
  return txb;
};

export const getXcetusRedeemLockTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const xcetusSdk = getXcetusSdk(network, account);
  const txb: Transaction = await xcetusSdk.XCetusModule.redeemLockPayload(txbParams);
  return txb;
};

export const getXcetusClaimingStakeRewardsTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const xcetusSdk = getXcetusSdk(network, account);
  const txb: Transaction = await xcetusSdk.XCetusModule.redeemDividendV3Payload(
    txbParams.veNftId,
    txbParams.rewardList,
  );
  return txb;
};

export const getXcetusCancelRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const xcetusSdk = getXcetusSdk(network, account);
  const txb: Transaction = await xcetusSdk.XCetusModule.cancelRedeemPayload(txbParams);
  return txb;
};

export const getXcetusRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const xcetusSdk = getXcetusSdk(network, account);
  const txb: Transaction = await xcetusSdk.XCetusModule.redeemPayload(txbParams);
  return txb;
};
