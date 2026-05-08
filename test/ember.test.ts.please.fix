import { SuiClient, TransactionBlock } from '@firefly-exchange/library-sui';
import { HexToUint8Array } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { getEmberSDK } from '@/apps/ember/config';
import { EmberHelper } from '@/apps/ember/helper';
import { EmberIntentionData } from '@/apps/ember/types';

import { TestSuite } from './testSuite';

describe('Ember Protocol', () => {
  const testWallet: WalletAccount = {
    address: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
    publicKey: HexToUint8Array('03490bfb7d9075281e00a98614abf162c76bc89be51c25d6cacd3005c2420ff209'),
    chains: [SUI_MAINNET_CHAIN],
    features: [],
  };

  const gammaSUIVaultID = '0x3fe669ff41cd6ee8d9d6aa4b04d14336ac1c796800f499cb5bf321b9930d0cfe';

  const helper = new EmberHelper();
  const suiClient = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });
  let emberSDK: any;

  let ts: TestSuite<EmberIntentionData>;

  beforeEach(async () => {
    ts = new TestSuite(testWallet, 'sui:mainnet', helper);
    emberSDK = await getEmberSDK('sui:mainnet', testWallet);
  });

  it('should deserialize and build deposit asset transaction', async () => {
    const unresolvedTx = (await emberSDK.depositAsset(gammaSUIVaultID, '10000000', {
      returnTxb: true,
      sender: testWallet.address,
    })) as TransactionBlock;

    const resolvedTx = Transaction.from(await unresolvedTx.build({ client: suiClient }));

    const appContext = {
      txParams: {
        vaultID: gammaSUIVaultID,
        amount: '10000000',
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
