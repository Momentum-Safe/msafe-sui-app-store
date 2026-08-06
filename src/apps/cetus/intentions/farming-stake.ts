import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { getFarmingStake } from '../api/farming';
import { CetusIntentionData, TransactionSubType } from '../types';

export class FarmingStakeIntention extends BaseIntentionGrpc<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.FarmingStake;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiGrpcClient, account, network } = input;
    const { txbParams } = this.data;
    const txb = await getFarmingStake(txbParams, account, network, suiGrpcClient);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new FarmingStakeIntention(data);
  }
}
