// Backward-compatible re-exports for @mysten/sui v1 import paths used across the codebase.
export type { SuiClientTypes } from '@mysten/sui/dist/client/types.mjs';
export {
  DevInspectResults,
  getJsonRpcFullnodeUrl as getFullnodeUrl,
  PaginatedCoins,
  SuiJsonRpcClient as SuiClient,
  SuiObjectRef,
} from '@mysten/sui/jsonRpc';
