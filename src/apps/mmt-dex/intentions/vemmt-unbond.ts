import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, UnbondVeMMTIntentionData } from '../types';
import { createVeMmtSdk } from '../utils/sdk';
import { performUnbond } from '../utils/vemmt';

export class UnbondVeMMTIntention extends BaseIntentionGrpc<UnbondVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Unbond;

  constructor(public override readonly data: UnbondVeMMTIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const veMMTSdk = createVeMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { address, veId } = params;
    const tx = new Transaction();
    await performUnbond(veMMTSdk, address, veId, tx);
    return tx;
  }

  static fromData(data: UnbondVeMMTIntentionData) {
    return new UnbondVeMMTIntention(data);
  }
}
