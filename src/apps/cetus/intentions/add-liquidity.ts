import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { getAddLiquidityTxb } from '../api/position';
import { CetusIntentionData, TransactionSubType } from '../types';

export class AddLiquidityIntention extends BaseIntentionGrpc<CetusIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.OpenAndAddLiquidity;

  constructor(public override readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { suiGrpcClient, account, network } = input;
    const { txbParams } = this.data;
    const txb = await getAddLiquidityTxb(txbParams, account, network, suiGrpcClient);
    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
