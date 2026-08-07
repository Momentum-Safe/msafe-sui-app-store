import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention, IAppHelperInternal } from '@/apps/interface/sui';
import { MSafeApps } from '@/apps/registry';
import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { Account, clientUrl } from './config';

export class EmptyAppHelper implements IAppHelperInternal<EmptyIntentionData> {
  application = 'empty';

  supportSDK = '@mysten/sui' as const;

  // eslint-disable-next-line unused-imports/no-unused-vars
  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: EmptyIntentionData;
  }> {
    return {
      txType: TransactionType.Other,
      txSubType: 'empty subtype',
      intentionData: {
        message: 'empty message',
      },
    };
  }

  async build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: EmptyIntentionData;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const intention = EmptyIntention.fromData(input.intentionData);
    return intention.build({ suiClient: input.suiClient, account: input.account });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyIntentionData {
  message: string;
}

export class EmptyIntention extends BaseIntention<EmptyIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'empty subtype';

  constructor(public readonly data: EmptyIntentionData) {
    super(data);
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    return new Transaction();
  }

  static fromData(data: EmptyIntentionData) {
    return new EmptyIntention(data);
  }
}

describe('New interface test', () => {
  it('getAppHelper', async () => {
    const mApps = MSafeApps.fromHelpers([new EmptyAppHelper()]);
    expect(mApps.getAppHelper('empty')).toBeDefined();
  });

  it('build', async () => {
    const mApps = MSafeApps.fromHelpers([new EmptyAppHelper()]);
    const appHelper = mApps.getAppHelper('empty');

    const res = await appHelper.build({
      network: 'sui:devnet',
      txType: TransactionType.Other,
      txSubType: 'empty',
      clientUrl,
      account: Account,
      intentionData: {
        message: 'empty',
      },
    });
    const txData = res.getData();
    // Adapter returns an unresolved PTB: sender set, gas left for the caller (SDK) to fund.
    expect(txData.sender).toBe(Account.address);
    expect(txData.gasData).toBeDefined();
    expect(txData.gasData.payment).toBeNull();
    expect(txData.gasData.budget).toBeNull();
  });

  async function buildTxbForTest() {
    const txb = new Transaction();
    txb.setSender(Account.address);
    return txb;
  }

  it('deserialize', async () => {
    const mApps = MSafeApps.fromHelpers([new EmptyAppHelper()]);
    const appHelper = mApps.getAppHelper('empty');

    const txb = await buildTxbForTest();

    const { txType, txSubType, intentionData } = await appHelper.deserialize({
      // Wallet-standard still types this as legacy TransactionBlock; runtime accepts Transaction.
      transactionBlock: txb as never,
      chain: 'sui:devnet',
      network: 'sui:devnet',
      clientUrl,
      account: Account,
    });
    expect(txType).toBe(TransactionType.Other);
    expect(txSubType).toBe('empty subtype');
    const data = intentionData as EmptyIntentionData;
    expect(data.message).toBeDefined();
    expect(data.message).toBe('empty message');
  });
});
