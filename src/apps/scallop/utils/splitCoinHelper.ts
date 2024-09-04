import { bcs } from '@mysten/sui.js/bcs';
import { SplitCoinsTransaction, Transaction, TransactionBlockInput } from '@mysten/sui.js/dist/cjs/transactions';

import { MoveCallHelper } from './moveCallHelper';

export class SplitCoinHelper {
  constructor(
    public readonly splitCoin: SplitCoinsTransaction,
    public readonly txb: Transaction,
  ) {}

  getAmountInput() {
    return this.splitCoin.amounts
      .map((input) => {
        if (input.kind === 'Input') {
          return Number(MoveCallHelper.getPureInputValue<number>(input, 'u64'));
        }
        return undefined;
      })
      .filter((input) => input !== undefined);
  }

  static getPureInputValue<T>(input: TransactionBlockInput, bcsType: string) {
    if (input.type !== 'pure') {
      throw new Error('not pure argument');
    }
    if (typeof input.value === 'object' && 'Pure' in input.value) {
      const bcsNums = input.value.Pure;
      return bcs.de(bcsType, new Uint8Array(bcsNums)) as T;
    }
    return input.value as T;
  }
}
