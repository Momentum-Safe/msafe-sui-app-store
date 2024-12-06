import { WalletAccount } from '@mysten/wallet-standard';
import { BucketClient } from 'bucket-protocol-sdk';

import { SuiNetworks } from '@/types';

export const getBucketClient = (network: SuiNetworks, account: WalletAccount) => {
  const config = network === 'sui:mainnet' ? 'mainnet' : 'testnet';
  return new BucketClient(config, account.address);
};
