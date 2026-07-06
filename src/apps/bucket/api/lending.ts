import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { buildBorrowTx, buildCloseTx, buildRepayTx, buildWithdrawTx } from 'bucket-protocol-sdk';

import {
  BorrowIntentionData,
  CloseIntentionData,
  RepayIntentionData,
  WithdrawIntentionData,
} from '@/apps/bucket/types/api';
import { SuiNetworks } from '@/types';

import { getBucketClient } from './config';
import { toBucketSdkTransaction } from '../utils/transaction';

export const getBorrowTx = async (
  txbParams: BorrowIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { collateralType, collateralAmount, borrowAmount, insertionPlace, strapId } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildBorrowTx(
    client,
    toBucketSdkTransaction(tx),
    collateralType,
    collateralAmount,
    borrowAmount,
    account.address,
    insertionPlace,
    strapId,
  );

  return tx;
};

export const getWithdrawTx = async (
  txbParams: WithdrawIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { collateralType, withdrawAmount, insertionPlace, strapId } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildWithdrawTx(
    client,
    toBucketSdkTransaction(tx),
    collateralType,
    withdrawAmount,
    account.address,
    insertionPlace,
    strapId,
  );

  return tx;
};

export const getRepayTx = async (
  txbParams: RepayIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { collateralType, repayAmount, withdrawAmount, isSurplus, insertionPlace, strapId } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildRepayTx(
    client,
    toBucketSdkTransaction(tx),
    collateralType,
    repayAmount,
    withdrawAmount,
    account.address,
    isSurplus,
    insertionPlace,
    strapId,
  );

  return tx;
};

export const getCloseTx = async (
  txbParams: CloseIntentionData,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  const { collateralType, recipient, strapId } = txbParams;

  const tx = new Transaction();
  const client = getBucketClient(network, account);
  await buildCloseTx(client, toBucketSdkTransaction(tx), collateralType, recipient, strapId);

  return tx;
};
