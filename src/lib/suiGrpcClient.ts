import { getFullnodeUrl } from '@mysten/sui/client';
import type { SuiClientTypes } from '@mysten/sui/client';
import { SuiGrpcClient } from '@mysten/sui/grpc';

import { SuiNetworks } from '@/types';

type SuiNetworkName = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

const NETWORK_MAP: Record<SuiNetworks, SuiNetworkName> = {
  'sui:mainnet': 'mainnet',
  'sui:testnet': 'testnet',
  'sui:devnet': 'devnet',
  'sui:localnet': 'localnet',
};

export type MsafeSuiGrpcClient = SuiGrpcClient & {
  getObject(options: { objectId: string }): ReturnType<SuiGrpcClient['core']['getObject']>;
  listCoins(options: { owner: string; coinType?: string; cursor?: string | null }): Promise<{
    objects: SuiClientTypes.Coin[];
    hasNextPage: boolean;
    cursor: string | null;
  }>;
};

function attachMsafeGrpcHelpers(client: SuiGrpcClient): MsafeSuiGrpcClient {
  return Object.assign(client, {
    getObject(options: { objectId: string }) {
      return client.core.getObject(options);
    },
    async listCoins(options: { owner: string; coinType?: string; cursor?: string | null }) {
      const response = await client.core.getCoins({
        address: options.owner,
        coinType: options.coinType,
        cursor: options.cursor ?? undefined,
      });

      return {
        objects: response.objects.map((coin) => ({
          coinType: options.coinType ?? '',
          objectId: coin.id,
          version: coin.version,
          digest: coin.digest,
          balance: coin.balance ?? '0',
        })),
        hasNextPage: response.hasNextPage,
        cursor: response.cursor,
      };
    },
  });
}

export function getSuiGrpcClient(network: SuiNetworks, baseUrl?: string): MsafeSuiGrpcClient {
  const networkName = NETWORK_MAP[network];
  const client = new SuiGrpcClient({
    network: networkName,
    baseUrl: baseUrl ?? getFullnodeUrl(networkName),
  });

  return attachMsafeGrpcHelpers(client);
}
