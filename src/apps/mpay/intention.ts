import { SuiGrpcClient } from '@mysten/sui/grpc';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { Env } from './common';
import { MPayClient, MSafeSingleWallet } from './stream/client';

export abstract class StreamIntention<T> extends BaseIntentionGrpc<T> {
  public application = 'mpay';

  getClient(network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient): MPayClient {
    const mpayClient = new MPayClient(network === 'sui:mainnet' ? Env.prod : Env.dev, { suiGrpcClient });
    mpayClient.connectSingleWallet(new MSafeSingleWallet(account));
    return mpayClient;
  }
}
