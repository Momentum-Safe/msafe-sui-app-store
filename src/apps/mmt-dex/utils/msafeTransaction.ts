import { Transaction } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';

/**
 * CLMM SDK defaults useMvr to true and writes `@mmt/clmm-core` into MoveCall.package.
 * MSafe copies the transaction with Transaction.from before build(), so the MVR
 * serialization plugin never runs. Force resolved package ids instead.
 *
 * T is constrained to object, not `{ useMvr?: boolean }`. That optional field is
 * also on the SDK param types, and TypeScript then infers T as only the constraint
 * when the result is passed directly into those methods.
 */
export function withoutMvr<T extends object>(params: T): Omit<T, 'useMvr'> & { useMvr: false } {
  return { ...params, useMvr: false };
}

/** Same check Simulator.copyTransaction hits via Transaction.from -> getData. */
export function assertMsafeTransactionSnapshot(tx: Transaction): void {
  let data: ReturnType<Transaction['getData']>;
  try {
    data = tx.getData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Transaction is not snapshot-safe for MSafe simulate. Build MMT move calls with withoutMvr so package ids are resolved before Transaction.from. ${message}`,
    );
  }

  data.commands.forEach((command, index) => {
    const pkg = command.MoveCall?.package;
    if (pkg && !isValidSuiAddress(pkg)) {
      throw new Error(
        `Transaction command ${index} package is not a resolved Sui address: ${pkg}. Build MMT move calls with withoutMvr.`,
      );
    }
  });
}
