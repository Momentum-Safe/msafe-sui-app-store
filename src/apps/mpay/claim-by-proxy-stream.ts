import { ClaimByProxyStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { StreamIntention } from './intention';
import { StreamTransactionType } from './types/decode';

export class ClaimByProxyStreamIntention extends StreamIntention<ClaimByProxyStreamIntentionData> {
  txType = TransactionType.Stream;

  txSubType = StreamTransactionType.CLAIM_BY_PROXY;

  constructor(public readonly data: ClaimByProxyStreamIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { network, account, suiGrpcClient } = input;
    const mpayClient = this.getClient(network, account, suiGrpcClient);
    const stream = await mpayClient.getStream(this.data.streamId);
    return stream.claimByProxy();
  }
}
