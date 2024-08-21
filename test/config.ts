import { IotaClient } from '@iota/iota-sdk/client';
import { fromHEX } from '@iota/iota-sdk/utils';
import { SUPPORTED_CHAINS, WalletAccount } from '@iota/wallet-standard';
console.log('🚀 ~ SUPPORTED_CHAINS:', SUPPORTED_CHAINS);

export const Client = new IotaClient({ url: 'https://api.iota-rebased-alphanet.iota.cafe' });
export const Account: WalletAccount = {
  address: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
  publicKey: fromHEX('0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66'),
  chains: [],
  features: [],
};
