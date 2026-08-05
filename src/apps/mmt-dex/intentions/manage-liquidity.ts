import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, ManageLiquidityIntentionData } from '../types';
import { executeAddLiquidityToExistingPosition } from '../utils/liquidity';
import { createMmtSdk } from '../utils/sdk';

export class ManageLiquidityIntention extends BaseIntentionGrpc<ManageLiquidityIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ManageLiquidity;

  constructor(public override readonly data: ManageLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
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
