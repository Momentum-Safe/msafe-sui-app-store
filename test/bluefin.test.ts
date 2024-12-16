import { SuiClient, toBigNumberStr } from '@firefly-exchange/library-sui';
import { HexToUint8Array, TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { BluefinHelper } from '@/apps/bluefin/helper';
import { ClosePosition } from '@/apps/bluefin/intentions/close-position';
import { CollectFee } from '@/apps/bluefin/intentions/collect-fee';
import { CollectRewards } from '@/apps/bluefin/intentions/collect-rewards';
import { CollectRewardsAndFee } from '@/apps/bluefin/intentions/collect-rewards-and-fee';
import { OpenAndAddLiquidity } from '@/apps/bluefin/intentions/open-position-with-liquidity';
import { ProvideLiquidity } from '@/apps/bluefin/intentions/provide-liquidity';
import { RemoveLiquidity } from '@/apps/bluefin/intentions/remove-liquidity';
import TxBuilder from '@/apps/bluefin/tx-builder';
import { BluefinIntentionData, ClosePositionIntentionData, TransactionSubType } from '@/apps/bluefin/types';

import { TestSuite } from './testSuite';

describe('Bluefin App', () => {
  it('Test `OpenAndAddLiquidity` intention serialization', () => {
    const intention = OpenAndAddLiquidity.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      lowerTick: 1,
      upperTick: 2,
      tokenAmount: toBigNumberStr(0.5, 6),
      maxAmountTokenA: toBigNumberStr(0.5, 6),
      maxAmountTokenB: toBigNumberStr(0.5, 6),
      isTokenAFixed: true,
    });
    expect(intention.serialize()).toBe(
      '{"isTokenAFixed":true,"lowerTick":1,"maxAmountTokenA":"500000","maxAmountTokenB":"500000","pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","tokenAmount":"500000","upperTick":2}',
    );
  });

  it('Test `ProvideLiquidity` intention serialization', () => {
    const intention = ProvideLiquidity.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      lowerTick: 1,
      upperTick: 2,
      tokenAmount: toBigNumberStr(0.5, 6),
      maxAmountTokenA: toBigNumberStr(0.5, 6),
      maxAmountTokenB: toBigNumberStr(0.5, 6),
      isTokenAFixed: true,
    });
    expect(intention.serialize()).toBe(
      '{"isTokenAFixed":true,"lowerTick":1,"maxAmountTokenA":"500000","maxAmountTokenB":"500000","pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","tokenAmount":"500000","upperTick":2}',
    );
  });

  it('Test `RemoveLiquidity` intention serialization', () => {
    const intention = RemoveLiquidity.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      tokenAmount: toBigNumberStr(0.5, 6),
      maxAmountTokenA: toBigNumberStr(0.5, 6),
      maxAmountTokenB: toBigNumberStr(0.5, 6),
      isTokenAFixed: true,
      collectFeeTokens: undefined,
      collectRewardTokens: undefined,
    });
    expect(intention.serialize()).toBe(
      '{"isTokenAFixed":true,"maxAmountTokenA":"500000","maxAmountTokenB":"500000","pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","tokenAmount":"500000"}',
    );
  });

  it('Test `ClosePosition` intention serialization', () => {
    const intention = ClosePosition.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
    } as ClosePositionIntentionData);

    expect(intention.serialize()).toBe(
      '{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}',
    );
  });

  it('Test `CollectFee` intention serialization', () => {
    const intention = CollectFee.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      collectFeeTokens: undefined,
      collectRewardTokens: undefined,
    });
    expect(intention.serialize()).toBe(
      '{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}',
    );
  });

  it('Test `CollectRewards` intention serialization', () => {
    const intention = CollectRewards.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      collectRewardTokens: undefined,
    });
    expect(intention.serialize()).toBe(
      '{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}',
    );
  });

  it('Test `CollectRewardsAndFee` intention serialization', () => {
    const intention = CollectRewardsAndFee.fromData({
      pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
      position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
      collectRewardTokens: undefined,
      collectFeeTokens: undefined,
    });
    expect(intention.serialize()).toBe(
      '{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}',
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

    it('Deserialize OpenPosition transaction', async () => {
      const unresolvedTx = await TxBuilder.OpenPosition(
        {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          lowerTick: -1000,
          upperTick: 32000,
          tokenAmount: toBigNumberStr(0.5, 6),
          isTokenAFixed: true,
          maxAmountTokenA: toBigNumberStr(0.5, 6),
          maxAmountTokenB: toBigNumberStr(0.5, 6),
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx } as any);

      expect(JSON.stringify(data)).toBe(
        `{"txType":"Other","txSubType":"OpenPosition","intentionData":{"pool":"0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f","lowerTick":-1000,"upperTick":32000,"tokenAmount":"500000","maxAmountTokenA":"500000","maxAmountTokenB":"500000","isTokenAFixed":true}}`,
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
    const suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });

    let ts: TestSuite<BluefinIntentionData>;

    beforeEach(() => {
      ts = new TestSuite(testWallet, 'sui:mainnet', helper);
    });

    it('build open position transaction', async () => {
      ts.setIntention({
        txType: TransactionType.Other,
        txSubType: TransactionSubType.OpenPosition,
        intentionData: {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          lowerTick: 1000,
          upperTick: 2000,
          tokenAmount: String(0.05e6),
          isTokenAFixed: true,
          maxAmountTokenA: String(0.05e6),
          maxAmountTokenB: String(0.05e6),
        },
      });

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build open position transaction', async () => {
      const unresolvedTx = await TxBuilder.OpenPosition(
        {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          lowerTick: -1000,
          upperTick: 32000,
          tokenAmount: toBigNumberStr(0.5, 6),
          isTokenAFixed: true,
          maxAmountTokenA: toBigNumberStr(0.5, 6),
          maxAmountTokenB: toBigNumberStr(0.5, 6),
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));
      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build provide liquidity transaction', async () => {
      const unresolvedTx = await TxBuilder.provideLiquidity(
        {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          position: '0xa1cb7abf8a2b40398132ebcbcf9ddcfeccf952ee31a8e87917569f0f74780f44',
          lowerTick: -4,
          upperTick: 4,
          tokenAmount: toBigNumberStr(0.5, 6),
          isTokenAFixed: false,
          maxAmountTokenA: toBigNumberStr(0.5, 6),
          maxAmountTokenB: toBigNumberStr(0.5, 6),
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));
      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build remove liquidity transaction', async () => {
      const unresolvedTx = await TxBuilder.removeLiquidity(
        {
          pool: '0xb8a66987fa26b7ed673266a30c5a5e705898b56315e0aaa914bfadb6e8726f09',
          position: '0x1f649b854865d9257d3eb7c1008c48b25a004f2bb6e755964d08054839f9d674',
          liquidity: '1500000',
          maxAmountTokenA: toBigNumberStr(0, 6),
          maxAmountTokenB: toBigNumberStr(0.001, 6),
          collectFeeTokens: undefined,
          collectRewardTokens: undefined,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));
      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build collect rewards transaction', async () => {
      const unresolvedTx = await TxBuilder.collectRewards(
        {
          pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
          position: '0xa1cb7abf8a2b40398132ebcbcf9ddcfeccf952ee31a8e87917569f0f74780f44',
          collectRewardTokens: undefined,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));

      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build collect fees transaction', async () => {
      const unresolvedTx = await TxBuilder.collectFee(
        {
          pool: '0xb8a66987fa26b7ed673266a30c5a5e705898b56315e0aaa914bfadb6e8726f09',
          position: '0x1f649b854865d9257d3eb7c1008c48b25a004f2bb6e755964d08054839f9d674',
          collectFeeTokens: undefined,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));

      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build collect rewards and fee transaction', async () => {
      const unresolvedTx = await TxBuilder.collectRewardsAndFee(
        {
          pool: '0xb8a66987fa26b7ed673266a30c5a5e705898b56315e0aaa914bfadb6e8726f09',
          position: '0x1f649b854865d9257d3eb7c1008c48b25a004f2bb6e755964d08054839f9d674',
          collectFeeTokens: undefined,
          collectRewardTokens: undefined,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));

      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });

    it('should deserialize and build close position transaction', async () => {
      const unresolvedTx = await TxBuilder.closePosition(
        {
          pool: '0xb8a66987fa26b7ed673266a30c5a5e705898b56315e0aaa914bfadb6e8726f09',
          position: '0x1f649b854865d9257d3eb7c1008c48b25a004f2bb6e755964d08054839f9d674',
          collectFeeTokens: undefined,
          collectRewardTokens: undefined,
        },
        testWallet,
        'sui:mainnet',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));
      const intentionData = await helper.deserialize({ transaction: resolvedTx } as any);

      ts.setIntention(intentionData);

      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.tx.getData().sender).toBe(testWallet.address);
      expect(txb.tx.getData().version).toBe(2);
    });
  });
});
