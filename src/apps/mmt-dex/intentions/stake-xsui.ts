import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { StakeXSuiIntentionData, TransactionSubType } from '../types';
import { getStakeTxPayload } from '../utils/stake';

export class StakeXSuiIntention extends BaseIntentionGrpc<StakeXSuiIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.StakeXSui;

  constructor(public override readonly data: StakeXSuiIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { params } = this.data;
    const { address, amount } = params;
    return getStakeTxPayload(input.suiGrpcClient, address, amount);
  }

  static fromData(data: StakeXSuiIntentionData) {
    return new StakeXSuiIntention(data);
  }
}
