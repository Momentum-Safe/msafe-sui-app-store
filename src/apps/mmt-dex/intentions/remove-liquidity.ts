import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, RemoveLiquidityIntentionData } from '../types';
import { claimV3Rewards } from '../utils/reward';

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
    const { pool, position, removeLiqAmount, address, withdrawPercentage } = params;
    const tx = new Transaction();
    sdk.Pool.removeLiquidity(tx, pool, position.objectId, removeLiqAmount, BigInt(0), BigInt(0), address);

    claimV3Rewards(sdk, address, position, pool, tx);

    if (withdrawPercentage === 100) {
      sdk.Position.closePosition(tx, position.objectId);
    }

    return tx;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
