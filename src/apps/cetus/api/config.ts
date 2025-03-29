import { AggregatorClient, Env } from '@cetusprotocol/aggregator-sdk';
import { CetusPeripherySDK, SdkOptions as PeripherySdkOptions } from '@cetusprotocol/cetus-periphery-sdk';
import { CetusClmmSDK, SdkOptions } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { CetusXcetusSDK, SdkOptions as XcetusSdkOptions } from '@cetusprotocol/cetus-xcetus-sdk';
import CetusVaultsSDK from '@cetusprotocol/vaults-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '../types';

export const clmmConfig: SdkOptions = {
  fullRpcUrl: getFullnodeUrl('mainnet'),
  simulationAccount: {
    address: '0x326ce9894f08dcaa337fa232641cc34db957aec9ff6614c1186bc9a7508df0bb',
  },
  cetus_config: {
    package_id: '0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f',
    published_at: '0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f',
    config: {
      coin_list_id: '0x8cbc11d9e10140db3d230f50b4d30e9b721201c0083615441707ffec1ef77b23',
      launchpad_pools_id: '0x1098fac992eab3a0ab7acf15bb654fc1cf29b5a6142c4ef1058e6c408dd15115',
      clmm_pools_id: '0x15b6a27dd9ae03eb455aba03b39e29aad74abd3757b8e18c0755651b2ae5b71e',
      admin_cap_id: '0x39d78781750e193ce35c45ff32c6c0c3f2941fa3ddaf8595c90c555589ddb113',
      global_config_id: '0x0408fa4e4a4c03cc0de8f23d0c2bbfe8913d178713c9a271ed4080973fe42d8f',
      coin_list_handle: '0x49136005e90e28c4695419ed4194cc240603f1ea8eb84e62275eaff088a71063',
      launchpad_pools_handle: '0x5e194a8efcf653830daf85a85b52e3ae8f65dc39481d54b2382acda25068375c',
      clmm_pools_handle: '0x37f60eb2d9d227949b95da8fea810db3c32d1e1fa8ed87434fc51664f87d83cb',
    },
  },
  clmm_pool: {
    package_id: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
    published_at: '0xc6faf3703b0e8ba9ed06b7851134bbbe7565eb35ff823fd78432baa4cbeaa12e',
    version: 4,
    config: {
      pools_id: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
      global_config_id: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
      global_vault_id: '0xce7bceef26d3ad1f6d9b6f13a953f053e6ed3ca77907516481ce99ae8e588f2b',
      admin_cap_id: '',
    },
  },
  integrate: {
    package_id: '0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3',
    published_at: '0x2d8c2e0fc6dd25b0214b3fa747e0fd27fd54608142cd2e4f64c1cd350cc4add4',
    version: 6,
  },
  deepbook: {
    package_id: '0x000000000000000000000000000000000000000000000000000000000000dee9',
    published_at: '0x000000000000000000000000000000000000000000000000000000000000dee9',
  },
  deepbook_endpoint_v2: {
    package_id: '0x92aee86c01c79146d23938a00c7fff725ee0688c389be36d1bcbe03761b466c6',
    published_at: '0x92aee86c01c79146d23938a00c7fff725ee0688c389be36d1bcbe03761b466c6',
  },
  aggregatorUrl: 'https://api-sui.cetus.zone/router',
  swapCountUrl: 'https://api-sui.cetus.zone/v2/sui/swap/count',
};

