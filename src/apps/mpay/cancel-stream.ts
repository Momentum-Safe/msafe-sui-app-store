import { CancelStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

import { StreamIntention } from './intention';
import { StreamTransactionType } from './types/decode';

export class CancelStreamIntention extends StreamIntention<CancelStreamIntentionData> {
  txType = TransactionType.Stream;

  txSubType = StreamTransactionType.CANCEL;

  constructor(public readonly data: CancelStreamIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { network, account } = input;
    const mpayClient = this.getClient(network, account);
    const stream = await mpayClient.getStream(this.data.streamId);
    return stream.cancel();
  }
}
