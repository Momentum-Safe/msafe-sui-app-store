import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, RemoveLiquidityIntentionData } from '../types';
import { removeClmmLiquidity, removeLiquiditySingleSided } from '../utils/liquidity';
import { createMmtSdk } from '../utils/sdk';

export class RemoveLiquidityIntention extends BaseIntentionGrpc<RemoveLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RemoveLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
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
