import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, MergeVeMMTIntentionData } from '../types';
import { createVeMmtSdk } from '../utils/sdk';
import { performMerge } from '../utils/vemmt';

export class MergeVeMMTIntention extends BaseIntentionGrpc<MergeVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Merge;

  constructor(public override readonly data: MergeVeMMTIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const veMMTSdk = createVeMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { address, veId, selectedVeMMTIds } = params;
    const tx = new Transaction();
    await performMerge(veMMTSdk, address, veId, selectedVeMMTIds, tx);
    return tx;
  }

  static fromData(data: MergeVeMMTIntentionData) {
    return new MergeVeMMTIntention(data);
  }
}
