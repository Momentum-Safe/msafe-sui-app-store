import { StreamEventType, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';
import { SuiNetworks } from '@/types';

import { CreateStreamIntention, CreateStreamIntentionData } from './create-stream';

export type MPayIntention = CreateStreamIntention;

export type MPayIntentionData = CreateStreamIntentionData;

export class MPayAppHelper implements MSafeAppHelper<MPayIntention, MPayIntentionData> {
  application: string;

  constructor() {
    this.application = 'mpay';
  }

  deserialize(input: SuiSignTransactionBlockInput): CreateStreamIntention {
    console.log('🚀 ~ MPayHelper ~ deserialize ~ input:', input);
    throw new Error('Invalid transaction');
  }

  async build(input: {
    intentionData: MPayIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { network, intentionData, suiClient, account } = input;
    let intention: MPayIntention;
    switch (input.txSubType) {
      case StreamEventType.Create:
        intention = CreateStreamIntention.fromData(intentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ network, suiClient, account });
  }
}
