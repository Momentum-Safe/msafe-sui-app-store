import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';
import { IAppHelperInternal } from '@/apps/interface/sui';

import { PsmIntention } from './intentions/psm';
import { BucketIntentionData, TransactionSubType } from './types';

export type BucketIntention = PsmIntention;

export class BucketHelper implements IAppHelperInternal<BucketIntentionData> {
  application = 'bucket';

  supportSDK = '@mysten/sui' as const;

  // TODO: Please refer to the documentation and move the `action` and `txbParams` params into the `appContext` structure.
  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    action?: string;
    txbParams?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: BucketIntentionData }> {
    console.log('Bucket helper deserialize input: ', input);
    const { txbParams, action } = input;

    return {
      txType: TransactionType.Other,
      txSubType: action,
      intentionData: {
        txbParams: { ...txbParams },
        action,
      },
    };
  }

  async build(input: {
    intentionData: BucketIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account, network } = input;

    let intention: BucketIntention;
    switch (input.txSubType) {
      case TransactionSubType.Psm:
        intention = PsmIntention.fromData(input.intentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
