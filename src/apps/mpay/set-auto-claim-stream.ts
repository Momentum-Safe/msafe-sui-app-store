import { SetAutoClaimIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { StreamIntention } from './intention';
import { StreamTransactionType } from './types/decode';

export class SetAutoClaimStreamIntention extends StreamIntention<SetAutoClaimIntentionData> {
  txType = TransactionType.Stream;

  txSubType = StreamTransactionType.SET_AUTO_CLAIM;

  constructor(public readonly data: SetAutoClaimIntentionData) {
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
    return stream.setAutoClaim(this.data.enabled);
  }
}
