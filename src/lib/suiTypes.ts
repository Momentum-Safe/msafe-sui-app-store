/**
 * Local client/response shapes used by app-store helpers.
 * Kept independent of @mysten/sui/jsonRpc so runtime code does not depend on JSON-RPC typings.
 */

export type CoinStruct = {
  coinType: string;
  coinObjectId: string;
  version: string;
  digest: string;
  balance: string;
  previousTransaction: string;
};

export type PaginatedCoins = {
  data: CoinStruct[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type SuiObjectRef = {
  objectId: string;
  version: string | number;
  digest: string;
};

export type CoinBalance = {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance?: Record<string, string>;
};

export type SuiParsedData =
  | {
      dataType: 'moveObject';
      fields: unknown;
      hasPublicTransfer: boolean;
      type: string;
    }
  | {
      dataType: 'package';
      disassembled: Record<string, unknown>;
    };

export type SuiObjectData = {
  objectId: string;
  version: string;
  digest: string;
  type?: string | null;
  owner?: unknown;
  previousTransaction?: string | null;
  content?: SuiParsedData | null;
};

export type SuiObjectResponse = {
  data?: SuiObjectData | null;
  error?: unknown;
};

/** Subset of the former JSON-RPC DevInspectResults shape used by decoders. */
export type DevInspectEvent = {
  type: string;
  parsedJson?: unknown;
  packageId?: string;
  transactionModule?: string;
  sender?: string;
  bcs?: string;
  id?: { txDigest: string; eventSeq: string };
};

export type DevInspectResults = {
  error?: string | null;
  effects: {
    status: {
      status: 'success' | 'failure';
      error?: string;
    };
  };
  events: DevInspectEvent[];
  results?: Array<{
    returnValues?: Array<[number[], string]>;
  }> | null;
};
