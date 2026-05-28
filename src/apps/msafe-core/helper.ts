import { TransactionDefaultApplication, TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';
import { SuiNetworks } from '@/types';

import { ObjectTransferIntention, ObjectTransferIntentionData } from './object-transfer';

export type CoreIntention = CoinTransferIntention | ObjectTransferIntention;

export type CoreIntentionData = CoinTransferIntentionData | ObjectTransferIntentionData;

export class CoreHelper implements IAppHelperInternalGrpc<CoreIntentionData> {
  application = 'msafe-core';

  supportSDK = '@mysten/sui-v2' as const;

  constructor() {
    this.application = TransactionDefaultApplication;
  }

  deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: CoreIntentionData }> {
    throw new Error('MSafe core transaction intention should be build from API');
  }

  async build(input: {
    network: SuiNetworks;
    intentionData: CoreIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { account, network, suiGrpcClient } = input;
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
    return intention.build({ suiGrpcClient, account, network });
  }
}
