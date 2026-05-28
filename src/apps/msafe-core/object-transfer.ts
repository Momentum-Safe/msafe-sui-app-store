import { TransactionType, buildObjectTransferTxb } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

export interface ObjectTransferIntentionData {
  receiver: string;
  objectType: string;
  objectId: string;
}

export class ObjectTransferIntention extends BaseIntentionGrpc<ObjectTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'SendObject';

  constructor(public readonly data: ObjectTransferIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiGrpcClient, account } = input;
    return buildObjectTransferTxb(suiGrpcClient, this.data, account.address);
  }

  static fromData(data: ObjectTransferIntentionData) {
    return new ObjectTransferIntention(data);
  }
}
