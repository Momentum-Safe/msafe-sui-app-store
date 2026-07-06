import { WalletAccount } from '@mysten/wallet-standard';

import { SuiClient, getFullnodeUrl } from '@/compat/mysten-sui-json-rpc';

import { SuiNetworks } from '../types';

export const getClmmSdk = async (network: SuiNetworks, account: WalletAccount) => {
  const { CetusClmmSDK } = await import('@cetusprotocol/sui-clmm-sdk');
  const clmmSdk = CetusClmmSDK.createSDK({
    env: 'mainnet',
    full_rpc_url: getFullnodeUrl('mainnet'),
  });
  clmmSdk.setSenderAddress(account.address);
  return clmmSdk;
};

export const getFarmsSdk = async (network: SuiNetworks, account: WalletAccount) => {
  const { CetusFarmsSDK } = await import('@cetusprotocol/farms-sdk');
  const farmsSdk = CetusFarmsSDK.createSDK({
    env: 'mainnet',
    full_rpc_url: getFullnodeUrl('mainnet'),
  });
  farmsSdk.setSenderAddress(account.address);
  return farmsSdk;
};

const aggregatorURL = 'https://api-sui.cetus.zone/router_v2/find_routes';
export const getAggregatorSdk = async (network: SuiNetworks, account: WalletAccount) => {
  const { AggregatorClient, Env } = await import('@cetusprotocol/aggregator-sdk');
  const suiClient = new SuiClient({
    url: 'https://fullnode.mainnet.sui.io/',
    network: 'mainnet',
  });
  const aggregatorSdk = new AggregatorClient({
    endpoint: aggregatorURL,
    signer: account.address,
    client: suiClient,
    env: Env.Mainnet,
  });

  return aggregatorSdk;
};

export const getVaultsSdk = async (network: SuiNetworks, account: WalletAccount) => {
  const { CetusVaultsSDK } = await import('@cetusprotocol/vaults-sdk');
  const vaultsSDK = CetusVaultsSDK.createSDK({
    env: 'mainnet',
    full_rpc_url: getFullnodeUrl('mainnet'),
  });
  vaultsSDK.setSenderAddress(account.address);
  return vaultsSDK;
};

export const getXcetusSdk = async (network: SuiNetworks, account: WalletAccount) => {
  const { CetusXcetusSDK } = await import('@cetusprotocol/xcetus-sdk');
  const xcetusSDk = CetusXcetusSDK.createSDK({
    env: 'mainnet',
    full_rpc_url: getFullnodeUrl('mainnet'),
  });
  xcetusSDk.setSenderAddress(account.address);
  return xcetusSDk;
};
