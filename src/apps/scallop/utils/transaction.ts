import { Transaction } from '@mysten/sui/transactions';

/** Normalize Transaction returned by Scallop SDK (may resolve nested @mysten/sui types). */
export function fromScallopTransaction(tx: unknown): Transaction {
  return tx as Transaction;
}
