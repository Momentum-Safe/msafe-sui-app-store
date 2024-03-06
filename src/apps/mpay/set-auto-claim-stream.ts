import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { Env } from './common';
import { MPayClient, MSafeSingleWallet } from './stream/client';
import { StreamTransactionType } from './types/decode';

export interface SetAutoClaimIntentionData {
  streamId: string;
  enabled: boolean;
}

export class SetAutoClaimStreamIntention extends CoreBaseIntention<SetAutoClaimIntentionData> {
  txType: TransactionType.Other;

  txSubType: StreamTransactionType.SET_AUTO_CLAIM;

  constructor(public readonly data: SetAutoClaimIntentionData) {
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

    const txb = await stream.setAutoClaim(true);

    return txb;
  }

  static fromData(data: SetAutoClaimIntentionData) {
    return new SetAutoClaimStreamIntention(data);
  }
}
