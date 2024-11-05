import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { PsmInIntention } from './intentions/psmIn';
import { PsmOutIntention } from './intentions/psmOut';
import { Decoder } from './decoder';
import { TransactionSubType } from './types';
import { PsmIntentionData } from './api/psm';

export type BucketIntention = PsmInIntention | PsmOutIntention;

export type BucketIntentionData = PsmIntentionData;

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
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: BucketIntentionData }> {
    console.log('Bucket helper deserialize input: ', input);
    const { transaction } = input;
    const decoder = new Decoder(transaction);
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
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
