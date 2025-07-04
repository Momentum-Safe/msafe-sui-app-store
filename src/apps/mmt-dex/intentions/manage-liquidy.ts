import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, ManageLiquidityIntentionData } from '../types';
import { executeAddLiquidityToExistingPosition } from '../utils/liquidity';

export class ManageLiquidityIntention extends BaseIntention<ManageLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ManageLiquidity;

  constructor(public override readonly data: ManageLiquidityIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, amountA, amountB, pool, positionObjectId, slippage } = params;
    const tx = new Transaction();

    await executeAddLiquidityToExistingPosition(sdk, tx, address, amountA, amountB, pool, positionObjectId, slippage);

    return tx;
  }

  static fromData(data: ManageLiquidityIntentionData) {
    return new ManageLiquidityIntention(data);
  }
}