export const peripheryConfig: PeripherySdkOptions = {
  launchpad: {
    package_id: '0x80d114c5d474eabc2eb2fcd1a0903f1eb5b5096a8dc4184d72453f7a9be728e4',
    published_at: '0x80d114c5d474eabc2eb2fcd1a0903f1eb5b5096a8dc4184d72453f7a9be728e4',
    config: {
      pools_id: '0xfd8d37f7a1276878972d240302c8efe32f577220c1bbc6c8984d8b60dddfcab3',
      admin_cap_id: '0x66c70d58c69353714cc6fe2d3a62492d605a96a9821e2bd8274de17219c69980',
      config_cap_id: '0x02b8d23f033687579966e182c776fe0287cacdbb18bff56c29f141e29a18a4d1',
    },
  },
  ido: {
    package_id: '0x1192c9e20b4b0a8848a73a8c711b43e38f7ea1f307b556aab6ffab4e982e9c59',
    published_at: '0x1192c9e20b4b0a8848a73a8c711b43e38f7ea1f307b556aab6ffab4e982e9c59',
    config: {
      pools_id: '0xefc209b47acf1f23b29d166440904600229e520ad36228aaf2329b7c16be9762',
      admin_cap_id: '0x281859d366951830aeeda90779aa170d8ee6845875545470d33ecb890e78c8ce',
      package_version_id: '0xc93dc996106770af5f4e979b6808518f8cee080f22f35b936f071f59d834bb22',
    },
  },
  xcetus: {
    package_id: '0x9e69acc50ca03bc943c4f7c5304c2a6002d507b51c11913b247159c60422c606',
    published_at: '0x9e69acc50ca03bc943c4f7c5304c2a6002d507b51c11913b247159c60422c606',
    config: {
      xcetus_manager_id: '0x838b3dbade12b1e602efcaf8c8b818fae643e43176462bf14fd196afa59d1d9d',
      lock_manager_id: '0x288b59d9dedb51d0bb6cb5e13bfb30885ecf44f8c9076b6f5221c5ef6644fd28',
      lock_handle_id: '0x7c534bb7b8a2cc21538d0dbedd2437cc64f47106cb4c259b9ff921b5c3cb1a49',
    },
  },
  xcetus_dividends: {
    package_id: '0x785248249ac457dfd378bdc6d2fbbfec9d1daf65e9d728b820eb4888c8da2c10',
    published_at: '0x5aa58e1623885bd93de2331d05c29bf4930e54e56beeabcab8fe5385de2d31dc',
    config: {
      dividend_manager_id: '0x721c990bfc031d074341c6059a113a59c1febfbd2faeb62d49dcead8408fa6b5',
      dividend_admin_id: '0x682ba823134f156eac2bcfb27d85a284954a0e61998dc628c40b9bcb4a46ff30',
      dividend_settle_id: '0xade40abe9f6dd10b83b11085be18f07b63b681cf1c169b041fa16854403388c5',
      venft_dividends_id: '0x9dcdb97b4307684bedaeaf803d381b12321a31ecbb9dad7df2cd5f64384f9456',
      venft_dividends_id_v2: '0xaa21fbc1707786d56302952f8327362f4eb9a431a5bc574834e6d46125390de3',
    },
  },
  cetus_faucet: {
    package_id: '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
    published_at: '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
  },
  xtoken: {
    package_id: '',
    published_at: '',
    config: {
      xtoken_manager_id: '',
      lock_manager_id: '',
      lock_handle_id: '',
    },
  },
  xtoken_dividends: {
    package_id: '',
    published_at: '',
    config: {
      dividend_manager_id: '',
      dividend_admin_id: '',
      dividend_settle_id: '',
    },
  },
  token_faucet: {
    package_id: '',
    published_at: '',
  },
  booster: {
    package_id: '',
    published_at: '',
    config: {
      booster_config_id: '',
      booster_pool_handle: '',
    },
  },
  maker_bonus: {
    package_id: '',
    published_at: '',
    config: {
      maker_config_id: '',
      maker_pool_handle: '',
    },
  },
  liquidity_stratefy: {
    package_id: '',
    published_at: '',
    version: undefined,
    config: undefined,
  },
  vaults: {
    package_id: '0xd3453d9be7e35efe222f78a810bb3af1859fd1600926afced8b4936d825c9a05',
    published_at: '0x58e5de6e425397eeaf952d55c0f94637bee91b25d6138ce222f89cda0aefec03',
    version: 1,
    config: {
      admin_cap_id: '0x78a42978709c4032fab7b33b782b5bcef64c1c6603250bf23644650b72144375',
      vaults_manager_id: '0x25b82dd2f5ee486ed1c8af144b89a8931cd9c29dee3a86a1bfe194fdea9d04a6',
      vaults_pool_handle: '0x9036bcc5aa7fd2cceec1659a6a1082871f45bc400c743f50063363457d1738bd',
      haedal: {
        package_id: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d',
        published_at: '0xaabf0856070391df81fad9240049d69c5a51c3d376cc0885eeedd516526cc79b',
        version: 1,
        config: {
          staking_id: '0x47b224762220393057ebf4f70501b6e657c3e56684737568439a04f80849b2ca',
          coin_type: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
        },
      },
      volo: {
        package_id: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
        published_at: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
        version: 1,
        config: {
          native_pool: '0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf',
          vsui_metadata: '0x680cd26af32b2bde8d3361e804c53ec1d1cfe24c7f039eb7f549e8dfde389a60',
          coin_type: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
        },
      },
      aftermath: {
        package_id: '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6',
        published_at: '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6',
        version: 1,
        config: {
          staked_sui_vault: '0x2f8f6d5da7f13ea37daa397724280483ed062769813b6f31e9788e59cc88994d',
          referral_vault: '0x4ce9a19b594599536c53edb25d22532f82f18038dc8ef618afd00fbbfb9845ef',
          safe: '0xeb685899830dd5837b47007809c76d91a098d52aabbf61e8ac467c59e5cc4610',
          validator_address: '0xd30018ec3f5ff1a3c75656abf927a87d7f0529e6dc89c7ddd1bd27ecb05e3db2',
          coin_type: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
        },
      },
    },
  },
  limit_order: {
    package_id: '',
    published_at: '',
    version: 1,
    config: {
      rate_orders_indexer_id: '',
      rate_orders_indexer_handle: '',
      global_config_id: '',
      token_list_handle: '',
      user_orders_indexer_id: '',
      user_orders_indexer_handle: '',
    },
  },
  frams: {
    package_id: '0x11ea791d82b5742cc8cab0bf7946035c97d9001d7c3803a93f119753da66f526',
    published_at: '0x7e4ca066f06a1132ab0499c8c0b87f847a0d90684afa902e52501a44dbd81992',
    version: 1,
    config: {
      global_config_id: '0x21215f2f6de04b57dd87d9be7bb4e15499aec935e36078e2488f36436d64996e',
      rewarder_manager_id: '0xe0e155a88c77025056da08db5b1701a91b79edb6167462f768e387c3ed6614d5',
      rewarder_manager_handle: '0xb32e312cbb3367d6f3d2b4e57c9225e903d29b7b9f612dae2ddf75bdeb26a5aa',
      admin_cap_id: '0xf10fbf1fea5b7aeaa524b87769461a28c5c977613046360093673991f26d886c',
    },
  },
  dca: {
    package_id: '',
    published_at: '',
    version: 0,
    config: {
      admin_cap_id: '',
      global_config_id: '',
      indexer_id: '',
      user_indexer_id: '',
      in_coin_whitelist_id: '',
      out_coin_whitelist_id: '',
    },
  },
};

