import { TransactionDefaultApplication, TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';
import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';

import { ObjectTransferIntention, ObjectTransferIntentionData } from './object-transfer';

export type CoreIntention = CoinTransferIntention | ObjectTransferIntention | PlainPayloadIntention;

export type CoreIntentionData = CoinTransferIntentionData | ObjectTransferIntentionData | PlainPayloadIntentionData;

export class CoreHelper implements IAppHelperInternalLegacy<CoreIntentionData> {
  application = 'msafe-core';

  supportSDK = '@mysten/sui.js' as const;

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
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    let intention: CoreIntention;
    switch (input.txSubType) {
      case TransactionSubTypes.assets.coin.send:
        intention = CoinTransferIntention.fromData(input.intentionData as CoinTransferIntentionData);
        break;
      case TransactionSubTypes.assets.object.send:
        intention = ObjectTransferIntention.fromData(input.intentionData as ObjectTransferIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
