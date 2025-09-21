import { SuiClient } from '@firefly-exchange/library-sui';
import { IDeployment, UserCalls } from '@firefly-exchange/library-sui/dist/src/vaults';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from './types';

export const config = {
  rpc: 'https://fullnode.mainnet.sui.io/',
  mainnet: {
    UltraCoins: [
      {
        Package: '0x244b98d29bd0bba401c7cfdd89f017c51759dad615e15a872ddfe45af079bb1d',
        TreasuryCap: '0x565fb379ba47c8002f23b859f5af84a8d2aea9cb011894ad6a3427225a11fc60',
        Currency: '0x244b98d29bd0bba401c7cfdd89f017c51759dad615e15a872ddfe45af079bb1d::ebtc::EBTC',
        UpgradeCap: '0xe493fb23dc26a462e2e29f21f825800af9039e909d500685a0f7a0672f9ef48b',
        Symbol: 'eBTC',
        Decimals: 8,
      },
      {
        Currency: '0x65b3db01dd36de8706128d842ca3d738ed30bd72c155ea175a44aedca37d4caf::ebasis::EBASIS',
        TreasuryCap: '0x5014968aee3b6c453fe5919519957b214c81605eb1ff41fe66436a5b1af0bc84',
        Package: '0x65b3db01dd36de8706128d842ca3d738ed30bd72c155ea175a44aedca37d4caf',
        UpgradeCap: '0xe199ca0c37ae3916e1e40b6fcd24b0e92c0f33d6025e8166a0d17b8cc49b1937',
        Symbol: 'eBASIS',
        Decimals: 6,
      },
      {
        Currency: '0x4dc301602277552a6c2c3309b02a70f7aae27eeeb300863de9466b4c1be7d568::egsui::EGSUI',
        UpgradeCap: '0x35df350768ae2fd2ed95061176e09fe9a80389be9eb9931635fbb1dc12b3bf70',
        Package: '0x4dc301602277552a6c2c3309b02a70f7aae27eeeb300863de9466b4c1be7d568',
        TreasuryCap: '0xc28c53f2089ed690abe464eb9e0815c0d523af22d2637f5622c469ab72da55c0',
        Symbol: 'egSUI',
        Decimals: 9,
      },
      {
        Package: '0x68532559a19101b58757012207d82328e75fde7a696d20a59e8307c1a7f42ad7',
        Currency: '0x68532559a19101b58757012207d82328e75fde7a696d20a59e8307c1a7f42ad7::egusdc::EGUSDC',
        TreasuryCap: '0xa0403914167deb04e797168ee5fb8dec34cb68bc7e76f463f8818f0c25aeb966',
        UpgradeCap: '0xac8474727187dfda3333e56b0293277e88286ef278c39c4d8e5c8100881d5b45',
        Symbol: 'egUSDC',
        Decimals: 6,
      },
      {
        TreasuryCap: '0x55aa22ab6792bad79d35dcacb213a65d4b15e0202db395a973d58d85224e7d1e',
        Package: '0x66629328922d609cf15af779719e248ae0e63fe0b9d9739623f763b33a9c97da',
        UpgradeCap: '0xc63a5dcd595ea1f9c4c623f7027ff0c1142a11c8fcfd763dc12dd60544e2f66d',
        Currency: '0x66629328922d609cf15af779719e248ae0e63fe0b9d9739623f763b33a9c97da: :esui: :ESUI',
        Symbol: 'eSUI',
        Decimals: 9,
      },
      {
        TreasuryCap: '0x1cca9261f9c8c1520b418bbc69fd0b932943c5d169bcc23fb4c88ab943445cb1',
        UpgradeCap: '0x7306c14571d7f86764febd6eb2d7f870f5ac7d790ac051336c7cf926dfcffbca',
        Currency: '0xd84b887935d73110c8cb4b981f4925f83b7a20c41ac572840513422c5da283d6::eblue::EBLUE',
        Package: '0xd84b887935d73110c8cb4b981f4925f83b7a20c41ac572840513422c5da283d6',
        Symbol: 'eBLUE',
        Decimals: 9,
      },
      {
        UpgradeCap: '0x0ca90c8978182bbf09ed0ebff4ddff35a0e18393e58f64560bf13aebf8d08999',
        Package: '0x90cb9a8b94284a541e0501df915ebf5a248df832d1098a8b5ce4f5d9a03c77f0',
        TreasuryCap: '0x95d89830b2b8b58c17cf64933a8124e3bc214894822cbd0af90a77064f752d72',
        Currency: '0x90cb9a8b94284a541e0501df915ebf5a248df832d1098a8b5ce4f5d9a03c77f0::blp::BLP',
        Symbol: 'BLP',
        Decimals: 6,
      },
    ],
    VaultProtocol: {
      UpgradeCap: '0x298c2d3e0449655cb48b3d5599ea124bf47690e8eab175a7458c3d2ce3bdcefb',
      ProtocolConfig: '0x3a515233ab817af082ef31454cee5eb8122b8b7cd586bf6b26ae9b879ee1e565',
      AdminCap: '0xa593ac200faca510270802a377191c8304a7ad5f8fac742e7bb04ec58b1e3947',
      Package: '0x3635933713dc35fe5e34f598b32a9d78c3b68faeb8dc5a842c5c6e5d549f56d4',
    },
    Vaults: {
      'Ember BTC': {
        Admin: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Ember BTC',
        FeePercentage: '0',
        MinWithdrawalShares: '100',
        SubAccounts: ['0x566030cff58e0eea75f79e602309b8548666052a50f453b6bc7648b3e601d992'],
        ObjectId: '0x323578c2b24683ca845c68c1e2097697d65e235826a9dc931abce3b4b1e43642',
        ReceiptCoinType: '0x244b98d29bd0bba401c7cfdd89f017c51759dad615e15a872ddfe45af079bb1d::ebtc::EBTC',
        DepositCoinType: '0x77045f1b9f811a7a8fb9ebd085b5b0c55c5cb0d1520ff55f7037f89b5da9f5f1::TBTC::TBTC',
        DepositCoinDecimals: 8,
      },
      'Ember Basis': {
        Admin: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Ember Basis',
        FeePercentage: '0',
        MinWithdrawalShares: '100000',
        SubAccounts: ['0x66bce2a97c78c69be64833287adfeb0187152bcd3dbdccad85144482d5bbbf61'],
        ObjectId: '0x1fdbd27ba90a7a5385185e3e0b76477202f2cadb0e4343163288c5625e7c5505',
        ReceiptCoinType: '0x65b3db01dd36de8706128d842ca3d738ed30bd72c155ea175a44aedca37d4caf::ebasis::EBASIS',
        DepositCoinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
        DepositCoinDecimals: 6,
      },
      'Gamma SUI': {
        Admin: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Gamma SUI',
        FeePercentage: '0',
        MinWithdrawalShares: '100000000',
        SubAccounts: ['0x4b591d67996699077182c3e41e8c7ce02fe8ce79c18eaa0aad3573c81ceabd0e'],
        ObjectId: '0x3fe669ff41cd6ee8d9d6aa4b04d14336ac1c796800f499cb5bf321b9930d0cfe',
        ReceiptCoinType: '0x4dc301602277552a6c2c3309b02a70f7aae27eeeb300863de9466b4c1be7d568::egsui::EGSUI',
        DepositCoinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
        DepositCoinDecimals: 9,
      },
      'Gamma USDC': {
        Admin: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Gamma USDC',
        FeePercentage: '0',
        MinWithdrawalShares: '100000',
        SubAccounts: ['0xe617645106abc88fd4a67a3488850327eccb706fe212a6fdcdd424924da9cbf8'],
        ObjectId: '0x94c2826b24e44f710c5f80e3ed7ce898258d7008e3a643c894d90d276924d4b9',
        ReceiptCoinType: '0x68532559a19101b58757012207d82328e75fde7a696d20a59e8307c1a7f42ad7::egusdc::EGUSDC',
        DepositCoinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
        DepositCoinDecimals: 6,
      },
      'Ember SUI': {
        Admin: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Ember SUI',
        FeePercentage: '0',
        MinWithdrawalShares: '100000000',
        SubAccounts: [],
        ObjectId: '0xfaf4d0ec9b76147c926c0c8b2aba39ea21ec991500c1e3e53b60d447b0e5f655',
        ReceiptCoinType: '0x66629328922d609cf15af779719e248ae0e63fe0b9d9739623f763b33a9c97da::esui::ESUI',
        DepositCoinType: '0x2::sui::SUI',
        DepositCoinDecimals: 9,
      },
      'Ember BLUE': {
        Admin: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
        Operator: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
        Name: 'Ember BLUE',
        FeePercentage: '0',
        MinWithdrawalShares: '100000000',
        SubAccounts: [],
        ObjectId: '0xf8d500875677345b6c0110ee8a48abc7c4974ca697df71eefd229827565168d0',
        ReceiptCoinType: '0xd84b887935d73110c8cb4b981f4925f83b7a20c41ac572840513422c5da283d6::eblue::EBLUE',
        DepositCoinType: '0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE',
        DepositCoinDecimals: 9,
      },
      'Bluefin Liquidity Provider': {
        Admin: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
        Operator: '0x640cb05a00f3cf5f872bc99f892bccd28cbe61fcaef402727263a18cd5b505e1',
        Name: 'Bluefin Liquidity Provider',
        FeePercentage: '0',
        MinWithdrawalShares: '100000000',
        SubAccounts: [],
        ObjectId: '0x60afd035fd99de179297902cebe5fd9a803e79086fbe812032473f4e3175e57c',
        ReceiptCoinType: '0x90cb9a8b94284a541e0501df915ebf5a248df832d1098a8b5ce4f5d9a03c77f0::blp::BLP',
        DepositCoinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
        DepositCoinDecimals: 6,
      },
    },
  } as IDeployment,
};

export const getEmberSDK = (network: SuiNetworks, account: WalletAccount) => {
  if (network !== 'sui:mainnet') {
    throw new Error('Ember protocol is only available on sui::mainnet');
  }

  const client = new SuiClient({ url: config.rpc });

  const emberSDK = new UserCalls('mainnet', client, config.mainnet, undefined, account.address);

  return emberSDK;
};
