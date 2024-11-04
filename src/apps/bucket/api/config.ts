import { SuiNetworks } from '@/types';
import { WalletAccount } from '@mysten/wallet-standard';
import { BucketClient } from 'bucket-protocol-sdk';

export const getBucketClient = (network: SuiNetworks, account: WalletAccount) => {
  const config = network === 'sui:mainnet' ? 'mainnet' : 'testnet';
  const client = new BucketClient(config, account.address);
  return client;
};
