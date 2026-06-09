import { Transaction } from '@mysten/sui/transactions';

import MoveCallHelper from './moveCallHelper';
import { SplitCoinTransactionType } from '../types/sui';

class SplitCoinHelper {
  constructor(
    public readonly splitCoin: SplitCoinTransactionType,
    public readonly txb: Transaction,
  ) {}

  getAmountInput() {
    return this.splitCoin.SplitCoins.amounts
      .map((arg) => {
        if (arg.$kind === 'Input') {
          const input = this.txb.getData().inputs[arg.Input];
          return Number(MoveCallHelper.getPureInputValue<number>(input, 'U64'));
        }
        return undefined;
      })
      .filter((amount): amount is number => amount !== undefined);
  }
}

export default SplitCoinHelper;
