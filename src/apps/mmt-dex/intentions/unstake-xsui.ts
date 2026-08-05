import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, UnstakeXSuiIntentionData } from '../types';
import { getUnstakeTxPayload } from '../utils/stake';

export class UnstakeXSuiIntention extends BaseIntentionGrpc<UnstakeXSuiIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnstakeXSui;

  constructor(public override readonly data: UnstakeXSuiIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { params } = this.data;
    const { address, amount } = params;
    return getUnstakeTxPayload(input.suiGrpcClient, address, amount);
  }

  static fromData(data: UnstakeXSuiIntentionData) {
    return new UnstakeXSuiIntention(data);
  }
}
