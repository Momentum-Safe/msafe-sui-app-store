import { HexToUint8Array, TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';
import { CoreIntentionData, CoreHelper } from '@/apps/msafe-core/helper';
import { ObjectTransferIntention, ObjectTransferIntentionData } from '@/apps/msafe-core/object-transfer';
import { appHelpers } from '@/index';

import { Account } from './config';
import { TestSuiteLegacy } from './testSuite';

const COIN_TRANSFER_TEST_INTENTION_DATA = {
  amount: '1000',
  coinType: '0x2::sui::SUI',
  recipient: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
} as CoinTransferIntentionData;

const OBJECT_TRANSFER_TEST_INTENTION_DATA = {
  // test coin item (regard it as an object)
  objectType: '0x2::coin::Coin<0x2::sui::SUI>',
  objectId: '0xe8de48fb010e97fa763b0b653f9208bc36a3808819284f4344b8219493cfe739',
  receiver: '0xa9743028e574b7abe4f0af88b08eb5a700a34ea3b1adc667d8d67dcdfa2b5233',
} as ObjectTransferIntentionData;

describe('MSafe Core main flow', () => {
  const testWallet: WalletAccount = {
    address: '0x95a98f0acbd5b5dc446d01f8b477e2f59f57b43d5f6bc3c68be4fd31ebfb12cd',
    publicKey: HexToUint8Array('76491b011bf1f90d253076e64a4b7e583b85b939b74d8f3a529b1c9d6a1bc72c'),
    chains: [SUI_MAINNET_CHAIN],
    features: [],
  };
  let ts: TestSuiteLegacy<CoreIntentionData>;

  beforeEach(() => {
    ts = new TestSuiteLegacy(testWallet, 'sui:mainnet', new CoreHelper());
  });

  describe('Coin transfer', () => {
    it('build throw error', async () => {
      const txb = await ts.appHelper.build({
        network: 'sui:mainnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubTypes.assets.coin.send,
        suiClient: new SuiClient({ url: getFullnodeUrl('mainnet') }),
        account: Account,
        intentionData: COIN_TRANSFER_TEST_INTENTION_DATA,
      });
      expect(async () => {
        await ts.signAndSubmitTransaction({ txb });
      }).rejects.toThrow('MSafe core transaction intention should be build from API');
    });

    it('Test intention serialization', () => {
      const intention = CoinTransferIntention.fromData({
        recipient: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
        coinType: '0x2::sui::SUI',
        amount: '100',
      });

      expect(intention.serialize()).toBe(
        '{"amount":"100","coinType":"0x2::sui::SUI","recipient":"0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66"}',
      );
    });

    it('Coin transfer build', async () => {
      ts.setIntention({
        intentionData: {
          recipient: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
          coinType: '0x2::sui::SUI',
          amount: '100',
        } as CoinTransferIntentionData,
        txType: TransactionType.Assets,
        txSubType: TransactionSubTypes.assets.coin.send,
      });
      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.txb.blockData.sender).toBe(testWallet.address);
      expect(txb.txb.blockData.version).toBe(1);
    });
  });

  describe('Gas fee balance check', () => {
    it('transaction build gas fee balance check', async () => {
      const insufficientBalanceWallet: WalletAccount = {
        // this address mainnet sui balance is lower than 0.1 SUI
        address: '0x3d0861752f307fd725713bccb3308bab2ee7de20c6cb4f4606953d18f8c4be0a',
        publicKey: HexToUint8Array('247029c4869f5914da1f3d0766fcd83309c3ae15d069a959aa3da83be8165291'),
        chains: [SUI_MAINNET_CHAIN],
        features: [],
      };
      const helper = appHelpers.getAppHelper('msafe-core');

      expect(async () => {
        await helper.build({
          network: 'sui:mainnet',
          txType: TransactionType.Assets,
          txSubType: TransactionSubTypes.assets.object.send,
          clientUrl: getFullnodeUrl('mainnet'),
          account: insufficientBalanceWallet,
          intentionData: {
            objectType:
              '0x830fe26674dc638af7c3d84030e2575f44a2bdc1baa1f4757cfe010a4b106b6a::movescription::Movescription',
            objectId: '0x01ddc370b11d259ab21b147ef26dddbc385637c4646fa0bcb7f1a1c0179ee071',
            receiver: '0xa9743028e574b7abe4f0af88b08eb5a700a34ea3b1adc667d8d67dcdfa2b5233',
          } as ObjectTransferIntentionData,
        });
      }).rejects.toThrow('Insufficient gas fee');
    });
  });

  describe('Object transfer', () => {
    it('build object transfer transaction', async () => {
      const txb = await ts.appHelper.build({
        network: 'sui:devnet',
        txType: TransactionType.Assets,
        txSubType: TransactionSubTypes.assets.object.send,
        suiClient: new SuiClient({ url: getFullnodeUrl('mainnet') }),
        account: testWallet,
        intentionData: OBJECT_TRANSFER_TEST_INTENTION_DATA,
      });

      expect(txb).toBeDefined();
      expect(txb.blockData.sender).toBe(testWallet.address);
      expect(txb.blockData.version).toBe(1);
    });
  });

  it('Test intention serialization', () => {
    const intention = ObjectTransferIntention.fromData({
      receiver: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
    });

    expect(intention.serialize()).toBe(
      '{"objectId":"0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66","objectType":"0x2::coin::Coin<0x2::sui::SUI>","receiver":"0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66"}',
    );
  });
});
