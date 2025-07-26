// please fix this test case

import { SuiClient } from '@firefly-exchange/library-sui';
import { HexToUint8Array } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { BluefinHelper } from '@/apps/bluefin/helper';
import TxBuilder from '@/apps/bluefin/tx-builder';
import { BluefinIntentionData } from '@/apps/bluefin/types';

import { TestSuite } from './testSuite';

describe('Bluefin App', () => {
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

  it.only('should deserialize and build 7k aggregator swap transaction', async () => {
    const unresolvedTx = await TxBuilder.aggregator7KSwap(
      {
        tokenIn: {
          address: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
          decimals: 6,
        } as any,
        tokenOut: { address: '0x2::sui::SUI' } as any,
        amountIn: '1',
        maxSlippage: '1',
      },
      testWallet,
      'sui:mainnet',
    );

    const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));

    // console.log(JSON.stringify(resolvedTx.getData()));

    const appContext = {
      txParams: {
        tokenIn: {
          address: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
          decimals: 6,
        },
        tokenOut: { address: '0x2::sui::SUI' },
        amountIn: '1',
        maxSlippage: '1',
      },
    };

    const intentionData = await helper.deserialize({ transaction: resolvedTx, appContext } as any);

    ts.setIntention(intentionData);

    const txb = await ts.voteAndExecuteIntention();

    expect(txb).toBeDefined();
    expect(txb.tx.getData().sender).toBe(testWallet.address);
    expect(txb.tx.getData().version).toBe(2);
  });
});
