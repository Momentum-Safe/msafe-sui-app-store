import { HexToUint8Array } from '@msafe/sui3-utils';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';
import {
  depositCoinPTB,
  getPool,
  borrowCoinPTB,
  repayCoinPTB,
  withdrawCoinPTB,
  claimLendingRewardsPTB,
  getUserAvailableLendingRewards,
} from '@naviprotocol/lending';

import { Decoder } from '@/apps/navi/decoder';
import { NAVIIntentionData, NAVIAppHelper } from '@/apps/navi/helper';
import { ClaimRewardIntentionData } from '@/apps/navi/intentions/claim-reward';
import { EntryBorrowIntentionData } from '@/apps/navi/intentions/entry-borrow';
import { EntryDepositIntentionData } from '@/apps/navi/intentions/entry-deposit';
import { EntryRepayIntentionData } from '@/apps/navi/intentions/entry-repay';
import { EntryWithdrawIntentionData } from '@/apps/navi/intentions/entry-withdraw';
import { EntryMultiDepositIntentionData } from '@/apps/navi/intentions/multi-deposit';
import { TransactionSubType } from '@/apps/navi/types';

import { TestSuite } from './testSuite';

(() => {
  if ((globalThis.fetch as any).isWraped) {
    return;
  }
  const _fetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await _fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Host: 'app.naviprotocol.io',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        Referer: 'https://app.naviprotocol.io/',
        origin: 'app.naviprotocol.io',
      },
    });
    (globalThis.fetch as any).isWraped = true;
    return response;
  };
})();

const address = '0xfaba86400d9cc1d144bbc878bc45c4361d53a16c942202b22db5d26354801e8e';
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

const testWallet: WalletAccount = {
  address: '0xbb63274d2bd428b460d01dbae9a43ecd2a791f8d6624968c4d670055354ebcff',
  publicKey: HexToUint8Array('AL49gTnvhZ3+MB9MjKx0o/idjwa50+32wLizXKKHXkmo'),
  chains: [SUI_MAINNET_CHAIN],
  features: [],
};

const helper = new NAVIAppHelper();

describe('Navi App', () => {
  let ts: TestSuite<NAVIIntentionData>;

  beforeEach(async () => {
    ts = new TestSuite(testWallet, 'sui:mainnet', helper);
  });

  it('should deposit sui with app context', async () => {
    const tx = new Transaction();
    await depositCoinPTB(tx, 0, tx.splitCoins(tx.gas, [tx.pure.u64(500000)]));
    tx.setSender(testWallet.address);
    const txBytes = await tx.build({ client });
    const txBytes64 = Buffer.from(txBytes).toString('base64');
    const appContext = {
      content: txBytes64,
      scene: 'deposit',
    };

    const intentionData = await helper.deserialize({ transaction: tx, appContext } as any);

    ts.setIntention(intentionData);

    const txb = await ts.voteAndExecuteIntention();

    expect(txb).toBeDefined();
    expect(txb.tx.getData().sender).toBe(testWallet.address);
    expect(txb.tx.getData().version).toBe(2);
  }, 15000);

  it('Test deposit deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
    const pool = await getPool(0);
    await depositCoinPTB(tx as any, pool, toDeposit, {
      amount,
    });

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryDepositIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryDeposit);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.id);
  });

  it('Test borrow deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const pool = await getPool(0);
    await borrowCoinPTB(tx as any, pool, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryBorrowIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryBorrow);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.id);
  });

  it('Test repay deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const pool = await getPool(0);
    const [toRepay] = tx.splitCoins(tx.gas, [amount]);
    await repayCoinPTB(tx as any, pool, toRepay, {
      amount,
    });

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryRepayIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryRepay);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.id);
  });

  it('Test withdraw deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const pool = await getPool(0);
    await withdrawCoinPTB(tx as any, pool, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryWithdrawIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryWithdraw);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.assetId).toBe(pool.id);
  });

  it('Test multi-deposit deserialize', async () => {
    const tx = new Transaction();
    const amount = 10000000000;
    const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
    const pool = await getPool(0);
    await depositCoinPTB(tx as any, pool, toDeposit, {
      amount,
    });
    await depositCoinPTB(tx as any, pool, toDeposit, {
      amount,
    });

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as EntryMultiDepositIntentionData;

    expect(result.type).toBe(TransactionSubType.EntryMultiDeposit);
    expect(intentionData.list[0].amount).toBe(amount);
    expect(intentionData.list[0].assetId).toBe(pool.id);
    expect(intentionData.list[1].amount).toBe(amount);
    expect(intentionData.list[1].assetId).toBe(pool.id);
  });

  it('Test claim reward deserialize', async () => {
    const rewards = await getUserAvailableLendingRewards(address);
    const tx = new Transaction();
    await claimLendingRewardsPTB(tx, rewards);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();
    const intentionData = result.intentionData as ClaimRewardIntentionData;

    expect(result.type).toBe(TransactionSubType.ClaimReward);
    expect(intentionData.type).toBe('claim_reward');
  });
});
