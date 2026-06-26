// Central v2 JSON-RPC client exports with v1-compatible names for app-store helpers.
import type { SuiNetworks } from '@/types';

export {
  SuiJsonRpcClient as SuiClient,
  isSuiJsonRpcClient as isSuiClient,
  JsonRpcHTTPTransport as SuiHTTPTransport,
  getJsonRpcFullnodeUrl as getFullnodeUrl,
} from '@mysten/sui/jsonRpc';

export type { SuiJsonRpcClientOptions as SuiClientOptions } from '@mysten/sui/jsonRpc';

export type { CoinStruct, DevInspectResults, PaginatedCoins, SuiObjectRef } from '@mysten/sui/jsonRpc';

export type SuiNetworkName = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

const NETWORK_MAP: Record<SuiNetworks, SuiNetworkName> = {
  'sui:mainnet': 'mainnet',
  'sui:testnet': 'testnet',
  'sui:devnet': 'devnet',
  'sui:localnet': 'localnet',
};

export function toSuiNetworkName(network: SuiNetworks): SuiNetworkName {
  return NETWORK_MAP[network];
}
