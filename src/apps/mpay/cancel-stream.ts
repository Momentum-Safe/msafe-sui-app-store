import { CancelStreamIntentionData, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { Env } from './common';
import { MPayClient, MSafeSingleWallet } from './stream/client';
import { StreamTransactionType } from './types/decode';

export class CancelStreamIntention extends CoreBaseIntention<CancelStreamIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.CANCEL;

  constructor(public readonly data: CancelStreamIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { network, account } = input;

    const mpayClient = new MPayClient(network === 'sui:mainnet' ? Env.prod : Env.dev);
    mpayClient.connectSingleWallet(new MSafeSingleWallet(account));

    const stream = await mpayClient.getStream(this.data.streamId);

    const txb = await stream.cancel();

    return txb;
  }

  static fromData(data: CancelStreamIntentionData) {
    return new CancelStreamIntention(data);
  }
}
