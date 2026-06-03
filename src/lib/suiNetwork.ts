import type { SuiClientTypes } from '@mysten/sui/client';

import { SuiNetworks } from '@/types';

const NETWORK_MAP: Record<SuiNetworks, SuiClientTypes.Network> = {
  'sui:mainnet': 'mainnet',
  'sui:testnet': 'testnet',
  'sui:devnet': 'devnet',
  'sui:localnet': 'localnet',
};

export function toSuiClientNetwork(network: SuiNetworks): SuiClientTypes.Network {
  return NETWORK_MAP[network];
}