export const xcetusConfig: XcetusSdkOptions = {
  fullRpcUrl: getFullnodeUrl('mainnet'),
  simulationAccount: {
    address: '0x326ce9894f08dcaa337fa232641cc34db957aec9ff6614c1186bc9a7508df0bb',
  },
  xcetus: {
    package_id: '0x9e69acc50ca03bc943c4f7c5304c2a6002d507b51c11913b247159c60422c606',
    published_at: '0x9e69acc50ca03bc943c4f7c5304c2a6002d507b51c11913b247159c60422c606',
    config: {
      xcetus_manager_id: '0x838b3dbade12b1e602efcaf8c8b818fae643e43176462bf14fd196afa59d1d9d',
      lock_manager_id: '0x288b59d9dedb51d0bb6cb5e13bfb30885ecf44f8c9076b6f5221c5ef6644fd28',
      lock_handle_id: '0x7c534bb7b8a2cc21538d0dbedd2437cc64f47106cb4c259b9ff921b5c3cb1a49',
    },
  },
  xcetus_dividends: {
    package_id: '0x785248249ac457dfd378bdc6d2fbbfec9d1daf65e9d728b820eb4888c8da2c10',
    published_at: '0x5aa58e1623885bd93de2331d05c29bf4930e54e56beeabcab8fe5385de2d31dc',
    version: 4,
    config: {
      dividend_manager_id: '0x721c990bfc031d074341c6059a113a59c1febfbd2faeb62d49dcead8408fa6b5',
      dividend_admin_id: '0x682ba823134f156eac2bcfb27d85a284954a0e61998dc628c40b9bcb4a46ff30',
      dividend_settle_id: '0xade40abe9f6dd10b83b11085be18f07b63b681cf1c169b041fa16854403388c5',
      venft_dividends_id: '0x9dcdb97b4307684bedaeaf803d381b12321a31ecbb9dad7df2cd5f64384f9456',
      venft_dividends_id_v2: '0xaa21fbc1707786d56302952f8327362f4eb9a431a5bc574834e6d46125390de3',
    },
  },
  cetus_faucet: {
    package_id: '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
    published_at: '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
  },
};

export const getClmmSdk = (network: SuiNetworks, account: WalletAccount) => {
  const config = clmmConfig;
  const clmmSdk = new CetusClmmSDK(config);
  clmmSdk.senderAddress = account.address;
  return clmmSdk;
};

