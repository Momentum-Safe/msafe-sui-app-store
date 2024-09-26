import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
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
      txSubType: 'empty',
      intentionData: {
        message: 'empty',
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
    const intention = EmptyIntentionNew.fromData(input.intentionData);
    return intention.build({ suiClient: input.suiClient, account: input.account });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyIntentionData {
  message: string;
}

export class EmptyIntentionNew extends BaseIntention<EmptyIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'empty';

  constructor(public readonly data: EmptyIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    return new Transaction();
  }

  static fromData(data: EmptyIntentionData) {
    return new EmptyIntentionNew(data);
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
});
