import { SuiGrpcClient } from '@mysten/sui/grpc';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '../types';

export const getClmmSdk = async (network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient) => {
  const { CetusClmmSDK } = await import('@cetusprotocol/sui-clmm-sdk');
  const clmmSdk = CetusClmmSDK.createSDK({
    env: 'mainnet',
    sui_grpc_client: suiGrpcClient,
  });
  clmmSdk.setSenderAddress(account.address);
  return clmmSdk;
};

export const getFarmsSdk = async (network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient) => {
  const { CetusFarmsSDK } = await import('@cetusprotocol/farms-sdk');
  const farmsSdk = CetusFarmsSDK.createSDK({
    env: 'mainnet',
    sui_grpc_client: suiGrpcClient,
  });
  farmsSdk.setSenderAddress(account.address);
  return farmsSdk;
};

const aggregatorURL = 'https://api-sui.cetus.zone/router_v2/find_routes';
export const getAggregatorSdk = async (network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient) => {
  const { AggregatorClient, Env } = await import('@cetusprotocol/aggregator-sdk');
  const aggregatorSdk = new AggregatorClient({
    endpoint: aggregatorURL,
    signer: account.address,
    // The aggregator SDK bundles a patch-level-different @mysten/sui copy.
    // Both clients are runtime-compatible, but private fields make their types nominally incompatible.
    client: suiGrpcClient as never,
    env: Env.Mainnet,
  });

  return aggregatorSdk;
};

export const getVaultsSdk = async (network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient) => {
  const { CetusVaultsSDK } = await import('@cetusprotocol/vaults-sdk');
  const vaultsSDK = CetusVaultsSDK.createSDK({
    env: 'mainnet',
    sui_grpc_client: suiGrpcClient,
  });
  vaultsSDK.setSenderAddress(account.address);
  return vaultsSDK;
};

export const getXcetusSdk = async (network: SuiNetworks, account: WalletAccount, suiGrpcClient: SuiGrpcClient) => {
  const { CetusXcetusSDK } = await import('@cetusprotocol/xcetus-sdk');
  const xcetusSDk = CetusXcetusSDK.createSDK({
    env: 'mainnet',
    sui_grpc_client: suiGrpcClient,
  });
  xcetusSDk.setSenderAddress(account.address);
  return xcetusSDk;
};
