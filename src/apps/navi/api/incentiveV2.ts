import type { SuiClient } from '@mysten/sui.js/client';
import type { TransactionBlock } from '@mysten/sui.js/transactions';
import {
  depositCoin,
  withdrawCoin,
  repayDebt,
  borrowCoin,
  claimAllRewardsPTB,
  claimAllRewardsResupplyPTB,
} from 'navi-sdk';
import { PoolConfig } from 'navi-sdk/dist/types';

export async function depositToken(txb: TransactionBlock, pool: PoolConfig, coinObject: any, amount: number) {
  await depositCoin(txb as any, pool, coinObject, amount);
  return txb;
}

export async function withdrawToken(txb: TransactionBlock, pool: PoolConfig, amount: number, userAddress: string) {
  const [coin] = await withdrawCoin(txb as any, pool, amount);
  txb.transferObjects([coin as any], txb.pure(userAddress));
  return txb;
}

export async function borrowToken(tx: TransactionBlock, pool: PoolConfig, amount: number, userAddress: string) {
  const [borrowedCoin] = await borrowCoin(tx as any, pool, amount);
  tx.transferObjects([borrowedCoin as any], tx.pure.address(userAddress));

  return tx;
}

export async function repayToken(txb: TransactionBlock, pool: PoolConfig, coinObject: any, amount: number) {
  await repayDebt(txb as any, pool, coinObject, amount);
  return txb;
}

export async function claimReward(client: SuiClient, userAddress: string) {
  const txb = await claimAllRewardsPTB(client as any, userAddress);
  return txb as any;
}

export async function claimSupply(client: SuiClient, userAddress: string) {
  const txb = await claimAllRewardsResupplyPTB(client as any, userAddress);
  return txb as any;
}
