import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';

import type { DevInspectResults, PaginatedCoins } from '@/lib/suiTypes';
import { SuiNetworks } from '@/types';

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

/** Default fullnode base URLs (same hosts as former JSON-RPC helpers; used for gRPC). */
export function getFullnodeUrl(network: SuiNetworkName): string {
  switch (network) {
    case 'mainnet':
      return 'https://fullnode.mainnet.sui.io:443';
    case 'testnet':
      return 'https://fullnode.testnet.sui.io:443';
    case 'devnet':
      return 'https://fullnode.devnet.sui.io:443';
    case 'localnet':
      return 'http://127.0.0.1:9000';
    default:
      throw new Error(`Unknown network: ${network}`);
  }
}

export type MsafeSuiGrpcClient = SuiGrpcClient & {
  getCoins(input: {
    owner: string;
    coinType?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<PaginatedCoins>;
  devInspectTransactionBlock(input: {
    sender: string;
    transactionBlock: Transaction | Uint8Array | string;
  }): Promise<DevInspectResults>;
};

function attachMsafeGrpcHelpers(client: SuiGrpcClient): MsafeSuiGrpcClient {
  return Object.assign(client, {
    async getCoins(input: {
      owner: string;
      coinType?: string;
      cursor?: string | null;
      limit?: number;
    }): Promise<PaginatedCoins> {
      const response = await client.listCoins({
        owner: input.owner,
        coinType: input.coinType,
        cursor: input.cursor ?? undefined,
        limit: input.limit,
      });

      return {
        data: response.objects.map((coin) => ({
          coinType: coin.type,
          coinObjectId: coin.objectId,
          version: coin.version,
          digest: coin.digest,
          balance: coin.balance,
          previousTransaction: '0x0',
        })),
        hasNextPage: response.hasNextPage,
        nextCursor: response.cursor,
      };
    },

    async devInspectTransactionBlock(input: {
      sender: string;
      transactionBlock: Transaction | Uint8Array | string;
    }): Promise<DevInspectResults> {
      const tx =
        typeof input.transactionBlock === 'object' &&
        input.transactionBlock !== null &&
        'setSenderIfNotSet' in input.transactionBlock
          ? (input.transactionBlock as Transaction)
          : Transaction.from(input.transactionBlock as Uint8Array | string);

      tx.setSenderIfNotSet(input.sender);

      const result = await client.simulateTransaction({
        transaction: tx,
        checksEnabled: false,
        include: {
          effects: true,
          events: true,
          commandResults: true,
        },
      });

      const transaction = result.$kind === 'Transaction' ? result.Transaction : result.FailedTransaction;
      const success = transaction.effects?.status?.success ?? false;

      return {
        error: success ? null : (transaction.effects?.status?.error?.message ?? 'Simulation failed'),
        effects: {
          status: {
            status: success ? 'success' : 'failure',
            error: transaction.effects?.status?.error?.message,
          },
        },
        events: (transaction.events ?? []).map((event) => ({
          type: event.eventType,
          parsedJson: event.json,
          packageId: event.packageId,
          transactionModule: event.module,
          sender: event.sender,
          bcs: '',
          id: { txDigest: '', eventSeq: '0' },
        })),
        results: result.commandResults?.map((commandResult) => ({
          returnValues: commandResult.returnValues.map((value) => [Array.from(value.bcs), 'u64'] as [number[], string]),
        })),
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
