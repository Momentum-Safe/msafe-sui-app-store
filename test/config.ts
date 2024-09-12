import { HexToUint8Array } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { SUI_TESTNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

export const clientUrl = 'https://sui-testnet.blockvision.org/v1/2Sgk89ivT64MnKdcGzjmyjY2ndD';
export const Client = new SuiClient({ url: clientUrl });
export const Account: WalletAccount = {
  address: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
  publicKey: HexToUint8Array('0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66'),
  chains: [SUI_TESTNET_CHAIN],
  features: [],
};
