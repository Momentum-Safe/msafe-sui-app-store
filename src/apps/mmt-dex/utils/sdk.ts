import { MmtSDK } from '@mmt-finance/clmm-sui-sdk';
import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import type { SuiGrpcClient } from '@mysten/sui/grpc';

enum Network {
  Mainnet = 'mainnet',
}

/**
 * MMT CLMM SDK is typed against SuiGrpcClient.
 * Pass the gRPC-backed client so build traffic stays on gRPC.
 */
export function createMmtSdk(suiGrpcClient: SuiGrpcClient): MmtSDK {
  return new MmtSDK({
    network: 'mainnet',
    client: suiGrpcClient,
  });
}

export function createVeMmtSdk(suiGrpcClient: SuiGrpcClient): VeMMT {
  return new VeMMT(suiGrpcClient as never, Network.Mainnet);
}
