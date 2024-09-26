import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention, IAppHelperInternal } from '@/apps/interface/sui';
import { MSafeApps } from '@/apps/registry';
import { SuiNetworks } from '@/types';

import { Account, clientUrl } from './config';

export class EmptyAppHelper implements IAppHelperInternal<EmptyIntentionData> {
  application = 'empty';

  supportSDK = '@mysten/sui' as const;

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
    expect(res.blockData.gasConfig).toBeDefined();
    expect(res.blockData.gasConfig.payment.length).toBeGreaterThan(0);
  });

  async function buildTxbForTest() {
    const txb = new TransactionBlock();
    txb.setSender(Account.address);
    return txb;
  }

  it('deserialize', async () => {
    const mApps = MSafeApps.fromHelpers([new EmptyAppHelper()]);
    const appHelper = mApps.getAppHelper('empty');

    const txb = await buildTxbForTest();

    const { txType, txSubType, intentionData } = await appHelper.deserialize({
      transactionBlock: txb,
      chain: 'sui:devnet',
      network: 'sui:devnet',
      clientUrl,
      account: Account,
    });
    expect(txType).toBe(TransactionType.Other);
    expect(txSubType).toBe('empty subtype');
    expect(intentionData.message).toBeDefined();
    expect(intentionData.message).toBe('empty message');
  });
});
