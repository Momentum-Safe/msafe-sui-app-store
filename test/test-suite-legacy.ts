import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';
import { NAVIAppHelper } from '@/apps/navi/helper';

export interface Intention<T> {
  txType: TransactionType;
  txSubType: string;
  intentionData: T;
}

// TestSuite used for sui.js packages
export class TestSuiteLegacy<IntentionData> {
  pendingIntention?: Intention<IntentionData>;

  constructor(
    public readonly testWalletAddress: string,
    private readonly appHelper: IAppHelperInternalLegacy<IntentionData>,
  ) {}

  // Mock signAndSubmitTransaction from dApp.
  async signAndSubmitTransaction(input: { txb: TransactionBlock; appContent?: any }): Promise<{ result: string }> {
    this.pendingIntention = await this.appHelper.deserialize(input);
    return {
      result: 'Transaction has been proposed in MSafe application, and pendingIntention is saved in msafe database',
    };
  }

  setIntention(intention: Intention<IntentionData>) {
    this.pendingIntention = intention;
  }

  // Mock the behavior other users vote for the transaction, and submit to blockchain
  async voteAndExecuteIntention(): Promise<TransactionBlock> {
    const txb = await this.appHelper.build(this.pendingIntention);
    txb.setSender(this.testWalletAddress);

    return txb;
  }
}

describe('deposit', () => {
  const ts = new TestSuiteLegacy('navi', '0x123', new NAVIAppHelper());

  it('deserialize', async () => {
    const appTxb = new TransactionBlock();

    await ts.signAndSubmitTransaction({ txb: appTxb });

    expect(ts.pendingIntention).toBeDefined();
  });

  it('build', async () => {
    ts.setIntention({} as any);
    const txb = ts.voteAndExecuteIntention();

    expect(txb).toBeDefined();
  });

  it('overall flow', async () => {
    // Mock application and user behavior
    const appTxb = new TransactionBlock();

    await ts.signAndSubmitTransaction({ txb: appTxb });
    const finalizedTxb = ts.voteAndExecuteIntention();

    expect(finalizedTxb).toBeDefined();
  });
});
