import { bcs } from '@mysten/bcs';
import type { SuiClientTypes } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import type { MsafeSuiGrpcClient } from '@/lib/suiGrpcClient';

import { normalizeMoveObjectJson } from './moveObjectFields';

export type MpayCoin = {
  coinObjectId: string;
  balance: string;
  coinType: string;
};

export type MpayObjectResponse = {
  data?: {
    objectId: string;
    type?: string;
    content?: {
      dataType: 'moveObject';
      type: string;
      fields: Record<string, unknown>;
    };
  };
  error?: {
    code: string;
  };
};

export type MpayBalance = {
  coinType: string;
  totalBalance: string;
};

export type MpayCoinMetadata = SuiClientTypes.CoinMetadata;

export type MpaySimulateResult = {
  effects?: {
    status: {
      status: 'success' | 'failure';
      error?: string;
    };
  };
  results?: {
    returnValues?: [number[], string][];
  }[];
  commandResults?: SuiClientTypes.CommandResult[];
};

export async function mpayGetCoins(
  client: MsafeSuiGrpcClient,
  options: {
    owner: string;
    coinType: string;
    cursor?: string | null;
    limit?: number;
  },
): Promise<{ data: MpayCoin[]; hasNextPage: boolean; nextCursor: string | null }> {
  const response = await client.listCoins({
    owner: options.owner,
    coinType: options.coinType,
    cursor: options.cursor ?? undefined,
    limit: options.limit,
  });

  return {
    data: response.objects.map((coin) => ({
      coinObjectId: coin.objectId,
      balance: coin.balance,
      coinType: coin.type,
    })),
    hasNextPage: response.hasNextPage,
    nextCursor: response.cursor,
  };
}

function resolveGetObject(client: MsafeSuiGrpcClient) {
  if (client.core?.getObject) {
    return client.core.getObject.bind(client.core);
  }
  return client.getObject.bind(client);
}

function extractMoveObjectFields(object: {
  json?: Record<string, unknown> | null;
  type?: string;
}): Record<string, unknown> | null {
  if (object.json && typeof object.json === 'object') {
    return normalizeMoveObjectJson(object.json);
  }
  return null;
}

export async function mpayGetObject(client: MsafeSuiGrpcClient, objectId: string): Promise<MpayObjectResponse> {
  try {
    const getObject = resolveGetObject(client);
    const { object } = await getObject({
      objectId,
      include: { json: true, type: true },
    });

    const fields = extractMoveObjectFields(object);
    if (!fields) {
      return {
        error: { code: 'notExists' },
      };
    }

    return {
      data: {
        objectId: object.objectId,
        type: object.type,
        content: {
          dataType: 'moveObject',
          type: object.type,
          fields,
        },
      },
    };
  } catch {
    return {
      error: { code: 'notExists' },
    };
  }
}

export async function mpayMultiGetObjects(
  client: MsafeSuiGrpcClient,
  ids: string[],
): Promise<(MpayObjectResponse | undefined)[]> {
  if (ids.length === 0) {
    return [];
  }

  const { objects } = await client.getObjects({
    objectIds: ids,
    include: { json: true, type: true },
  });

  return objects.map((entry) => {
    if (!('objectId' in entry)) {
      return { error: { code: String((entry as { code?: unknown }).code ?? 'unknown') } };
    }

    const fields = extractMoveObjectFields(entry);
    if (!fields) {
      return undefined;
    }

    return {
      data: {
        objectId: entry.objectId,
        type: entry.type,
        content: {
          dataType: 'moveObject' as const,
          type: entry.type,
          fields,
        },
      },
    };
  });
}

export async function mpayGetBalance(
  client: MsafeSuiGrpcClient,
  options: { owner: string; coinType?: string | null },
): Promise<MpayBalance> {
  const { balance } = await client.getBalance({
    owner: options.owner,
    coinType: options.coinType ?? undefined,
  });

  return {
    coinType: balance.coinType,
    totalBalance: balance.balance,
  };
}

export async function mpayGetAllBalances(client: MsafeSuiGrpcClient, owner: string): Promise<MpayBalance[]> {
  const response = await client.listBalances({ owner });
  return response.balances.map((balance) => ({
    coinType: balance.coinType,
    totalBalance: balance.balance,
  }));
}

export async function mpayGetCoinMetadata(
  client: MsafeSuiGrpcClient,
  coinType: string,
): Promise<MpayCoinMetadata | null> {
  const { coinMetadata } = await client.getCoinMetadata({ coinType });
  return coinMetadata;
}

export async function mpaySimulateTransaction(
  client: MsafeSuiGrpcClient,
  options: { transaction: Transaction; sender: string },
): Promise<MpaySimulateResult> {
  options.transaction.setSenderIfNotSet(options.sender);
  const result = await client.simulateTransaction({
    transaction: options.transaction,
    include: {
      effects: true,
      commandResults: true,
    },
  });

  const transaction = result.$kind === 'Transaction' ? result.Transaction : result.FailedTransaction;

  return {
    effects: transaction.effects
      ? {
          status: {
            status: transaction.effects.status.success ? 'success' : 'failure',
            error: transaction.effects.status.error?.message,
          },
        }
      : undefined,
    commandResults: result.commandResults,
    results: result.commandResults?.map((commandResult) => ({
      returnValues: commandResult.returnValues.map((value) => [Array.from(value.bcs), 'u64'] as [number[], string]),
    })),
  };
}

export function readU64FromCommandResult(result: MpaySimulateResult, callIndex = 0, returnIndex = 0): bigint {
  const output = result.commandResults?.[callIndex]?.returnValues?.[returnIndex];
  if (!output) {
    throw new Error('Missing command result');
  }
  return BigInt(bcs.u64().parse(output.bcs));
}
