import { CreateStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
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
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { network, account } = input;
    const mpayClient = this.getClient(network, account);
    return mpayClient.createStream(this.data);
  }
}
