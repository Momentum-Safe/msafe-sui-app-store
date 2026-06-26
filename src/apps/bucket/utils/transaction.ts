import { Transaction } from '@mysten/sui/transactions';
import type { buildPsmTx } from 'bucket-protocol-sdk';

type BucketSdkTransaction = Parameters<typeof buildPsmTx>[1];

/** Cast Transaction for bucket-protocol-sdk (bundled nested @mysten/sui). */
export function toBucketSdkTransaction(tx: Transaction): BucketSdkTransaction {
  return tx as BucketSdkTransaction;
}
