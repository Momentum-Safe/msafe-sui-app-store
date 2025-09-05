import type { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  depositCoinPTB,
  withdrawCoinPTB,
  repayCoinPTB,
  borrowCoinPTB,
  claimLendingRewardsPTB,
  Pool,
  getUserAvailableLendingRewards,
} from '@naviprotocol/lending';

export async function depositToken(txb: Transaction, pool: Pool, coinObject: any, amount: number) {
  await depositCoinPTB(txb as any, pool, coinObject, { amount });
  return txb;
}

export async function withdrawToken(txb: Transaction, pool: Pool, amount: number, userAddress: string) {
  const [coin] = await withdrawCoinPTB(txb as any, pool, amount);
  txb.transferObjects([coin as any], txb.pure.address(userAddress));
  return txb;
}

export async function borrowToken(tx: Transaction, pool: Pool, amount: number, userAddress: string) {
  const [borrowedCoin] = await borrowCoinPTB(tx as any, pool, amount);
  tx.transferObjects([borrowedCoin as any], tx.pure.address(userAddress));

  return tx;
}

export async function repayToken(txb: Transaction, pool: Pool, coinObject: any, amount: number) {
  await repayCoinPTB(txb as any, pool, coinObject, { amount });
  return txb;
}

export async function claimReward(client: SuiClient, userAddress: string) {
  const txb = new Transaction();
  const rewards = await getUserAvailableLendingRewards(userAddress, { client });

  await claimLendingRewardsPTB(txb, rewards);

  return txb;
}

export async function claimSupply(client: SuiClient, userAddress: string) {
  const txb = new Transaction();
  const rewards = await getUserAvailableLendingRewards(userAddress, { client });

  await claimLendingRewardsPTB(txb, rewards, {
    customCoinReceive: { type: 'depositNAVI', depositNAVI: { fallbackReceiveAddress: userAddress } },
  });
  return txb;
}
