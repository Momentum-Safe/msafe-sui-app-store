import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk';
import { CetusFarmsSDK } from '@cetusprotocol/farms-sdk';
import { CetusClmmSDK } from '@cetusprotocol/sui-clmm-sdk';
import { CetusVaultsSDK } from '@cetusprotocol/vaults-sdk';
import { CetusXcetusSDK } from '@cetusprotocol/xcetus-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '../types';

export const getClmmSdk = (network: SuiNetworks, account: WalletAccount) => {
  const clmmSdk = CetusClmmSDK.createSDK({
    env: 'mainnet',
    sui_client: new SuiClient({ url: getFullnodeUrl('mainnet') }),
  });
  clmmSdk.setSenderAddress(account.address);
  return clmmSdk;
};

export const getFarmsSdk = (network: SuiNetworks, account: WalletAccount) => {
  const farmsSdk = CetusFarmsSDK.createSDK({
    env: 'mainnet',
    sui_client: new SuiClient({ url: getFullnodeUrl('mainnet') }),
  });
  farmsSdk.setSenderAddress(account.address);
  return farmsSdk;
};

const aggregatorURL = 'https://api-sui.cetus.zone/router_v2/find_routes';
export const getAggregatorSdk = (network: SuiNetworks, account: WalletAccount) => {
  const suiClient = new SuiClient({
    url: 'https://fullnode.mainnet.sui.io/',
  });
  const aggregatorSdk = new AggregatorClient({
    endpoint: aggregatorURL,
    signer: account.address,
    client: suiClient,
    env: Env.Mainnet,
  });

  return aggregatorSdk;
};

export const getVaultsSdk = (network: SuiNetworks, account: WalletAccount) => {
  const vaultsSDK = CetusVaultsSDK.createSDK({ env: 'mainnet' });
  vaultsSDK.setSenderAddress(account.address);
  return vaultsSDK;
};

export const getXcetusSdk = (network: SuiNetworks, account: WalletAccount) => {
  const xcetusSDk = CetusXcetusSDK.createSDK({ env: 'mainnet' });
  xcetusSDk.setSenderAddress(account.address);
  return xcetusSDk;
};
