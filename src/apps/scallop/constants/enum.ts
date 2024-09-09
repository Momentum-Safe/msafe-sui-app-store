import type {
  SupportCoinDecimals,
  AssetCoins,
  MarketCoins,
  StakeMarketCoins,
  StakeRewardCoins,
  BorrowIncentiveRewardCoins,
  AssetCoinIds,
  WormholeCoinIds,
  VoloCoinIds,
  SCoinIds,
} from '../types';

export const coinDecimals: SupportCoinDecimals = {
  eth: 8,
  btc: 8,
  usdc: 6,
  usdt: 6,
  sui: 9,
  apt: 8,
  sol: 8,
  sca: 9,
  cetus: 9,
  afsui: 9,
  hasui: 9,
  vsui: 9,
  seth: 8,
  sbtc: 8,
  susdc: 6,
  susdt: 6,
  ssui: 9,
  sapt: 8,
  ssol: 8,
  scetus: 9,
  safsui: 9,
  shasui: 9,
  svsui: 9,
  ssca: 9,
};

export const assetCoins: AssetCoins = {
  eth: 'eth',
  btc: 'btc',
  usdc: 'usdc',
  usdt: 'usdt',
  sui: 'sui',
  apt: 'apt',
  sol: 'sol',
  cetus: 'cetus',
  afsui: 'afsui',
  hasui: 'hasui',
  vsui: 'vsui',
  sca: 'sca',
};

export const marketCoins: MarketCoins = {
  seth: 'seth',
  sbtc: 'sbtc',
  susdc: 'susdc',
  susdt: 'susdt',
  ssui: 'ssui',
  sapt: 'sapt',
  ssol: 'ssol',
  scetus: 'scetus',
  safsui: 'safsui',
  shasui: 'shasui',
  svsui: 'svsui',
  ssca: 'ssca',
};

export const stakeMarketCoins: StakeMarketCoins = {
  seth: 'seth',
  ssui: 'ssui',
  susdc: 'susdc',
  susdt: 'susdt',
  scetus: 'scetus',
  safsui: 'safsui',
  shasui: 'shasui',
  svsui: 'svsui',
};

export const spoolRewardCoins: StakeRewardCoins = {
  seth: 'sui',
  ssui: 'sui',
  susdc: 'sui',
  susdt: 'sui',
  scetus: 'sui',
  safsui: 'sui',
  shasui: 'sui',
  svsui: 'sui',
};

export const borrowIncentiveRewardCoins: BorrowIncentiveRewardCoins = {
  sui: ['sui', 'sca'],
  usdc: ['sui', 'sca'],
  usdt: ['sui', 'sca'],
  afsui: ['sui', 'sca'],
  hasui: ['sui', 'sca'],
  vsui: ['sui', 'sca'],
  sca: ['sui', 'sca'],
  eth: ['sui', 'sca'],
  btc: ['sui', 'sca'],
  sol: ['sui', 'sca'],
};

export const coinIds: AssetCoinIds = {
  sui: '0x0000000000000000000000000000000000000000000000000000000000000002',
  eth: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5',
  btc: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881',
  usdc: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf',
  usdt: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c',
  apt: '0x3a5143bb1196e3bcdfab6203d1683ae29edd26294fc8bfeafe4aaa9d2704df37',
  sol: '0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8',
  cetus: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
  afsui: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc',
  hasui: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d',
  vsui: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
  sca: '0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6',
};

export const wormholeCoinIds: WormholeCoinIds = {
  eth: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5',
  btc: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881',
  usdc: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf',
  usdt: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c',
  apt: '0x3a5143bb1196e3bcdfab6203d1683ae29edd26294fc8bfeafe4aaa9d2704df37',
  sol: '0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8',
};

export const voloCoinIds: VoloCoinIds = {
  vsui: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
};

// PROD VERSION
export const sCoinIds: SCoinIds = {
  ssui: '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI',
  scetus: '0xea346ce428f91ab007210443efcea5f5cdbbb3aae7e9affc0ca93f9203c31f0c::scallop_cetus::SCALLOP_CETUS',
  ssca: '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA',
  susdc:
    '0xad4d71551d31092230db1fd482008ea42867dbf27b286e9c70a79d2a6191d58d::scallop_wormhole_usdc::SCALLOP_WORMHOLE_USDC',
  susdt:
    '0xe6e5a012ec20a49a3d1d57bd2b67140b96cd4d3400b9d79e541f7bdbab661f95::scallop_wormhole_usdt::SCALLOP_WORMHOLE_USDT',
  seth: '0x67540ceb850d418679e69f1fb6b2093d6df78a2a699ffc733f7646096d552e9b::scallop_wormhole_eth::SCALLOP_WORMHOLE_ETH',
  safsui: '0x00671b1fa2a124f5be8bdae8b91ee711462c5d9e31bda232e70fd9607b523c88::scallop_af_sui::SCALLOP_AF_SUI',
  shasui: '0x9a2376943f7d22f88087c259c5889925f332ca4347e669dc37d54c2bf651af3c::scallop_ha_sui::SCALLOP_HA_SUI',
  svsui: '0xe1a1cc6bcf0001a015eab84bcc6713393ce20535f55b8b6f35c142e057a25fbe::scallop_v_sui::SCALLOP_V_SUI',
} as const;
