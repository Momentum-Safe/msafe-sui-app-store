import { CreateStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { Env } from './common';
import { MPayClient, MSafeSingleWallet } from './stream/client';
import { StreamTransactionType } from './types/decode';

export class CreateStreamIntention extends CoreBaseIntention<CreateStreamIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.CREATE_STREAM;

  constructor(public readonly data: CreateStreamIntentionData) {
    super(data);
  }

  async build(input: {
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { network, account } = input;

    const mpayClient = new MPayClient(network === 'sui:mainnet' ? Env.prod : Env.dev);
    mpayClient.connectSingleWallet(new MSafeSingleWallet(account));

    const txb = await mpayClient.createStream(this.data);
    return txb;
  }

  static fromData(data: CreateStreamIntentionData) {
    return new CreateStreamIntention(data);
  }
}
