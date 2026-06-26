import type { SuiClientTypes } from '@mysten/sui/client';
import { SuiGrpcClient } from '@mysten/sui/grpc';

import { getFullnodeUrl, toSuiNetworkName } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

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
      const response = await client.core.listCoins({
        owner: options.owner,
        coinType: options.coinType,
        cursor: options.cursor ?? undefined,
      });

      return {
        objects: response.objects.map((coin) => ({
          coinType: options.coinType ?? '',
          objectId: coin.objectId,
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
  const networkName = toSuiNetworkName(network);
  const client = new SuiGrpcClient({
    network: networkName,
    baseUrl: baseUrl ?? getFullnodeUrl(networkName),
  });

  return attachMsafeGrpcHelpers(client);
}
