// Jest shim: legacy packages import SuiClient/getFullnodeUrl from @mysten/sui/client.
// Runtime client is gRPC-backed; keep type re-exports for older SDK typings.
export { SuiClient } from '@/compat/mysten-sui-json-rpc';
export { getFullnodeUrl } from '@/lib/suiGrpcClient';

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
