import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { depositCoin, pool, borrowCoin, repayDebt, withdrawCoin, claimAllRewardsPTB } from 'navi-sdk';

import { Decoder } from '@/apps/navi/decoder';
import { ClaimRewardIntentionData } from '@/apps/navi/intentions/claim-reward';
import { EntryBorrowIntentionData } from '@/apps/navi/intentions/entry-borrow';
import { EntryDepositIntentionData } from '@/apps/navi/intentions/entry-deposit';
import { EntryRepayIntentionData } from '@/apps/navi/intentions/entry-repay';
import { EntryWithdrawIntentionData } from '@/apps/navi/intentions/entry-withdraw';
import { EntryMultiDepositIntentionData } from '@/apps/navi/intentions/multi-deposit';
import { TransactionSubType } from '@/apps/navi/types';

const address = '0xfaba86400d9cc1d144bbc878bc45c4361d53a16c942202b22db5d26354801e8e';
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

describe('Navi App', () => {
  it('Test deposit deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
    await depositCoin(tx as any, pool.Sui, toDeposit, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryDepositIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryDeposit);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.Sui.assetId);
  });

  it('Test borrow deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    await borrowCoin(tx as any, pool.Sui, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryBorrowIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryBorrow);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.Sui.assetId);
  });

  it('Test repay deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const [toRepay] = tx.splitCoins(tx.gas, [amount]);
    await repayDebt(tx as any, pool.Sui, toRepay, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryRepayIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryRepay);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.Sui.assetId);
  });

  it('Test withdraw deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    await withdrawCoin(tx as any, pool.Sui, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryWithdrawIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryWithdraw);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.Sui.assetId);
  });

  it('Test multi-deposit deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
    await depositCoin(tx as any, pool.Sui, toDeposit, amount);
    await depositCoin(tx as any, pool.Sui, toDeposit, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryMultiDepositIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryMultiDeposit);
    expect(intentionData.list[0].amount).toBe(amount);
    expect(intentionData.list[0].assetId).toBe(pool.Sui.assetId);
    expect(intentionData.list[1].amount).toBe(amount);
    expect(intentionData.list[1].assetId).toBe(pool.Sui.assetId);
  });

  // it('Test claim reward deserialize', async () => {
  //   const tx = await claimAllRewardsPTB(client as any, address);

  //   const decoder = new Decoder(tx as any);
  //   const result = decoder.decode();
  //   const intentionData = result.intentionData as ClaimRewardIntentionData;

  //   expect(result.type).toBe(TransactionSubType.ClaimReward);
  //   expect(intentionData.type).toBe('claim_reward');
  // });
});
