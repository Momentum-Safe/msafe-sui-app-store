import { WalletAccount } from '@iota/wallet-standard';
import { TransactionDefaultApplication, TransactionSubTypes, TransactionType } from '@msafe/iota-utils';

import { MSafeAppHelper } from '@/apps/interface';
import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';
import { IotaClient } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';

import { ObjectTransferIntention, ObjectTransferIntentionData } from './object-transfer';
import { PlainPayloadIntention, PlainPayloadIntentionData } from './plain-payload';

export type CoreIntention = CoinTransferIntention | ObjectTransferIntention | PlainPayloadIntention;

export type CoreIntentionData = CoinTransferIntentionData | ObjectTransferIntentionData | PlainPayloadIntentionData;

export class CoreHelper implements MSafeAppHelper<CoreIntentionData> {
  application: string;

  constructor() {
    this.application = TransactionDefaultApplication;
  }

  deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: CoreIntentionData }> {
    throw new Error('MSafe core transaction intention should be build from API');
  }

  async build(input: {
    intentionData: CoreIntentionData;
    txType: TransactionType;
    txSubType: string;
    client: IotaClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { client, account } = input;
    let intention: CoreIntention;
    switch (input.txSubType) {
      case TransactionSubTypes.assets.coin.send:
        intention = CoinTransferIntention.fromData(input.intentionData as CoinTransferIntentionData);
        break;
      case TransactionSubTypes.assets.object.send:
        intention = ObjectTransferIntention.fromData(input.intentionData as ObjectTransferIntentionData);
        break;
      case TransactionSubTypes.others.plain:
        intention = PlainPayloadIntention.fromData(input.intentionData as PlainPayloadIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ client, account });
  }
}
