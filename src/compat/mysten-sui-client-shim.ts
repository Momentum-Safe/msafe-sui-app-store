// Jest shim: legacy packages import SuiClient/getFullnodeUrl from @mysten/sui/client.
export { SuiJsonRpcClient as SuiClient, getJsonRpcFullnodeUrl as getFullnodeUrl } from '@mysten/sui/jsonRpc';
