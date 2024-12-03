import { HexToUint8Array, TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';
import { CoreIntentionData, CoreHelper } from '@/apps/msafe-core/helper';
import { ObjectTransferIntention, ObjectTransferIntentionData } from '@/apps/msafe-core/object-transfer';

import { Account } from './config';
import { TestSuiteLegacy } from './testSuite';

const COIN_TRANSFER_TEST_INTENTION_DATA = {
  amount: '1000',
  coinType: '0x2::sui::SUI',
  recipient: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
} as CoinTransferIntentionData;

const OBJECT_TRANSFER_TEST_INTENTION_DATA = {
  objectType: '0x2::coin::Coin<0x2::sui::SUI>',
  objectId: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
  receiver: '0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66',
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
        network: 'sui:devnet',
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

  describe('Object transfer', () => {
    // because ObjectTransferIntention build will check if object exists in mainnet
    // so here will throw error: Object not found
    it('build throw error', async () => {
      expect(async () => {
        await ts.appHelper.build({
          network: 'sui:devnet',
          txType: TransactionType.Assets,
          txSubType: TransactionSubTypes.assets.object.send,
          suiClient: new SuiClient({ url: getFullnodeUrl('mainnet') }),
          account: Account,
          intentionData: OBJECT_TRANSFER_TEST_INTENTION_DATA,
        });
      }).rejects.toThrow('Object not found');
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
});
