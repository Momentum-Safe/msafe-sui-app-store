import { CreateStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { StreamIntention } from './intention';
import { StreamTransactionType } from './types/decode';

export class CreateStreamIntention extends StreamIntention<CreateStreamIntentionData> {
  txType = TransactionType.Stream;

  txSubType = StreamTransactionType.CREATE_STREAM;

  constructor(public readonly data: CreateStreamIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { network, account, suiGrpcClient } = input;
    const mpayClient = this.getClient(network, account, suiGrpcClient);
    return mpayClient.createStream(this.data);
  }
}
