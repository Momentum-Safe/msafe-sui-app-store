import type { SuiClientTypes } from '@mysten/sui/client';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

import { toSuiClientNetwork } from '@/lib/suiNetwork';
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
    listCoins(options: { owner: string; coinType?: string; cursor?: string | null }) {
      return client.core.listCoins({
        owner: options.owner,
        coinType: options.coinType,
        cursor: options.cursor,
      });
    },
  });
}

export function getSuiGrpcClient(network: SuiNetworks, baseUrl?: string): MsafeSuiGrpcClient {
  const networkName = toSuiClientNetwork(network);
  const client = new SuiGrpcClient({
    network: networkName,
    baseUrl: baseUrl ?? getJsonRpcFullnodeUrl(networkName),
  });

  return attachMsafeGrpcHelpers(client);
}
