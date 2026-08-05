import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, ManageLiquiditySingleSideIntentionData } from '../types';
import { executeAddSingleSidedLiquidityToExistingPosition } from '../utils/liquidity';
import { createMmtSdk } from '../utils/sdk';

export class ManageLiquiditySingleSideIntention extends BaseIntentionGrpc<ManageLiquiditySingleSideIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ManageLiquiditySingleSide;

  constructor(public override readonly data: ManageLiquiditySingleSideIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
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
