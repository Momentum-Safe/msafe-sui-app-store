import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, RemoveLiquidityIntentionData } from '../types';
import { removeClmmLiquidity, removeLiquiditySingleSided } from '../utils/liquidity';

export class RemoveLiquidityIntention extends BaseIntention<RemoveLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RemoveLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { pool, position, address, withdrawPercentage, zapOutOn, targetCoinType, slippage } = params;
    const tx = new Transaction();

    if (zapOutOn) {
      await removeLiquiditySingleSided({
        sdk,
        address,
        position,
        pool,
        withdrawPercentage,
        txb: tx,
        targetCoinType,
        slippage,
      });
    } else {
      await removeClmmLiquidity(sdk, address, position, pool, withdrawPercentage, tx);
    }

    return tx;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
