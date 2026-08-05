import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, AddLiquiditySingleSideIntentionData } from '../types';
import { executeSingleSidedClmmDeposit } from '../utils/liquidity';
import { createMmtSdk } from '../utils/sdk';

export class AddLiquiditySingleSideIntention extends BaseIntentionGrpc<AddLiquiditySingleSideIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.AddLiquiditySingleSide;

  constructor(public override readonly data: AddLiquiditySingleSideIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { address, amount, isTokenX, pool, selectedLowTick, selectedHighTick, swapSlippage, addLiquiditySlippage } =
      params;
    const tx = new Transaction();
    await executeSingleSidedClmmDeposit(
      sdk,
      tx,
      input.suiGrpcClient,
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
