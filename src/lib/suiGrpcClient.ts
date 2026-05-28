import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiGrpcClient } from '@mysten/sui/grpc';

import { SuiNetworks } from '@/types';

type SuiNetworkName = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

const NETWORK_MAP: Record<SuiNetworks, SuiNetworkName> = {
  'sui:mainnet': 'mainnet',
  'sui:testnet': 'testnet',
  'sui:devnet': 'devnet',
  'sui:localnet': 'localnet',
};

export function getSuiGrpcClient(network: SuiNetworks, baseUrl?: string): SuiGrpcClient {
  const networkName = NETWORK_MAP[network];
  return new SuiGrpcClient({
    network: networkName,
    baseUrl: baseUrl ?? getFullnodeUrl(networkName),
  });
}
