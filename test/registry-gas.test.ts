import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { MSafeApps } from '@/apps/registry';
import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { Account, clientUrl } from './config';

const STEP_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function methodOwner(start: object, method: string): { [key: string]: (...args: unknown[]) => unknown } {
  let current: object | null = start;
  while (current && current !== Object.prototype) {
    if (Object.prototype.hasOwnProperty.call(current, method)) {
      return current as { [key: string]: (...args: unknown[]) => unknown };
    }
    current = Object.getPrototypeOf(current);
  }
  throw new Error(`Missing ${method}`);
}

function balanceOf(mist: string) {
  return { balance: { balance: mist } };
}

class JsonOverlapHelper implements IAppHelperInternal<{ tag: string }> {
  application = 'json-overlap';

  supportSDK = '@mysten/sui' as const;

  transaction = new Transaction();

  delayMs = 0;

  error: Error | undefined;

  calls = 0;

  async deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: { tag: string } }> {
    return {
      txType: TransactionType.Other,
      txSubType: 'overlap',
      intentionData: { tag: 'json' },
    };
  }

  async build(): Promise<Transaction> {
    this.calls += 1;
    if (this.delayMs > 0) {
      await sleep(this.delayMs);
    }
    if (this.error) {
      throw this.error;
    }
    return this.transaction;
  }
}

class GrpcOverlapHelper implements IAppHelperInternalGrpc<{ tag: string }> {
  application = 'grpc-overlap';

  supportSDK = '@mysten/sui-v2' as const;

  transaction = new Transaction();

  delayMs = 0;

  calls = 0;

  async deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: { tag: string } }> {
    return {
      txType: TransactionType.Other,
      txSubType: 'overlap',
      intentionData: { tag: 'grpc' },
    };
  }

  async build(): Promise<Transaction> {
    this.calls += 1;
    if (this.delayMs > 0) {
      await sleep(this.delayMs);
    }
    return this.transaction;
  }
}

function buildInput(account: WalletAccount) {
  return {
    network: 'sui:testnet' as SuiNetworks,
    txType: TransactionType.Other,
    txSubType: 'overlap',
    clientUrl,
    account,
    intentionData: { tag: 'overlap' },
  };
}

describe('registry gas balance overlap', () => {
  let jsonBalance: jest.SpyInstance;
  let grpcBalance: jest.SpyInstance;

  beforeEach(() => {
    jsonBalance = jest.spyOn(methodOwner(SuiClient.prototype, 'getBalance'), 'getBalance');
    const probe = new SuiGrpcClient({ network: 'testnet', baseUrl: clientUrl });
    grpcBalance = jest.spyOn(methodOwner(Object.getPrototypeOf(probe.core), 'getBalance'), 'getBalance');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    // Let an in-flight rebuild timer finish so the worker does not keep an open handle.
    await sleep(STEP_MS + 40);
  });

  it('returns the same transaction and overlaps the balance read with rebuild', async () => {
    const helper = new JsonOverlapHelper();
    helper.delayMs = STEP_MS;
    jsonBalance.mockImplementation(async () => {
      await sleep(STEP_MS);
      return balanceOf('1000000000');
    });

    const started = performance.now();
    const tx = await MSafeApps.fromHelpers([helper]).getAppHelper('json-overlap').build(buildInput(Account));
    const elapsed = performance.now() - started;

    expect(tx).toBe(helper.transaction);
    expect(tx.getData().sender).toBe(Account.address);
    expect(tx.getData().gasData.payment).toBeNull();
    expect(tx.getData().gasData.budget).toBeNull();
    expect(helper.calls).toBe(1);
    // Sequential awaits of two STEP_MS sleeps measured 2x. Overlap must stay near one step.
    expect(elapsed).toBeLessThan(STEP_MS * 1.6);
  });

  it('throws insufficient gas without waiting for a slow rebuild', async () => {
    const helper = new JsonOverlapHelper();
    helper.delayMs = STEP_MS * 2;
    helper.error = new Error('rebuild failed');
    jsonBalance.mockImplementation(async () => {
      await sleep(30);
      return balanceOf('1');
    });

    const started = performance.now();
    await expect(
      MSafeApps.fromHelpers([helper]).getAppHelper('json-overlap').build(buildInput(Account)),
    ).rejects.toThrow('Insufficient gas fee');
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(STEP_MS);
    expect(helper.calls).toBe(1);
  });

  it('prefers a balance read failure over a rebuild failure', async () => {
    const helper = new JsonOverlapHelper();
    helper.error = new Error('rebuild failed');
    jsonBalance.mockRejectedValue(new Error('rpc down'));

    await expect(
      MSafeApps.fromHelpers([helper]).getAppHelper('json-overlap').build(buildInput(Account)),
    ).rejects.toThrow('rpc down');
  });

  it('still throws the rebuild error when gas is sufficient', async () => {
    const helper = new JsonOverlapHelper();
    helper.error = new Error('rebuild failed');
    jsonBalance.mockResolvedValue(balanceOf('1000000000'));

    await expect(
      MSafeApps.fromHelpers([helper]).getAppHelper('json-overlap').build(buildInput(Account)),
    ).rejects.toThrow('rebuild failed');
  });

  it('overlaps the grpc balance read with rebuild and keeps the same transaction', async () => {
    const helper = new GrpcOverlapHelper();
    helper.delayMs = STEP_MS;
    grpcBalance.mockImplementation(async () => {
      await sleep(STEP_MS);
      return balanceOf('1000000000');
    });

    const started = performance.now();
    const tx = await MSafeApps.fromHelpers([helper]).getAppHelper('grpc-overlap').build(buildInput(Account));
    const elapsed = performance.now() - started;

    expect(tx).toBe(helper.transaction);
    expect(tx.getData().sender).toBe(Account.address);
    expect(tx.getData().gasData.payment).toBeNull();
    expect(tx.getData().gasData.budget).toBeNull();
    expect(elapsed).toBeLessThan(STEP_MS * 1.6);
  });
});
