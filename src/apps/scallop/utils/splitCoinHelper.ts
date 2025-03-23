import { Transaction } from '@mysten/sui/transactions';

import MoveCallHelper from './moveCallHelper';
import { SplitCoinTransactionType } from '../types/sui';

class SplitCoinHelper {
  constructor(
    public readonly splitCoin: SplitCoinTransactionType,
    public readonly txb: Transaction,
  ) {}

  getAmountInput() {
    return this.splitCoin.amounts
      .map((input) => {
        if (input.kind === 'Input') {
          return Number(MoveCallHelper.getPureInputValue<number>(input, 'U64'));
        }
        return undefined;
      })
      .filter((input) => input !== undefined);
  }
}

export default SplitCoinHelper;
