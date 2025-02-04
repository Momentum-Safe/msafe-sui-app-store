import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { buildTankClaimTx, buildTankDepositTx, buildTankWithdrawTx } from 'bucket-protocol-sdk';

import { TankClaimIntentionData, TankDepositIntentionData, TankWithdrawIntentionData } from '@/apps/bucket/types/api';
import { SuiNetworks } from '@/types';

import { getBucketClient } from './config';

export const getTankDepositTx = async (
  txbParams: TankDepositIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { coinType, amount } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildTankDepositTx(client, tx, coinType, amount, account.address);

  return tx;
};

export const getTankWithdrawTx = async (
  txbParams: TankWithdrawIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { coinType, amount } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildTankWithdrawTx(client, tx, coinType, amount, account.address);

  return tx;
};

export const getTankClaimTx = async (
  txbParams: TankClaimIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { coinType } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildTankClaimTx(client, tx, coinType, account.address);

  return tx;
};
