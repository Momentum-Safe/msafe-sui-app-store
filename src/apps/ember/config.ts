import { SuiClient } from '@firefly-exchange/library-sui';
import { UserCalls } from '@firefly-exchange/library-sui/vaults';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from './types';

const RPC_URL = 'https://fullnode.mainnet.sui.io/';
const VAULTS_API_URL = 'https://vaults.api.sui-prod.bluefin.io/api/v1/vaults/info';

export const getEmberSDK = async (network: SuiNetworks, account: WalletAccount) => {
  if (network !== 'sui:mainnet') {
    throw new Error('Ember protocol is only available on sui::mainnet');
  }

  const client = new SuiClient({ url: RPC_URL });

  const response = await fetch(VAULTS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch vault data: ${response.status} ${response.statusText}`);
  }

  const contracts = await response.json();

  const emberSDK = new UserCalls('mainnet', client, contracts, undefined, account.address);

  return emberSDK;
};
