import { SuiClient } from '@firefly-exchange/library-sui';
import { HexToUint8Array, TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { BluefinHelper } from '@/apps/bluefin/helper';
import { ClosePosition } from '@/apps/bluefin/intentions/close-position';
import { CollectFee } from '@/apps/bluefin/intentions/collect-fee';
import { CollectFeeAndRewards } from '@/apps/bluefin/intentions/collect-fee-and-rewards';
import { CollectRewards } from '@/apps/bluefin/intentions/collect-rewards';
import { OpenAndAddLiquidity } from '@/apps/bluefin/intentions/open-position-with-liquidity';
import { ProvideLiquidity } from '@/apps/bluefin/intentions/provide-liquidity';
import { RemoveLiquidity } from '@/apps/bluefin/intentions/remove-liquidity';
import TxBuilder from '@/apps/bluefin/tx-builder';
import { BluefinIntentionData, TransactionSubType } from '@/apps/bluefin/types';

import { TestSuite } from './testSuite';

describe('Bluefin App', () => {
  it('Test `OpenAndAddLiquidity` intention serialization', () => {
    const intention = OpenAndAddLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5e6,
        isCoinA: true,
        maxAmountTokenA: 0.5e6,
        maxAmountTokenB: 0.5e6,
      },
      action: TransactionSubType.OpenAndAddLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"OpenAndAddLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"maxAmountTokenA":500000,"maxAmountTokenB":500000,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","tokenAmount":500000,"upperTick":2}}',
    );
  });

  it('Test `ProvideLiquidity` intention serialization', () => {
    const intention = ProvideLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5,
        isCoinA: true,
        slippage: 0.025,
      },
      action: TransactionSubType.ProvideLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"ProvideLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
    );
  });

  it('Test `RemoveLiquidity` intention serialization', () => {
    const intention = RemoveLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5,
        isCoinA: true,
        slippage: 0.025,
      },
      action: TransactionSubType.RemoveLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"RemoveLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
    );
  });

  it('Test `ClosePosition` intention serialization', () => {
    const intention = ClosePosition.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.ClosePosition,
    });
    expect(intention.serialize()).toBe(
      '{"action":"ClosePosition","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectFee` intention serialization', () => {
    const intention = CollectFee.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectFee,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectFee","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectRewards` intention serialization', () => {
    const intention = CollectRewards.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectRewards,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  it('Test `CollectFeeAndRewards` intention serialization', () => {
    const intention = CollectFeeAndRewards.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      },
      action: TransactionSubType.CollectFeeAndRewards,
    });
    expect(intention.serialize()).toBe(
      '{"action":"CollectFeeAndRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
    );
  });

  describe('Deserialization', () => {
    const testWallet: WalletAccount = {
      address: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
      publicKey: HexToUint8Array('03490bfb7d9075281e00a98614abf162c76bc89be51c25d6cacd3005c2420ff209'),
      chains: [SUI_MAINNET_CHAIN],
      features: [],
    };

    const helper = new BluefinHelper();
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });

    it('Deserialize OpenPositionAndProvideLiquidity transaction', async () => {
      const unresolvedTx = await TxBuilder.openPositionAndAddLiquidity(
        {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          lowerTick: -1000,
          upperTick: 32000,
          tokenAmount: 0.5e6,
          isCoinA: true,
          maxAmountTokenA: 0.5e6,
          maxAmountTokenB: 0.5e6,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx } as any);

      expect(JSON.stringify(data)).toBe(
        `{"txType":"Other","txSubType":"OpenAndAddLiquidity","intentionData":{"txbParams":{"pool":"0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f","lowerTick":-1000,"upperTick":32000,"tokenAmount":"500000","maxAmountTokenA":"500000","maxAmountTokenB":"500000","isTokenAFixed":true},"action":"OpenAndAddLiquidity"}}`,
      );
    });
  });

  describe('Bluefin core main flow', () => {
    const testWallet: WalletAccount = {
      address: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
      publicKey: HexToUint8Array('03490bfb7d9075281e00a98614abf162c76bc89be51c25d6cacd3005c2420ff209'),
      chains: [SUI_MAINNET_CHAIN],
      features: [],
    };

    const helper = new BluefinHelper();

    let ts: TestSuite<BluefinIntentionData>;

    beforeEach(() => {
      ts = new TestSuite(testWallet, 'sui:mainnet', helper);
    });

    it('build open position and provide liquidity transaction', async () => {
      ts.setIntention({
        txType: TransactionType.Other,
        txSubType: TransactionSubType.OpenAndAddLiquidity,
        intentionData: {
          action: TransactionSubType.OpenAndAddLiquidity,
          txbParams: {
            pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
            lowerTick: 1000,
            upperTick: 2000,
            tokenAmount: 0.05e6,
            isCoinA: true,
            maxAmountTokenA: 0.05e6,
            maxAmountTokenB: 0.05e6,
          },
        },
      });

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.blockData.sender).toBe(testWallet.address);
      expect(txb.tx.blockData.version).toBe(1);
    });
  });
});
