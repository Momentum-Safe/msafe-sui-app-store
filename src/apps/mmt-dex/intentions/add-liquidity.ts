import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, AddLiquidityIntentionData } from '../types';
import { executeClmmDeposit } from '../utils/liquidity';
import { createMmtSdk } from '../utils/sdk';

export class AddLiquidityIntention extends BaseIntentionGrpc<AddLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
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
      pool.poolId,
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
