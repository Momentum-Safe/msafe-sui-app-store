import { CetusPeripherySDK, SdkOptions as PeripherySdkOptions } from '@cetusprotocol/cetus-periphery-sdk';
import { CetusClmmSDK, SdkOptions } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '../types';

export const clmmConfig: SdkOptions = {
  fullRpcUrl: 'https://fullnode.mainnet.sui.io/',
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
    published_at: '0x70968826ad1b4ba895753f634b0aea68d0672908ca1075a2abdf0fc9e0b2fc6a',
    version: 4,
    config: {
      pools_id: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
      global_config_id: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
      global_vault_id: '0xce7bceef26d3ad1f6d9b6f13a953f053e6ed3ca77907516481ce99ae8e588f2b',
      admin_cap_id: '0x89c1a321291d15ddae5a086c9abc533dff697fde3d89e0ca836c41af73e36a75',
    },
  },
  integrate: {
    package_id: '0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3',
    published_at: '0x6f5e582ede61fe5395b50c4a449ec11479a54d7ff8e0158247adfda60d98970b',
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
    published_at: '0xcec352932edc6663a118e8d64ed54da6b8107e8719603bf728f80717592cd9e8',
    version: 3,
    config: {
      dividend_manager_id: '0x721c990bfc031d074341c6059a113a59c1febfbd2faeb62d49dcead8408fa6b5',
      dividend_admin_id: '',
      dividend_settle_id: '',
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
    published_at: '0x016b8ce6560f55bfe02abb2cc0681bb91f767107cfb1c9b6e73a6bcf74492a02',
    version: 1,
    config: {
      admin_cap_id: '0x78a42978709c4032fab7b33b782b5bcef64c1c6603250bf23644650b72144375',
      vaults_manager_id: '0x25b82dd2f5ee486ed1c8af144b89a8931cd9c29dee3a86a1bfe194fdea9d04a6',
      vaults_pool_handle: '0x9036bcc5aa7fd2cceec1659a6a1082871f45bc400c743f50063363457d1738bd',
      haedal: {
        package_id: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d',
        published_at: '0x1d56b8ec33c3fae897eb7bb1acb79914e8152faed614868928e684c25c8b198d',
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
    published_at: '0xd817d90368dafcbf3b051e96546dea6209bffad23289d66025beef80354dcd6b',
    version: 1,
    config: {
      global_config_id: '0x21215f2f6de04b57dd87d9be7bb4e15499aec935e36078e2488f36436d64996e',
      rewarder_manager_id: '0xe0e155a88c77025056da08db5b1701a91b79edb6167462f768e387c3ed6614d5',
      rewarder_manager_handle: '0xb32e312cbb3367d6f3d2b4e57c9225e903d29b7b9f612dae2ddf75bdeb26a5aa',
      admin_cap_id: '0xf10fbf1fea5b7aeaa524b87769461a28c5c977613046360093673991f26d886c',
    },
  },
};

export const clmmConfigTestnet: SdkOptions = {
  fullRpcUrl: 'https://fullnode.testnet.sui.io/',
  simulationAccount: {
    address: '0xcd0247d0b67e53dde69b285e7a748e3dc390e8a5244eb9dd9c5c53d95e4cf0aa',
  },
  cetus_config: {
    package_id: '0xf5ff7d5ba73b581bca6b4b9fa0049cd320360abd154b809f8700a8fd3cfaf7ca',
    published_at: '0xf5ff7d5ba73b581bca6b4b9fa0049cd320360abd154b809f8700a8fd3cfaf7ca',
    config: {
      coin_list_id: '0x257eb2ba592a5480bba0a97d05338fab17cc3283f8df6998a0e12e4ab9b84478',
      launchpad_pools_id: '0xdc3a7bd66a6dcff73c77c866e87d73826e446e9171f34e1c1b656377314f94da',
      clmm_pools_id: '0x26c85500f5dd2983bf35123918a144de24e18936d0b234ef2b49fbb2d3d6307d',
      admin_cap_id: '0x1a496f6c67668eb2c27c99e07e1d61754715c1acf86dac45020c886ac601edb8',
      global_config_id: '0xe1f3db327e75f7ec30585fa52241edf66f7e359ef550b533f89aa1528dd1be52',
      coin_list_handle: '0x3204350fc603609c91675e07b8f9ac0999b9607d83845086321fca7f469de235',
      launchpad_pools_handle: '0xae67ff87c34aceea4d28107f9c6c62e297a111e9f8e70b9abbc2f4c9f5ec20fd',
      clmm_pools_handle: '0xd28736923703342b4752f5ed8c2f2a5c0cb2336c30e1fed42b387234ce8408ec',
    },
  },
  clmm_pool: {
    package_id: '0x0868b71c0cba55bf0faf6c40df8c179c67a4d0ba0e79965b68b3d72d7dfbf666',
    published_at: '0x1c29d658882c40eeb39a8bb8fe58f71a216a918acb3e3eb3b47d24efd07257f2',
    config: {
      pools_id: '0xc090b101978bd6370def2666b7a31d7d07704f84e833e108a969eda86150e8cf',
      global_config_id: '0x6f4149091a5aea0e818e7243a13adcfb403842d670b9a2089de058512620687a',
      global_vault_id: '0xf3114a74d54cbe56b3e68f9306661c043ede8c6615f0351b0c3a93ce895e1699',
      admin_cap_id: '',
    },
  },
  integrate: {
    package_id: '0x8627c5cdcd8b63bc3daa09a6ab7ed81a829a90cafce6003ae13372d611fbb1a9',
    published_at: '0xf1a5d0c5b0593e41d13f9684ca91365bdfe54a98836c1d33c90e361a031fac74',
    version: 6,
  },
  deepbook: {
    package_id: '0x000000000000000000000000000000000000000000000000000000000000dee9',
    published_at: '0x000000000000000000000000000000000000000000000000000000000000dee9',
  },
  deepbook_endpoint_v2: {
    package_id: '0xa34ffca2c6540e1ca9e53963ab43e7b1eed7b82e37696c743bb7c6179c15dfa6',
    published_at: '0xa34ffca2c6540e1ca9e53963ab43e7b1eed7b82e37696c743bb7c6179c15dfa6',
  },
  aggregatorUrl: 'https://api-sui.devcetus.com/router',
  swapCountUrl: 'https://api-sui.devcetus.com/v2/sui/swap/count',
};

export const peripheryConfigTestnet: PeripherySdkOptions = {
  launchpad: {
    package_id: '0x3beee8416089a5cbff9cfd5c0a2ce2937b0452dc7e2a3ab4dc431c7be05c2335',
    published_at: '0x3beee8416089a5cbff9cfd5c0a2ce2937b0452dc7e2a3ab4dc431c7be05c2335',
    config: {
      pools_id: '0xccc10403ab3da4ae943847908e0e674fe1fdab81c6383e4c6dcd0eea0edade3d',
      admin_cap_id: '0x8a72713049dbcfc40902ff209dc5e6066fe455d152baa235957c84d7a3b875ed',
      config_cap_id: '0x16492b4252b01debb60f8a825334020d7fdb9d895b52f8139c98618de30817fc',
    },
  },
  ido: {
    package_id: '0x1352bf18ef20458f7cc773852d4a90b240015a6a54479dda3a1debfc500bf044',
    published_at: '0xbd09a0889ea9970b821512428bab3e2fd01e16809a90a325cd3b3d3573eab6a4',
    config: {
      pools_id: '0x346bee25ab4d15bcfa9484ef5ebd4d7c94eb665ebaa745ff4094936a7f59a8b1',
      admin_cap_id: '0xc1bb19a24d3bb65dfd4f3835637b63347c223c67cde4b0888f1a857974f33cbb',
      package_version_id: '0x3ccf1b38e3259e638b980d4e6b49eac8c5aa94d3cb2ace5e75f0a551c8e67e5e',
    },
  },
  xcetus: {
    package_id: '0xdebaab6b851fd3414c0a62dbdf8eb752d6b0d31f5cfce5e38541bc6c6daa8966',
    published_at: '0xdebaab6b851fd3414c0a62dbdf8eb752d6b0d31f5cfce5e38541bc6c6daa8966',
    config: {
      xcetus_manager_id: '0x3be34cbad122c8b100ed7157d762b9610e68b3c65734e08bc3c3baf857da807d',
      lock_manager_id: '0x7c67e805182e3fecd098bd68a6b06c317f28f8c6249bd771e07904a10b424e60',
      lock_handle_id: '0xc5f3bbfefe9a45c13da7a34bc72cac122ee45d633690476a8ac56bd2c4e78c86',
    },
  },
  xcetus_dividends: {
    package_id: '0x20d948d640edd0c749f533d41efc5f843f212d441220324ad7959c6e1d281828',
    published_at: '0x20d948d640edd0c749f533d41efc5f843f212d441220324ad7959c6e1d281828',
    config: {
      dividend_manager_id: '0x13b7facb704fae1d199ff0038b8acabc253415a77d142b39189dee97d457e442',
      dividend_admin_id: '0x5eb78463007422d4130b21f61c180bcd190819b7792f56e00a61df3b8fb928ef',
      dividend_settle_id: '0x495095e13a170ff494d242ae44ac2c7453011ca6c33cff27498010105e10e4b4',
    },
  },
  cetus_faucet: {
    package_id: '0x1a69aee6be709054750949959a67aedbb4200583b39586d5e3eabe57f40012c7',
    published_at: '0x1a69aee6be709054750949959a67aedbb4200583b39586d5e3eabe57f40012c7',
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
    package_id: '0x25cff94bdb454bae6a5565d09047bfe2b230025ef3bd2199622ec48d854b86b9',
    published_at: '0x25cff94bdb454bae6a5565d09047bfe2b230025ef3bd2199622ec48d854b86b9',
    config: {
      admin_cap_id: '0x9b2d6f5be2650d16d27cd630c4539a76d7793970343ed3cbb023e13f1637c07c',
      vaults_manager_id: '0xc0a1a937df08880e395d85014ff40c74f13abe7a53abdbffea36f51adaaaf79e',
      vaults_pool_handle: '0x3ab02203de753de9c8198cc0ce7594dc960878f2c34c5c5a4b7742082241860a',
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
    package_id: '0xfa0d98e99c1dbdbea1b0fe089fa93ebab40a7719ae4160c42cc78ebfe029fda0',
    published_at: '0xfa0d98e99c1dbdbea1b0fe089fa93ebab40a7719ae4160c42cc78ebfe029fda0',
    config: {
      global_config_id: '0x5082c7a5ee9a758025d7b0a5e8aa08b56625c7cd535b8909d2b7993991e229cc',
      rewarder_manager_id: '0xe789e092dbd9dceadbe89350c4761a6f2e11647aab97f09746a01b151926cc0e',
      rewarder_manager_handle: '0x7e7dd42392b5d82564dc9ad5093a111c5f0598cc9f806cff257d7dacb71f7837',
      admin_cap_id: '0x4ec248bca2d1fc05f39fd7491ab490464a46d128624caa4d3c2a66d957ef40b0',
    },
  },
};

export const getClmmSdk = (network: SuiNetworks, account: WalletAccount) => {
  const config = network === 'sui:mainnet' ? clmmConfig : clmmConfigTestnet;
  const clmmSdk = new CetusClmmSDK(config);
  clmmSdk.senderAddress = account.address;
  return clmmSdk;
};

export const getPeripherySdk = (network: SuiNetworks, account: WalletAccount) => {
  const clmmSdk = getClmmSdk(network, account);
  const config = network === 'sui:mainnet' ? peripheryConfig : peripheryConfigTestnet;
  const peripherySdk = new CetusPeripherySDK(config, clmmSdk);
  return peripherySdk;
};
