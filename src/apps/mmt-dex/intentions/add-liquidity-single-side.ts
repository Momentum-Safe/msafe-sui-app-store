import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, AddLiquiditySingleSideIntentionData } from '../types';
import { executeSingleSidedClmmDeposit } from '../utils/liquidity';

export class AddLiquiditySingleSideIntention extends BaseIntention<AddLiquiditySingleSideIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.AddLiquiditySingleSide;

  constructor(public override readonly data: AddLiquiditySingleSideIntentionData) {
    super(data);
  }

  async build(): Promise<Transaction> {
    const sdk = MmtSDK.NEW({
      network: 'mainnet',
    });
    const { params } = this.data;
    const { address, amount, isTokenX, pool, selectedLowTick, selectedHighTick, swapSlippage, addLiquiditySlippage } =
      params;
    const tx = new Transaction();
    await executeSingleSidedClmmDeposit(
      sdk,
      tx,
      sdk.rpcClient,
      address,
      amount,
      isTokenX,
      pool,
      selectedLowTick,
      selectedHighTick,
      swapSlippage,
      addLiquiditySlippage,
    );

    return tx;
  }

  static fromData(data: AddLiquiditySingleSideIntentionData) {
    return new AddLiquiditySingleSideIntention(data);
  }
}
