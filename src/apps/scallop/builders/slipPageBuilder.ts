import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export const SlippageContract = {
  packageId: '0x5857d185897aaff40ae37b2eecc895efc1a9dff1b210c4fb894eabbce4ac2603',
} as const;

export const SlippageTxBuilder = {
  check_slippage: (
    tx: TransactionBlock,
    resultCoin: TransactionArgument,
    slippage: number,
    expectedAmount: number | string,
    coinType: string,
  ) =>
    tx.moveCall({
      target: `${SlippageContract.packageId}::slippage_check::check_slippage`,
      arguments: [resultCoin, tx.pure(slippage), tx.pure(expectedAmount)],
      typeArguments: [coinType],
    }),
} as const;
