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
  weth: 8,
  wbtc: 8,
  wusdc: 6,
  usdc: 6,
  wusdt: 6,
  sui: 9,
  wapt: 8,
  wsol: 8,
  sca: 9,
  cetus: 9,
  afsui: 9,
  hasui: 9,
  vsui: 9,
  fud: 5,
  deep: 6,
  fdusd: 6,
  sweth: 8,
  swbtc: 8,
  susdc: 6,
  swusdt: 6,
  swusdc: 6,
  ssui: 9,
  swapt: 8,
  swsol: 8,
  scetus: 9,
  safsui: 9,
  shasui: 9,
  svsui: 9,
  ssca: 9,
  sdeep: 6,
  sfud: 5,
  sfdusd: 6,
  scallop_deep: 6,
  scallop_fud: 5,
  scallop_sca: 9,
  scallop_sui: 9,
};

export const assetCoins: AssetCoins = {
  weth: 'weth',
  wbtc: 'wbtc',
  wusdc: 'wusdc',
  usdc: 'usdc',
  wusdt: 'wusdt',
  sui: 'sui',
  wapt: 'wapt',
  wsol: 'wsol',
  cetus: 'cetus',
  afsui: 'afsui',
  hasui: 'hasui',
  vsui: 'vsui',
  sca: 'sca',
  fud: 'fud',
  deep: 'deep',
  fdusd: 'fdusd',
  scallop_deep: 'scallop_deep',
  scallop_fud: 'scallop_fud',
  scallop_sca: 'scallop_sca',
  scallop_sui: 'scallop_sui',
};

export const marketCoins: MarketCoins = {
  sweth: 'sweth',
  swbtc: 'swbtc',
  swusdc: 'swusdc',
  swusdt: 'swusdt',
  ssui: 'ssui',
  swapt: 'swapt',
  swsol: 'swsol',
  scetus: 'scetus',
  safsui: 'safsui',
  shasui: 'shasui',
  svsui: 'svsui',
  ssca: 'ssca',
  susdc: 'susdc',
  sfdusd: 'sfdusd',
  sdeep: 'sdeep',
  sfud: 'sfud',
};

export const stakeMarketCoins: StakeMarketCoins = {
  sweth: 'sweth',
  ssui: 'ssui',
  susdc: 'susdc',
  swusdt: 'swusdt',
  swusdc: 'swusdc',
  scetus: 'scetus',
  safsui: 'safsui',
  shasui: 'shasui',
  svsui: 'svsui',
};

export const spoolRewardCoins: StakeRewardCoins = {
  sweth: 'sui',
  ssui: 'sui',
  swusdc: 'sui',
  swusdt: 'sui',
  scetus: 'sui',
  safsui: 'sui',
  shasui: 'sui',
  svsui: 'sui',
  susdc: 'sui',
};

export const borrowIncentiveRewardCoins: BorrowIncentiveRewardCoins = {
  sui: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  wusdc: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  wusdt: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  afsui: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  hasui: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  vsui: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  sca: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  weth: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  wbtc: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  wsol: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  usdc: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
  fud: ['sui', 'sca', 'scallop_fud', 'scallop_sui', 'scallop_sca'],
  deep: ['sui', 'sca', 'scallop_deep', 'scallop_sui', 'scallop_sca'],
  fdusd: ['sui', 'sca', 'scallop_sca', 'scallop_sui'],
};

export const coinIds: AssetCoinIds = {
  sui: '0x0000000000000000000000000000000000000000000000000000000000000002',
  weth: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5',
  wbtc: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881',
  wusdc: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf',
  wusdt: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c',
  wapt: '0x3a5143bb1196e3bcdfab6203d1683ae29edd26294fc8bfeafe4aaa9d2704df37',
  wsol: '0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8',
  cetus: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
  afsui: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc',
  hasui: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d',
  vsui: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
  sca: '0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6',
  usdc: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7',
  fud: '0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1',
  deep: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270',
  fdusd: '0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a',
  scallop_deep: '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f',
  scallop_fud: '0xe56d5167f427cbe597da9e8150ef5c337839aaf46891d62468dcf80bdd8e10d1',
  scallop_sca: '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e',
  scallop_sui: '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b',
};

export const wormholeCoinIds: WormholeCoinIds = {
  weth: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5',
  wbtc: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881',
  wusdc: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf',
  wusdt: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c',
  wapt: '0x3a5143bb1196e3bcdfab6203d1683ae29edd26294fc8bfeafe4aaa9d2704df37',
  wsol: '0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8',
};

export const voloCoinIds: VoloCoinIds = {
  vsui: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
};

// PROD VERSION
export const sCoinIds: SCoinIds = {
  ssui: '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI',
  scetus: '0xea346ce428f91ab007210443efcea5f5cdbbb3aae7e9affc0ca93f9203c31f0c::scallop_cetus::SCALLOP_CETUS',
  ssca: '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA',
  swusdc:
    '0xad4d71551d31092230db1fd482008ea42867dbf27b286e9c70a79d2a6191d58d::scallop_wormhole_usdc::SCALLOP_WORMHOLE_USDC',
  swusdt:
    '0xe6e5a012ec20a49a3d1d57bd2b67140b96cd4d3400b9d79e541f7bdbab661f95::scallop_wormhole_usdt::SCALLOP_WORMHOLE_USDT',
  sweth:
    '0x67540ceb850d418679e69f1fb6b2093d6df78a2a699ffc733f7646096d552e9b::scallop_wormhole_eth::SCALLOP_WORMHOLE_ETH',
  safsui: '0x00671b1fa2a124f5be8bdae8b91ee711462c5d9e31bda232e70fd9607b523c88::scallop_af_sui::SCALLOP_AF_SUI',
  shasui: '0x9a2376943f7d22f88087c259c5889925f332ca4347e669dc37d54c2bf651af3c::scallop_ha_sui::SCALLOP_HA_SUI',
  svsui: '0xe1a1cc6bcf0001a015eab84bcc6713393ce20535f55b8b6f35c142e057a25fbe::scallop_v_sui::SCALLOP_V_SUI',
  swbtc:
    '0x2cf76a9cf5d3337961d1154283234f94da2dcff18544dfe5cbdef65f319591b5::scallop_wormhole_btc::SCALLOP_WORMHOLE_BTC',
  swsol:
    '0x1392650f2eca9e3f6ffae3ff89e42a3590d7102b80e2b430f674730bc30d3259::scallop_wormhole_sol::SCALLOP_WORMHOLE_SOL',
  susdc: '0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC',
  sfdusd: '0x6711551c1e7652a270d9fbf0eee25d99594c157cde3cb5fbb49035eb59b1b001::scallop_fdusd::SCALLOP_FDUSD',
  sdeep: '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP',
  sfud: '0xe56d5167f427cbe597da9e8150ef5c337839aaf46891d62468dcf80bdd8e10d1::scallop_fud::SCALLOP_FUD',
} as const;
