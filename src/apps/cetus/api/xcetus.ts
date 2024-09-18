// eslint-disable-next-line import/no-extraneous-dependencies
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { getPeripherySdk } from './config';

export const getXcetusConvertTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.convertPayload(txbParams);
  return txb;
};

export const getXcetusRedeemLockTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.redeemLockPayload(txbParams);
  return txb;
};

export const getXcetusClaimingStakeRewardsTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
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
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.cancelRedeemPayload(txbParams);
  return txb;
};

export const getXcetusRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<TransactionBlock> => {
  const peripherySdk = getPeripherySdk(network, account);
  const txb: TransactionBlock = await peripherySdk.XCetusModule.redeemPayload(txbParams);
  return txb;
};
