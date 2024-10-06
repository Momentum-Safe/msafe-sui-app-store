import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';

import { PsmInIntention } from './intentions/psm-in';
import { PsmOutIntention } from './intentions/psm-out';

import { BucketIntentionData, TransactionSubType } from './types';
import { SuiNetworks } from '@/types';

export type BucketIntention = PsmInIntention
  | PsmOutIntention;

export class BucketHelper implements IAppHelperInternal<BucketIntentionData> {
  application = 'bucket-protocol';

  supportSDK = '@mysten/sui' as const;

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
      txType: TransactionType.Swap,
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
      case TransactionSubType.PsmIn:
        intention = PsmInIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.PsmOut:
        intention = PsmOutIntention.fromData(input.intentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
