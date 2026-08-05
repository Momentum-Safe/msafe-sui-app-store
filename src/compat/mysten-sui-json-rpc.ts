// gRPC-backed client exports with legacy SuiClient names for app-store helpers.
// Public JSON-RPC fullnodes are deprecated; runtime traffic goes through SuiGrpcClient.
import { SuiGrpcClient, isSuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';

import { getFullnodeUrl, type SuiNetworkName } from '@/lib/suiGrpcClient';
import type { DevInspectResults, PaginatedCoins } from '@/lib/suiTypes';

export { getFullnodeUrl, toSuiNetworkName, type SuiNetworkName } from '@/lib/suiGrpcClient';

export { isSuiGrpcClient as isSuiClient };

export type {
  CoinStruct,
  DevInspectResults,
  PaginatedCoins,
  SuiObjectRef,
  SuiObjectResponse,
  SuiObjectData,
  SuiParsedData,
  CoinBalance,
} from '@/lib/suiTypes';

export type SuiClientOptions = {
  network: SuiNetworkName;
  /** @deprecated Prefer baseUrl. Accepted for existing call sites. */
  url?: string;
  baseUrl?: string;
};

/**
 * SuiClient backed by gRPC, with a few legacy-shaped helpers still used by apps
 * (getCoins, devInspectTransactionBlock) until those call sites migrate fully.
 */
export class SuiClient extends SuiGrpcClient {
  constructor(options: SuiClientOptions) {
    const baseUrl = options.baseUrl ?? options.url ?? getFullnodeUrl(options.network);
    super({
      network: options.network,
      baseUrl,
    });
  }

  async getCoins(input: {
    owner: string;
    coinType?: string;
    cursor?: string | null;
    limit?: number;
  }): Promise<PaginatedCoins> {
    const response = await this.listCoins({
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
  }

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

    const result = await this.simulateTransaction({
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
  }
}
