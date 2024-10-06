import { SuiNetworks } from '@/types';
import { BucketClient } from 'bucket-protocol-sdk';

export const getBucketClient = (network: SuiNetworks) => {
  const bucketClient = new BucketClient(network);
  return bucketClient;
};