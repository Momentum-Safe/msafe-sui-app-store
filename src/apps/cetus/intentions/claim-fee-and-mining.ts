import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { getClaimFeeAndMiningTxb } from '../api/position';
import { CetusIntentionData, TransactionSubType } from '../types';

export class ClaimFeeAndMiningIntention extends BaseIntentionGrpc<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.ClaimFeeAndMining;

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
    const txb = await getClaimFeeAndMiningTxb(txbParams, account, network, suiGrpcClient);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new ClaimFeeAndMiningIntention(data);
  }
}
