import { MmtSDK } from '@mmt-finance/clmm-sui-sdk';
import { Transaction } from '@mysten/sui/transactions';

import { assertMsafeTransactionSnapshot, withoutMvr } from '@/apps/mmt-dex/utils/msafeTransaction';

const SUI = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC';
const POOL = '0x455cf8d2ac91e7cb883f515874af750ed3cd18195c970b7a2d46235ac2b0c388';

function buildSwapTransaction(disableMvr: boolean) {
  const sdk = new MmtSDK({ network: 'mainnet' });
  const tx = new Transaction();
  const [inputCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(1n)]);
  const params = {
    txb: tx,
    pool: {
      poolId: POOL,
      tokenXType: SUI,
      tokenYType: USDC,
      tickSpacing: 40,
      isStable: false,
    },
    amount: 1n,
    inputCoin,
    isXtoY: true,
    limitSqrtPrice: 1n,
  };
  sdk.Pool.swap(disableMvr ? withoutMvr(params) : params);
  return tx;
}

describe('mmt-dex MSafe transaction snapshot', () => {
  it('overrides an explicit useMvr flag', () => {
    expect(withoutMvr({ useMvr: true }).useMvr).toBe(false);
  });

  it('rejects the CLMM SDK default MVR package name', () => {
    const tx = buildSwapTransaction(false);
    expect(() => assertMsafeTransactionSnapshot(tx)).toThrow(/snapshot-safe/);
  });

  it('accepts a swap whose package id is already resolved', () => {
    const tx = buildSwapTransaction(true);
    expect(() => assertMsafeTransactionSnapshot(tx)).not.toThrow();
    const packages = tx.getData().commands.flatMap((command) => (command.MoveCall ? [command.MoveCall.package] : []));
    expect(packages.some((pkg) => pkg.includes('@'))).toBe(false);
  });
});
