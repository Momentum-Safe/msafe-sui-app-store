import { HexToUint8Array } from '@msafe/sui3-utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { ScallopAppHelper } from '@/apps/scallop/helper';

export const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
export const account: WalletAccount = {
  address: '0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b',
  publicKey: HexToUint8Array('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b'),
  chains: [SUI_MAINNET_CHAIN],
  features: [],
};

export const Obligation = {
  obligationId: '0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74',
  obligationKey: '0x10873534fbdf2f844bae0878a5b660fcc95cdf4838f23bcf0890b0d73b8f170b',
};

export const SpoolStakeAccount = {
  susdc: '0x7ba3aae255483cdb6f0b733a63534de49c6883222e7b4a9ffc0be43d6737ed50',
};

export const vescaKey = '0x5e2c54651ca4e2352475e8419e3419cfcfe424af272ca59ae053e3c248c13c16';

export const accountWithSusdc: WalletAccount = {
  address: '0x61819c99588108d9f7710047e6ad8f2da598de8e98a26ea62bd7ad9847f5329c',
  publicKey: HexToUint8Array('0x61819c99588108d9f7710047e6ad8f2da598de8e98a26ea62bd7ad9847f5329c'),
  chains: [SUI_MAINNET_CHAIN],
  features: [],
};

export const helper = new ScallopAppHelper();

export const scallopClient = new ScallopClient({
  addressId: '695fcdc084f790c04eb068dc',
});
