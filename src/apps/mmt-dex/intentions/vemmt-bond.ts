import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType, BondVeMMTIntentionData } from '../types';
import { createMmtSdk, createVeMmtSdk } from '../utils/sdk';
import { performBond } from '../utils/vemmt';

export class BondVeMMTIntention extends BaseIntentionGrpc<BondVeMMTIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Bond;

  constructor(public override readonly data: BondVeMMTIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const sdk = createMmtSdk(input.suiGrpcClient);
    const veMMTSdk = createVeMmtSdk(input.suiGrpcClient);
    const { params } = this.data;
    const { token, amount, address, enableAutoMaxBond, unbondAt } = params;
    const tx = new Transaction();
    await performBond(sdk, veMMTSdk, token, amount, address, enableAutoMaxBond, unbondAt, tx);
    return tx;
  }

  static fromData(data: BondVeMMTIntentionData) {
    return new BondVeMMTIntention(data);
  }
}
