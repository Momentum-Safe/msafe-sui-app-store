import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, ExtendVeMMTIntentionData } from '../types';
import { createVeMmtSdk } from '../utils/sdk';
import { performExtend } from '../utils/vemmt';

export class ExtendVeMMTIntention extends BaseIntentionGrpc<ExtendVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Extend;

  constructor(public override readonly data: ExtendVeMMTIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const veMMTSdk = createVeMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { address, veId, currentUnbondAt, isCurrentlyMaxBond, enableAutoMaxBond, unbondAt } = params;
    const tx = new Transaction();
    await performExtend(veMMTSdk, address, veId, currentUnbondAt, isCurrentlyMaxBond, enableAutoMaxBond, unbondAt, tx);
    return tx;
  }

  static fromData(data: ExtendVeMMTIntentionData) {
    return new ExtendVeMMTIntention(data);
  }
}
