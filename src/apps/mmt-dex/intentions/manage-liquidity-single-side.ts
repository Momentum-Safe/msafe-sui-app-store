import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { BaseIntention } from '@/apps/interface/sui';
import { TransactionSubType, ManageLiquiditySingleSideIntentionData } from '../types';
import { executeAddSingleSidedLiquidityToExistingPosition } from '../utils/liquidity';

export class ManageLiquiditySingleSideIntention extends BaseIntention<ManageLiquiditySingleSideIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ManageLiquiditySingleSide;

  constructor(public override readonly data: ManageLiquiditySingleSideIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, amount, isTokenX, pool, positionObjectId, swapSlippage, addLiquiditySlippage } = params;
    const tx = new Transaction();

    await executeAddSingleSidedLiquidityToExistingPosition(
      sdk,
      tx,
      address,
      amount,
      isTokenX,
      pool,
      positionObjectId,
      swapSlippage,
      addLiquiditySlippage,
    );

    return tx;
  }

  static fromData(data: ManageLiquiditySingleSideIntentionData) {
    return new ManageLiquiditySingleSideIntention(data);
  }
}