export const getPeripherySdk = (network: SuiNetworks, account: WalletAccount) => {
  const clmmSdk = getClmmSdk(network, account);
  const config = peripheryConfig;
  const peripherySdk = new CetusPeripherySDK(config, clmmSdk);
  return peripherySdk;
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

const vaultsSDKOptions = {
  fullRpcUrl: 'https://fullnode.mainnet.sui.io/',
  simulationAccount: {
    address: '0x326ce9894f08dcaa337fa232641cc34db957aec9ff6614c1186bc9a7508df0bb',
  },
  clmm_pool: {
    package_id: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
    published_at: '0xc6faf3703b0e8ba9ed06b7851134bbbe7565eb35ff823fd78432baa4cbeaa12e',
    config: {
      pools_id: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
      global_config_id: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
      global_vault_id: '0xce7bceef26d3ad1f6d9b6f13a953f053e6ed3ca77907516481ce99ae8e588f2b',
      admin_cap_id: '',
    },
  },
  integrate: {
    package_id: '0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3',
    published_at: '0x2d8c2e0fc6dd25b0214b3fa747e0fd27fd54608142cd2e4f64c1cd350cc4add4',
  },
  frams: {
    package_id: '0x11ea791d82b5742cc8cab0bf7946035c97d9001d7c3803a93f119753da66f526',
    published_at: '0x7e4ca066f06a1132ab0499c8c0b87f847a0d90684afa902e52501a44dbd81992',
    config: {
      global_config_id: '0x21215f2f6de04b57dd87d9be7bb4e15499aec935e36078e2488f36436d64996e',
      rewarder_manager_id: '0xe0e155a88c77025056da08db5b1701a91b79edb6167462f768e387c3ed6614d5',
      rewarder_manager_handle: '0xb32e312cbb3367d6f3d2b4e57c9225e903d29b7b9f612dae2ddf75bdeb26a5aa',
      admin_cap_id: '0xf10fbf1fea5b7aeaa524b87769461a28c5c977613046360093673991f26d886c',
    },
  },
  vaults: {
    package_id: '0xd3453d9be7e35efe222f78a810bb3af1859fd1600926afced8b4936d825c9a05',
    published_at: '0x58e5de6e425397eeaf952d55c0f94637bee91b25d6138ce222f89cda0aefec03',
    config: {
      admin_cap_id: '0x78a42978709c4032fab7b33b782b5bcef64c1c6603250bf23644650b72144375',
      vaults_manager_id: '0x25b82dd2f5ee486ed1c8af144b89a8931cd9c29dee3a86a1bfe194fdea9d04a6',
      vaults_pool_handle: '0x9036bcc5aa7fd2cceec1659a6a1082871f45bc400c743f50063363457d1738bd',
      haedal: {
        package_id: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d',
        published_at: '0xaabf0856070391df81fad9240049d69c5a51c3d376cc0885eeedd516526cc79b',
        version: 1,
        config: {
          staking_id: '0x47b224762220393057ebf4f70501b6e657c3e56684737568439a04f80849b2ca',
          coin_type: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
        },
      },
      volo: {
        package_id: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
        published_at: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55',
        version: 1,
        config: {
          native_pool: '0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf',
          vsui_metadata: '0x680cd26af32b2bde8d3361e804c53ec1d1cfe24c7f039eb7f549e8dfde389a60',
          coin_type: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
        },
      },
      aftermath: {
        package_id: '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6',
        published_at: '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6',
        version: 1,
        config: {
          staked_sui_vault: '0x2f8f6d5da7f13ea37daa397724280483ed062769813b6f31e9788e59cc88994d',
          referral_vault: '0x4ce9a19b594599536c53edb25d22532f82f18038dc8ef618afd00fbbfb9845ef',
          safe: '0xeb685899830dd5837b47007809c76d91a098d52aabbf61e8ac467c59e5cc4610',
          validator_address: '0xd30018ec3f5ff1a3c75656abf927a87d7f0529e6dc89c7ddd1bd27ecb05e3db2',
          coin_type: '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
        },
      },
    },
  },
  aggregator: {
    endPoint: 'https://api-sui.cetus.zone/router_v2/find_routes',
    fullNodeurl: 'https://fullnode.mainnet.sui.io/',
    walletAddress: '0x326ce9894f08dcaa337fa232641cc34db957aec9ff6614c1186bc9a7508df0bb',
    env: Env.Mainnet,
    providers: [
      'CETUS',
      'DEEPBOOK',
      'KRIYA',
      'KRIYAV3',
      'FLOWX',
      'FLOWXV3',
      'AFTERMATH',
      'TURBOS',
      'HAEDAL',
      'VOLO',
      'AFSUI',
    ],
  },
};

export const getVaultsSdk = (network: SuiNetworks, account: WalletAccount) => {
  const vaultsSDK: any = new CetusVaultsSDK(vaultsSDKOptions);
  vaultsSDK.senderAddress = account.address;
  return vaultsSDK;
};

export const getXcetusSdk = (network: SuiNetworks, account: WalletAccount) => {
  const xcetusSDk: any = new CetusXcetusSDK(xcetusConfig);
  xcetusSDk.senderAddress = account.address;
  return xcetusSDk;
};
