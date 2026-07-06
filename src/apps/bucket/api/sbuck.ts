import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { buildSBUCKClaimTx, buildSBUCKDepositTx, buildSBUCKUnstakeTx, buildSBUCKWithdrawTx } from 'bucket-protocol-sdk';

import {
  SBUCKClaimIntentionData,
  SBUCKDepositIntentionData,
  SBUCKUnstakeIntentionData,
  SBUCKWithdrawIntentionData,
} from '@/apps/bucket/types/api';
import { SuiNetworks } from '@/types';

import { getBucketClient } from './config';
import { toBucketSdkTransaction } from '../utils/transaction';

export const getSBUCKDepositTx = async (
  txbParams: SBUCKDepositIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { coinType, amount, isStake } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildSBUCKDepositTx(client, toBucketSdkTransaction(tx), coinType, amount, account.address, isStake);

  return tx;
};

export const getSBUCKUnstakeTx = async (
  txbParams: SBUCKUnstakeIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { stakeProofs, amount, isStake, toBuck } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildSBUCKUnstakeTx(client, toBucketSdkTransaction(tx), stakeProofs, amount, account.address, isStake, toBuck);

  return tx;
};

export const getSBUCKWithdrawTx = async (
  txbParams: SBUCKWithdrawIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { amount } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildSBUCKWithdrawTx(client, toBucketSdkTransaction(tx), amount, account.address);

  return tx;
};

export const getSBUCKClaimTx = async (
  txbParams: SBUCKClaimIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { stakeProofs } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildSBUCKClaimTx(client, toBucketSdkTransaction(tx), stakeProofs, account.address);

  return tx;
};
