import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, AddLiquidityIntentionData } from '../types';
import { executeClmmDeposit } from '../utils/liquidity';

export class AddLiquidityIntention extends BaseIntention<AddLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, amountA, amountB, pool, selectedLowTick, selectedHighTick, slippage } = params;
    const tx = new Transaction();

    await executeClmmDeposit(
      sdk,
      tx,
      address,
      amountA,
      amountB,
      pool,
      pool.objectId,
      selectedLowTick,
      selectedHighTick,
      slippage,
    );

    return tx;
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
