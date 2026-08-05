import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, SwapIntentionData } from '../types';
import { createMmtSdk } from '../utils/sdk';
import { performMmtSwap, resolveSwapIntentionParams } from '../utils/swap';

export class SwapIntention extends BaseIntentionGrpc<SwapIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Swap;

  constructor(public override readonly data: SwapIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
    const resolved = await resolveSwapIntentionParams(sdk, this.data.params);
    const tx = new Transaction();
    await performMmtSwap(
      sdk,
      resolved.route,
      resolved.tokenIn,
      resolved.amountIn,
      resolved.address,
      tx,
      resolved.slippage,
    );
    return tx;
  }

  static fromData(data: SwapIntentionData) {
    return new SwapIntention(data);
  }
}
