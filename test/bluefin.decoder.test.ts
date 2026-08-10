import { toBase58 } from '@mysten/bcs';
import { Transaction } from '@mysten/sui/transactions';

import { Decoder } from '@/apps/bluefin/decoder';

const PKG = `0x${'3'.repeat(64)}`;
const POOL = `0x${'1'.repeat(64)}`;
const POSITION = `0x${'2'.repeat(64)}`;
const DIGEST = toBase58(new Uint8Array(32).fill(7));

describe('bluefin decoder: unresolved object inputs', () => {
  const buildUnresolvedTx = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PKG}::pool::provide_liquidity`,
      arguments: [tx.object(POOL), tx.object(POSITION)],
    });
    return tx;
  };

  it('produces UnresolvedObject inputs when the tx is not resolved', () => {
    const inputs = buildUnresolvedTx().getData().inputs as any[];
    expect(inputs[0].$kind).toBe('UnresolvedObject');
    expect(inputs[0].Object).toBeUndefined();
  });

  it('reads shared and owned object ids from UnresolvedObject', () => {
    const decoder = new Decoder(buildUnresolvedTx()) as any;
    expect(decoder.getSharedObjectID(0)).toBe(POOL);
    expect(decoder.getOwnedObjectID(1)).toBe(POSITION);
  });

  it('still reads a resolved Object input', () => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PKG}::pool::provide_liquidity`,
      arguments: [
        tx.sharedObjectRef({ objectId: POOL, initialSharedVersion: '1', mutable: true }),
        tx.objectRef({ objectId: POSITION, version: '2', digest: DIGEST }),
      ],
    });
    const inputs = tx.getData().inputs as any[];
    expect(inputs[0].$kind).toBe('Object');

    const decoder = new Decoder(tx) as any;
    expect(decoder.getSharedObjectID(0)).toBe(POOL);
    expect(decoder.getOwnedObjectID(1)).toBe(POSITION);
  });

  it('throws a descriptive error on a non-object input', () => {
    const tx = new Transaction();
    tx.moveCall({ target: `${PKG}::pool::x`, arguments: [tx.pure.u64(1n)] });
    const decoder = new Decoder(tx) as any;
    expect(() => decoder.getSharedObjectID(0)).toThrow(/not shared object argument/);
    expect(() => decoder.getOwnedObjectID(0)).toThrow(/not object argument/);
  });
});
