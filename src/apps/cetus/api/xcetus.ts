// eslint-disable-next-line import/no-extraneous-dependencies
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getPeripherySdk } from './config';

export const getXcetusConvertTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.XCetusModule.convertPayload(txbParams);
  return txb;
};

export const getXcetusRedeemLockTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.XCetusModule.redeemLockPayload(txbParams);
  return txb;
};

export const getXcetusClaimingStakeRewardsTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.XCetusModule.redeemDividendV3Payload(
    txbParams.phases,
    txbParams.venft_id,
    txbParams.bonus_types,
    txbParams.bonus_types_v2,
    txbParams.xTokenType,
  );
  return txb;
};

export const getXcetusCancelRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.XCetusModule.cancelRedeemPayload(txbParams);
  return txb;
};

export const getXcetusRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: Transaction = await peripherySdk.XCetusModule.redeemPayload(txbParams);
  return txb;
};
