import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Env } from './common';
import { MPayClient, MSafeSingleWallet } from './stream/client';

export abstract class StreamIntention<T> extends BaseIntentionLegacy<T> {
  public application = 'mpay';

  getClient(network: SuiNetworks, account: WalletAccount): MPayClient {
    const mpayClient = new MPayClient(network === 'sui:mainnet' ? Env.prod : Env.dev);
    mpayClient.connectSingleWallet(new MSafeSingleWallet(account));
    return mpayClient;
  }
}
